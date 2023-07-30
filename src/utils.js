
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

export const typeToColor = (type) => {
  const s = 90;
  const l = 50;

  // Create a map of word types to colors
  const colors = {
    "noun" : 0,
    "pronoun" : 1,
    "verb" : 2,
    "adverb" : 3,
    "adjective" : 4,
    "particle" : 5,
    "interjection" : 6,
    "conjunction" : 7,
    "auxiliary verb" : 8,
    "counter" : 9,
    "copula" : 10,
    "onomatopoeia" : 11,
    "mimetic" : 11
  }

  const h = (colors[type] * 30) % 360;

  return `hsl(${h}, ${s}%, ${l}%)`;
}

export const extractWordType = (sentence) => {
  // Split the string using '||' as a separator
  const parts = sentence.split('||');

  // If there's more than one part, then there's a '||' in the string
  if (parts.length > 1) {
      // Extract the part after '||'
      const wordType = parts[1].trim();
    
      // Remove the '||' part from the original sentence
      const modifiedSentence = parts[0].trim();

      return [ modifiedSentence, wordType ];
  } else {
      // If there's no '||', return the original string and undefined for the wordType
      return [ sentence, "" ];
  }
};

export function transformToRuby(text) {
  const regex = /\{([^|{}]+)\|([^|{}]+)\}/g;
  return text.replace(regex, '<ruby>$1<rt>$2</rt></ruby>');
}  

export function RubyMarkdown(entry) {
    const transformedContent = transformToRuby(entry.children);
    return <Markdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>{transformedContent}</Markdown>
}

export function convertToHiragana(text) {
  // Remove Japanese punctuation like 。
  const punctuationRegex = /[。，？「」。、]/g;
  text = text.replace(punctuationRegex, '');
  
  const regex = /\{([^|{}]+)\|([^|{}]+)\}/g;
  return text.replace(regex, '$2');
}  

export function renderWithFurigana(title) {
  const regEx = /\{([^|]*)\|([^}]*)\}/g;
  let match = null;
  let lastIndex = 0;
  const parts = [];
  
  while ((match = regEx.exec(title)) !== null) {
    if (lastIndex < match.index) {
      parts.push(title.slice(lastIndex, match.index));
    }
    parts.push(<ruby>{match[1]}<rt>{match[2]}</rt></ruby>);
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < title.length) {
    parts.push(title.slice(lastIndex));
  }
  
  return parts;
}