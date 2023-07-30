import json
from pydub import AudioSegment
from pydub.silence import split_on_silence
import os

# Load the audio file
audio = AudioSegment.from_mp3("sentences.mp3")

out_dir = './audio'

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

# Load the JSON file
with open("lesson.json", "r", encoding="utf-8") as read_file:
    data = json.load(read_file)

chunks = split_on_silence(audio, min_silence_len=1500, silence_thresh=-40)

# Iterate through both chunks and json entries
json_index = 0
chunk_index = 0

while json_index < len(data) and chunk_index < len(chunks):
    # If the json entry has an audio field
    if "audio" in data[json_index]:
        # Save the audio chunk
        chunks[chunk_index].export(f"audio/{data[json_index]['audio'].replace(' ', '')}.mp3", format="mp3")
        chunk_index += 1
    json_index += 1

# If there are remaining audio chunks or json entries
if json_index != len(data) or chunk_index != len(chunks):
    print("Warning: Number of audio segments and json entries with 'audio' do not match.")
