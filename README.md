# [Sentsei - Live Web Version](https://vnlike.org/sentsei/)

This is a web application that visualizes Japanese sentence breakdowns for helping beginners learn the language.

![sentsei.png](sentsei.png)

## Features
- Normal, slow, and individual word audio playback
- Splitting and highlighting words
- Color coded type labeling (noun, verb, etc.)
- Furigana
- Markdown informational pages for lessons/info
- Multiple lessons
- Spoilery proper and literal translation
- Support for loading in local lessons via the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- Layout optimized for both desktop and mobile

## What is this?
There are a hundred and one resources for learning Japanese. For me, the best way to learn has been to see sentence breakdowns.

And while you can certainly find a plethora of side-by-side sentence and word translations, a lot of material will break down new concepts and assume the reader is familiar with other things. Or maybe they don't have audio playback of the sentence or its words. Or maybe the breakdown just isn't clear enough.

This project doesn't solve that - it's merely a set of tools to enable a rich interface that enables all of the above. There are some lessons and breakdowns generated by ChatGPT-4 though, and it does a pretty good job for simple stuff. So if you want to create a lesson or import your own sentences, see [the lesson tutorial](LessonTutorial.MD).

## Creating your own lessons
### Loading lessons locally
On the homepage, just click "Select Local" at the top and open &lt;lesson&gt;.zip. Make sure it contains lesson.json and optionally an Audio folder with the selected works. There's more info in the tutorial.

**Note**: This uses the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API), which is not supported by Firefox or on Android. There's probably a better solution out there.

### Contributing lessons
If you want to contribute one that you've made, please open a pull request.

### [Lesson Tutorial](LessonTutorial.MD)
