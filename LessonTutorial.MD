# Lesson Tutorial
This will cover creating a lesson.

1) Setup
2) Gather your sentences
3) Create lesson.txt which contains a structured version of your sentences
4) Run fix_furigana.py to find and possibly fix missing Furigana
5) Convert the lesson.txt into a JSON file
6) Test the lesson
7) Generate the audio
8) (Optional) Deploy as a zip file
9) Prompting ChatGPT to breakdown your sentences

## 1. Setup
In the [public/lessons](public/lessons) folder, create a new folder or select the category you want your lesson to be in. Create a new folder for the lesson.

Next, make sure you have [Python](https://www.python.org/downloads/) installed. Copy all of the .py scripts from the [public/py_scripts/](public/py_scripts/) folder into your folder.

## 2. Gathering your sentences
Start by gathering the sentences you want to use. You can gather them from a visual novel, find them online, have ChatGPT generate some, or write them yourself.

## 3. Create lesson.txt
This file contains your actual lesson data. There are two types of cards:

- Information - This is for displaying a lesson overview and giving instructions, if you want that sort of thing.
- Sentence - This is a sentence entry.

At the end of this tutorial is a prompt that can be used to have ChatGPT-4 generate a breakdown following this format so it's mostly automated.

**These must follow the formats below**.

### Information card
These cards use Markdown, and will automatically place an HTML `<br>` after singular new lines.

**@Information**  
Markdown text goes here until end-of-file or the next @Information or @Lesson.

#### Example
```
@Information
Hello, this is an information card **with bold markdown text**.

Format Furigana like this: お母(かあ)さん
```

### Sentence Card
These cards are more detailed and rely on their lines matching up. **Make sure to use the formats as shown below**.

**@Sentence**  
The Japanese sentence with spaced words and Furigana. It's very important to space out your words to match the breakdown.

**@Translation**  
The natural English translation.

**@Literal**  
The literal English translation (optional).

**@Breakdown**  
Japanese word A - Translation (type): Description  
Japanese word B - Translation (type): Description

**@Lesson**  
Markdown text goes here until end-of-file or @Lesson.

#### Example

```
@Sentence
それは何(なん)ですか？

@Translation
What is that?

@Literal
That is what?

@Breakdown
それ - That (pronoun): This pronoun is used to indicate something or someone that is not close to the speaker, nor to the listener. 

は - Topic marker (particle): This particle is used to mark the topic of a sentence. In this case, the topic of the sentence is "それ" (that).

何(なん) - What (pronoun): This is a pronoun used to ask about something. It is used to inquire about the identity, nature, or value of an object or matter.

です - Is (copula): This is a copula used to link the subject of a sentence (in this case, "それ", that) with the predicate (in this case, "何(なに)", what). It's often used in formal or neutral register and its basic function is to assert the predicate of a sentence. 

か - Question marker (particle): This particle is used at the end of a sentence to indicate that it is a question. 

@Lesson
In Japanese, the verb or verb phrase generally comes at the end of the sentence. This includes copulas like です (is). Also, the subject of the sentence often comes at the beginning. However, unlike in English, the subject can often be omitted if it's clear from the context. In the case of the sentence "それは何(なん)ですか？", the subject isn't stated, but the topic is "それ" (that). The sentence is asking about the identity or nature of "それ" (that). 

The particle は is a very fundamental part of Japanese sentence structure. It's often translated as "is" in English, but it's actually a bit more complex than that. It can be used to mark the topic of the sentence, to contrast two things, or to emphasize the subject or object. 

Finally, the particle か turns any sentence into a question. It's similar to the question mark in English, but it's a part of the sentence itself in Japanese. It's often placed at the end of the sentence.
```

### Breakdown formatting
The json conversion relies on the word to be split via ` - `, so make sure that spacing is correct. As for identifying the word type, it will use the first match in this list to determine the type, which is why having it in parenthesis can be helpful:

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

## 4. Fix Furigana
`お母(かあ)さん` will put `かあ` over `母`. The actual json/final format is much nicer and works like `お{母|かあ}さん` but because ChatGPT will typically generate in the first format, that is what's used here.

Once you've added all of it, run this command:
```
python fix_furigana.py
```

This will scan the file and report you of any missing Furigana. If you've specified it elsewhere in the file, it will use that and report entries it couldn't find.

Updates will modify lesson.txt once this is complete, so it's not a bad idea to backup your lesson.txt just in case. It's highly recommended to make sure you have Furigana on all the Kanji in the sentence and breakdown for audio generation's sake.

## 5. Convert to JSON
Once this is complete, run this command:
```
python convert.py
```

This will produce `lesson.json`.

## 6. Test the lesson
Now it's time to make sure everything is working okay. 

### Add to the homepage lessons
If you're running a local host, we'll add it to the lessons on the homepage.

Open up [public/lessons/lessons.json](public/lessons/lessons.json) and add your lesson to the list.

**The `name` and `id` field must match their respective folders!**  `title` can be whatever you want.


If you created your own category, add an entry like this:
```json
    {
      "name": "White Album",
      "color": "#00A5FF",
      "lessons": [
        { "id": "White Album - Intro", "title": "Intro" }
      ]
    }
```

If you'd like to add the lesson to a new category, add an entry to the appropriate category's `lessons`:
```json
{ "id": "White Album - Intro", "title": "Intro" }
```

### Test via zip file
You can also test your packages using the [remote hosted server](https://vnlike.org/sentsei/). Simply zip up all the contents of your lesson.

**Note:** Zip up the contents of the lesson, not the folder. The `lesson.json` file should exist in the root of the zip archive.

## 7. Audio generation
### Using NaturalReader
I recommend using [NaturalReader](https://www.naturalreaders.com/) to generate the voice lines. All of the timings in the later scripts use this method, so if you use something else, then you'll have to adjust the silence ranges.

#### 1. Run `audio_part1.py`
This will copy the sentence text to your clipboard like this:
```
Normal:
それ わ なん です か？。っ。っ。っ。
なに が すき です か？。っ。っ。っ。
なに が たべたい です か？。っ。っ。っ。

Slow:
それ。は。なん。です。か？。っ。っ。っ。
なに。が。すき。です。か？。っ。っ。っ。
なに。が。たべたい。です。か？。っ。っ。っ。
```

You'll do two passes (do not include the "Normal" or "Slow" text):
1. Paste all of the `Normal` lines into the box. Download the mp3 as `sentences.mp3`
2. Paste all of the `Slow` lines into the box. Download the mp3 as `slow.mp3`

These files go in the same directory as your python scripts.

#### 2. Run `audio_part2.py`
This will clip sentences.mp3 into its respective lines.

#### 3. Run `audio_part3.py`
This will clip slow.mp3 into its respective lines.

#### 4. Run `audio_part4.py`
This will cut out the words from the slow sentences and rely on the lesson.json file to match them up.

Assuming everything lined up, you should get no warnings in the terminal. If you do, there's likely a word/sentence mismatch somewhere and it'll let you know where.

### Other text-to-speech synthesis
Audio playback matches the json sentence `audio` and `audio_slow` fields to find the mp3 files to play in `audio/` and `audio/mid_speed/` respectively. Words are based on the Hiragana that make up a word. If a word has Kanji, they're replaced by the Furigana. These files are located in `audio/words/`.

You can generate all this stuff manually, but that's tedious and error-prone. The best solution is to adjust the audio script silent range timings to your needs. This automatically detects silent ranges between sentences and words and then will use their index occurrence to map them.

### は pronunciation
Isolated は is hardcoded to be pronounced as "wa". The file for this is at [public/lessons/は.mp3](public/lessons/は.mp3).

You can change this if you want by replacing this line in the `convert.py` script:

```py
audio = replace_kanji_with_furigana(japanese).replace('、', '').replace('…','').replace(' は ', ' わ ')
```

## 8. Deployment
Assuming everything is working okay, you're done! If you wish to share this lesson with others, there are 2 options:

1. Open up a pull request with your lesson and I'll add it to the main site
2. Distribute your lesson as a zip file.

Note that you don't need to include the python scripts, sentences.mp3, slow.mp3, or lesson.txt. Audio is also not required.

### Zip distribution
Simply zip up all the contents of your lesson using the built-in Windows zip functionality, WinRAR, 7zip, or your preferred utility.

**Note:** Zip up the contents of the lesson, not the folder. The `lesson.json` file should exist in the root of the zip archive. It should look like this:
```
- lesson.json
- audio/
```

## 9. ChatGPT for prompting
ChatGPT-4 can do a great job at breaking down sentences. **Don't use ChatGPT-3.5.**

The best results come from using the new `Custom instructions` feature. Put this in the first box:
```
I'm an English/Japanese speaker and am creating resources for helping to teach Japanese to absolute beginners. My goal is to provide redundant examples and breakdowns to help people learn that way instead.
```

Put this in the second box:
```
I'm going to provide a sentence to break down. I'd like you to break down a specified Japanese sentence into English for absolute beginners in this format:

@Sentence
Break the Japanese sentence into words and spaces. For kanji, provide its furigana. For example お母さん becomes お母(かあ)さん

@Translation
A contextual English translation of the sentence.

@Literal
A literal broken-English translation of the sentence. For example, "まあ、 早(はや)い ところ 済(す)ませ ちゃおう。" would be "Well, quickly finish let's do."

@Breakdown
A thorough breakdown of each word that's structured like this:
<word> - <Translation/Description> (<type>): <Detailed explaination>. For example:
を - Object marker (particle): This particle is used to mark the direct object of a verb. In this case, the object of the action (which is "愛しました", loved) is "人の心" (people's hearts). Note that this is different from the topic of the sentence, which is "彼" (he).

@Lesson
Any information that would be useful for beginners to learn - brief grammar lessons, etc.

When giving the word breakdown, label each word as one of the following: noun, pronoun, verb, adjective, adverb, particle, interjection, conjunction, auxiliary verb, counter, copula, onomatopoeia.

When labeling a word as an adjective or verb, please also specify what kind of verb/adjective it is (like kuru verb, i adjective, and so on).
```

Now you can just provide it with a sentence and it will generate the breakdown in the appropriate format. Feel free to modify the prompt of course.

**Note:** It often gets the sentence spacing wrong. The convert.py script will try to reconstruct a mismatched sentence/breakdown based on the breakdown, but it doesn't always work, so make sure you pay attention to the outputs.
