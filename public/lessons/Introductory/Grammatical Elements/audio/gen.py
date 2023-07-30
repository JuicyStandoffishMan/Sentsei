import os
import json
import regex
from pydub import AudioSegment
from pydub.silence import detect_nonsilent
from bark import SAMPLE_RATE, generate_audio, preload_models
from scipy.io.wavfile import write as write_wav

def replace_kanji_with_furigana(sentence):
    pattern = r"(\p{Script=Han}+)\((.*?)\)"
    def replace(match):
        return match.group(2)

    return regex.sub(pattern, replace, sentence).replace(' ', '')

# Open JSON file
with open('../full.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Download and load all models - this only needs to be done once per session
preload_models()

# For each sentence in JSON
for entry in data:
    sentence = entry['japanese']
    
    # Replace the Kanji with Furigana
    furi = replace_kanji_with_furigana(sentence)
    
    wav_file_name = f"{sentence}.wav"
    mp3_file_name = f"{sentence}.mp3"
    
    # Check if the mp3 file does not exist
    if not os.path.isfile(mp3_file_name):
        print(f"Generating audio for: {sentence}")
        # Generate audio from text
        audio_array = generate_audio(furi, history_prompt="v2/ja_speaker_4")
        
        # Save audio to disk as wav
        write_wav(wav_file_name, SAMPLE_RATE, audio_array)
        
        # Load the audio for trimming
        sound = AudioSegment.from_wav(wav_file_name)

        # Define parameters for silence
        silence_threshold = -50
        min_silence_len = 100

        # Define parameters for silence
        silence_threshold = -50
        min_silence_len = 100

        # Detect non-silent sections
        non_silent_ranges = detect_nonsilent(sound, min_silence_len=min_silence_len, silence_thresh=silence_threshold)

        # If non-silent sections were found, trim the beginning and end silence
        if non_silent_ranges:
            end_trim = len(sound)  # default to full length of sound
            for i in range(len(non_silent_ranges)-1):
                silence_gap = non_silent_ranges[i+1][0] - non_silent_ranges[i][1]
                if silence_gap > 1000:  # if silence is more than 1 sec
                    end_trim = non_silent_ranges[i][1]  # cut at the end of this non-silent range
                    break
            start_trim = non_silent_ranges[0][0]
            trimmed_sound = sound[start_trim:end_trim]
        else:
            trimmed_sound = sound
        
        # Convert trimmed wav to mp3
        trimmed_sound.export(mp3_file_name, format="mp3", bitrate="128k")

        # Remove the wav file after successful conversion
        os.remove(wav_file_name)
