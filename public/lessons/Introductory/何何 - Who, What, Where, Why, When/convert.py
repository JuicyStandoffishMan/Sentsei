import json
import re
import os

import re

def replace_kanji_with_furigana(sentence):
    # Matches {kanji|furigana} in the sentence
    matches = re.findall(r'\{(.*?)\|(.*?)\}', sentence)
    
    # Replaces kanji with furigana for each match
    for kanji, furigana in matches:
        sentence = sentence.replace(f"{{{kanji}|{furigana}}}", furigana)
    
    return sentence


def convert_format(source):
    # Matches a pair of Kanji and Furigana enclosed in parentheses
    pattern = r'([一-龯]+)\(([ぁ-んァ-ン]+)\)'  
    replacement = r'{\1|\2}'
    destination = re.sub(pattern, replacement, source)
    return destination

# noun, pronoun, verb, adjective, adverb, particle, interjection, conjunction, auxiliary verb, counter, copula, onomatopoeia
import re

def get_type(data):
    types = {
        'noun': ['noun', 'nouns'],
        'pronoun': ['pronoun', 'pronouns', 'interrogative'],
        'adverb': ['adverb', 'adverbs', 'na-adverb', 'na-adverbs', 'i-adverb', 'i-adverbs'],
        'auxiliary verb': ['auxiliary verb', 'auxiliary verbs'],
        'verb': ['verb', 'verbs', 'godan verb', 'godan verbs', 'ichidan verb', 'ichidan verbs', 'irregular verb', 'irregular verbs', 'suru verb', 'suru verbs', 'kuru verb', 'kuru verbs'],
        'adjective': ['adjective', 'adjectives', 'na-adjective', 'na-adjectives', 'i-adjective', 'i-adjectives'],
        'particle': ['particle', 'particles'],
        'interjection': ['interjection', 'interjections'],
        'conjunction': ['conjunction', 'conjunctions'],
        'counter': ['counter', 'counters'],
        'copula': ['copula', 'copulas'],
        'onomatopoeia': ['onomatopoeia', 'onomatopoeias'],
        'mimetic': ['mimetic word', 'mimetic']
    }

    string = data.lower()

    matches = []
    # For each type in the types dictionary
    for type_ in types.keys():
        # For each keyword associated with that type
        for keyword in types[type_]:
            # If the keyword is in the string
            match = re.search(r'\b' + keyword + r'\b', string)
            if match:
                matches.append((match.start(), type_))  # Append the match's start index and the type
    
    if matches:
        # Sort the matches by the starting index and return the type of the first match
        matches.sort(key=lambda x: x[0])
        return matches[0][1]
    
    return ''

def parse_sentence_block(japanese_block, english_block, literal_block, breakdown_block, lesson_block):
    japanese = re.sub(' +', ' ', japanese_block[0].replace('、', '、 ').strip())
    english = english_block.strip()
    literal = literal_block.strip() if literal_block else ''
    breakdown = breakdown_block.split('\n')
    japanese = convert_format(japanese)
    breakdown_dict = {}
    lesson_block = convert_format(lesson_block)
    index = 0
    for line in breakdown:
        if " - " in line:
            key, value = line.split(' - ', 1)
            breakdown_dict[convert_format(key.strip()) + "*" + str(index) + "*"] = convert_format(value.strip()) + '||' + get_type(key.strip() + " " + value.strip())
            index += 1

    if len(japanese.split(' ')) != len(breakdown_dict):
        # print(f'Warning: Mismatch for sentence {japanese}/{english}')
        # Generate a new sentence with the breakdown
        new_japanese = ''
        num_keys = len(breakdown_dict.keys())
        for word in breakdown_dict.keys():
            new_japanese = new_japanese + word.split('*')[0]
            num_keys -= 1
            if num_keys > 0:
                new_japanese = new_japanese + ' '
        
        new_japanese = new_japanese.strip()
            
        if japanese.endswith('。'):
            new_japanese = new_japanese + '。'
        elif japanese.endswith('？') and not new_japanese.endswith('？'):
            new_japanese = new_japanese + '？'
        elif japanese.endswith('！') and not new_japanese.endswith('！'):
            new_japanese = new_japanese + '！'
        
        if '、' in japanese:
            print(f'Warning: Mismatch for sentence {japanese}/{english}')
        else:
            japanese = new_japanese

    audio = replace_kanji_with_furigana(japanese).replace('、', '').replace('…','').replace(' は ', ' わ ')
    audio_slow = replace_kanji_with_furigana(japanese).replace('、', '').replace('…','').replace(' ', '。')

    return {
        'japanese': japanese,
        'english': english,
        'literal': literal,
        'audio': audio,
        'audio_slow': audio_slow,
        'breakdown': breakdown_dict,
        'lesson': re.sub(r'(?<=\n)\n(?=\n)', '  \n', lesson_block).strip()
    }

def parse_text_file(file_path):
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Split the content by '@Information' or '@Sentence'
    blocks = re.split(r'(@Information|@Sentence)', content)

    # Initialize empty list to hold all entries
    entries = []

    # Process each block
    for i in range(1, len(blocks), 2):
        delimiter = blocks[i]
        block = blocks[i+1].strip()

        # Determine block type
        block_type = 'information' if delimiter == '@Information' else 'sentence'

        if block_type == 'information':
            # If the block is of type 'information', store the content
            block = convert_format(block.replace('\n', '  \n'))  # Add two spaces before each line break
            entry = {
                'type': 'information',
                'content': block
            }
        else:
            # If the block is of type 'sentence', parse the sentence block
            literal_block = ''
            if not "@Translation" in block:
                block = block + "@Translation"
            if not "@Literal" in block:
                block = block + "@Literal"
            if not "@Breakdown" in block:
                block = block + "@Breakdown"
            if not "@Lesson" in block:
                block = block + "@Lesson"
            [block, lesson_block] = block.split('@Lesson')
            [block, translation_block] = block.split('@Translation')
            if '@Literal' in translation_block:
                [translation_block, literal_block] = translation_block.split('@Literal')
                [literal_block, breakdown_block] = literal_block.split('@Breakdown')
            else:
                [translation_block, breakdown_block] = translation_block.split('@Breakdown')
            block = block.split('\n')
            entry = {
                'type': 'sentence',
                **parse_sentence_block(block, translation_block, literal_block, breakdown_block, lesson_block)
            }

        entries.append(entry)

    return entries

def write_to_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)



if __name__ == '__main__':
    file_path = 'lesson.txt'
    entries = parse_text_file(file_path)
    write_to_json(entries, 'lesson.json')
    print(f'Converted {file_path} to JSON')

