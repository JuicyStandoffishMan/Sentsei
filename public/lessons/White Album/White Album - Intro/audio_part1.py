import os
import json
from pydub import AudioSegment
from pydub.silence import split_on_silence
import re
import clipboard

def process_audio():
    # Load JSON file
    with open('lesson.json', 'r', encoding="utf-8") as file:
        data = json.load(file)

    result_normal = ''
    result_slow = ''

    # Iterate through each entry in the JSON file
    for entry in data:
        if 'audio' in entry:
            result_normal = result_normal + entry['audio'] + '。っ。っ。っ。\n'
            result_slow = result_slow + entry['audio_slow'] + '。っ。っ。っ。\n'

    result = 'Normal:\n' + result_normal + '\nSlow:\n' + result_slow
    clipboard.copy(result)

# Run the function
process_audio()