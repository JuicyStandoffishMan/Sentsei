import os
import json
from pydub import AudioSegment
from pydub.silence import split_on_silence
import re
import shutil

def replace_kanji_with_furigana(sentence):
    # Matches {kanji|furigana} in the sentence
    matches = re.findall(r'\{(.*?)\|(.*?)\}', sentence)
    
    # Replaces kanji with furigana for each match
    for kanji, furigana in matches:
        sentence = sentence.replace(f"{{{kanji}|{furigana}}}", furigana)
    
    return sentence

def process_audio():
    # Load JSON file
    with open('lesson.json', 'r', encoding="utf-8") as file:
        data = json.load(file)

    words_dir = './audio/words'
    recomposed_dir = './audio/mid_speed'
    
    if not os.path.exists(words_dir):
        os.makedirs(words_dir)
    if not os.path.exists(recomposed_dir):
        os.makedirs(recomposed_dir)

    ha_audio = AudioSegment.from_mp3('../../は.mp3')

    # Iterate through each entry in the JSON file
    for entry in data:
        if 'audio_slow' in entry:
            # Get audio_slow and breakdown from the entry
            audio_slow = entry['audio_slow']
            breakdown = entry['breakdown']

            # Generate the path to the audio_slow.mp3 file
            audio_slow_path = f"./audio/slow/{audio_slow}.mp3"

            if os.path.exists(audio_slow_path):
                # Load audio
                audio = AudioSegment.from_mp3(audio_slow_path)

                # Split audio on silence
                chunks = split_on_silence(audio, min_silence_len=500, silence_thresh=-40)

                if len(chunks) >= len(breakdown):
                    # Map breakdown indices to audio chunks
                    breakdown_audio = {word: chunks[i] for i, word in enumerate(breakdown)}

                    # Write each breakdown audio chunk to a separate .mp3 file
                    for word, chunk in breakdown_audio.items():
                        output_path = f"{words_dir}/{replace_kanji_with_furigana(word.split('*')[0])}.mp3"
                        
                        if not os.path.exists(output_path):
                            chunk.export(output_path, format="mp3")

                    # Recompose audio with 250ms silence gap between chunks
                    silence = AudioSegment.silent(duration=350)
                    recomposed_audio = chunks[0]
                    chunk_index = 0
                    for word, chunk in breakdown_audio.items():
                        chunk_index += 1
                        if chunk_index == 1:
                            continue
                        if word.split('*')[0] == 'は':
                            recomposed_audio += silence + ha_audio
                        else:
                            recomposed_audio += silence + chunk
                    
                    recomposed_audio.export(f"{recomposed_dir}/{audio_slow}.mp3", format="mp3")
                    
                else:
                    print(f'Warning: more words in breakdown than audio segments for {audio_slow_path}')
            else:
                print(f'Warning: {audio_slow_path} does not exist')


    # Finally, copy ../../は.mp3 into words_dir
    if os.path.exists('../../は.mp3'):
        shutil.copy('../../は.mp3', words_dir)


# Run the function
process_audio()