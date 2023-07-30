# define the list of known particles
import json
import string
import clipboard

particles = ["は", "が", "を", "に", "へ", "と", "から", "より", "で", "も", "や", "か", "な", "の"]

# define lists to hold the various types of words
kanji_words = []
words = []
particle_list = []

# List of common Japanese punctuations
punctuation = ["。", "、", "「", "」", "『", "』", "（", "）", "…", "・", "！", "？", "：", "；", "ー"]

# Function to check if character is kanji
def is_kanji(ch):
    return 0x4E00 <= ord(ch) <= 0x9FFF

# Load the JSON file
with open("lesson.json", "r", encoding="utf-8") as read_file:
    data = json.load(read_file)

# Iterate through both chunks and json entries
json_index = 0
chunk_index = 0

while json_index < len(data):
    # If the json entry has an audio field
    if "japanese" in data[json_index]:
        words_in_sentence = data[json_index]["japanese"].split(" ")
        for word in words_in_sentence:
            # If the word is a particle
            if word in particles:
                particle_list.append(word)
            # If any of the characters in the word is a kanji
            elif any(is_kanji(ch) for ch in word):
                kanji_words.append(word)
            # If the word is a word
            else:
                # Remove punctuation
                for p in punctuation:
                    word = word.replace(p, "")
                
                # Remove empty spaces
                word = word.strip()
                # If the word is not empty
                if word != "":
                    words.append(word)
        
    json_index += 1

# remove duplicate
words = list(set(words))
particle_list = list(set(particle_list))
kanji_words = list(set(kanji_words))

unique_kanji = set()

for word in kanji_words:
    for char in word:
        if '\u4e00' <= char <= '\u9faf':  # This is the unicode range for kanji
            unique_kanji.add(char)

# Convert the set back to a list if needed
unique_kanji_list = list(unique_kanji)

result = ''
result = result + "Particles: " + str(particle_list) + "\n"
result = result + "Words: " + str(words) + "\n"
result = result + "Kanji Words: " + str(kanji_words) + "\n"
result = result + "Unique Kanji: " + str(unique_kanji_list) + "\n"

total_words = len(words) + len(kanji_words)
result = result + "Total words: " + str(total_words) + "\n"

clipboard.copy(result)

# Generate markdown text
md_text = ""

md_text += f"## Particles: {len(particle_list)}\n"
for particle in particle_list:
    md_text += f"- {particle}\n"

md_text += "\n"

md_text += f"## Words: {len(words)}\n"
for word in words:
    md_text += f"- {word}\n"

md_text += "\n"

md_text += f"## Kanji Words: {len(kanji_words)} ({len(unique_kanji_list)} unique Kanji)\n"
for kanji_word in kanji_words:
    md_text += f"- {kanji_word}\n"

#md_text += "\n"

#md_text += f"## Unique Kanji: {len(unique_kanji_list)}\n"
#for unique_kanji in unique_kanji_list:
#    md_text += f"- {unique_kanji}\n"

# Copy to clipboard
clipboard.copy(md_text)