import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faRefresh, faArrowLeft, faArrowRight, faForward, faPlay, faHome, faClose, faFastForward, faShuffle, faRandom } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import { renderWithFurigana, typeToColor, extractWordType, transformToRuby, RubyMarkdown, convertToHiragana } from './utils';
import AudioComponent from './Audio';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import packageJson from '../package.json'; // adjust path as needed
import { useSwipeable } from 'react-swipeable';
import pako from 'pako';

const JSZip = require('jszip');

const basename = process.env.NODE_ENV === 'development' ? '/' : '/sentsei/';
const App = () => {
  
  const [file, setFile] = useState(null);
  
return (
  <div className="App">
    <Routes>
      <Route path={basename} element={<TitleScreen />} />
      <Route path={`${basename}lessons/:category/:title/:index`} element={<Lesson file={file} />} />
    </Routes>
  </div>
);

function TitleScreen() {
  const { category, title, index } = useParams();
  const navigate = useNavigate();
  
  const [lessons, setLessons] = useState([]);

  const uploadFile = async (e) => {
    try 
    {
      const fileHandle = e.target.files[0]; // Get the first file user selected
      const fileName = fileHandle.name.split('.')[0]; // Assuming no dots in filename except for the extension
      setFile(fileHandle);
      navigate(`lessons/local/${fileName}/1`); // navigate after file selection
    } 
    catch (err) 
    {
      console.error("Error uploading file: " + err);
    }
  };

  

  useEffect(() => {
    fetch('lessons/lessons.json') // Fetch your lessons JSON
      .then(response => response.json())
      .then(data => {
        setLessons(data.categories); // Store it in a state
      })
      .catch((error) => console.error(error));
  }, [category, title, index]);
  
  const selectLesson = (category, lesson, title) => { // Function to select a lesson.
    navigate(`${basename}lessons/${category}/${lesson}/1`);
  };  

  // This function will display the lesson list
  const LessonList = ({ lessons }) => {
    return (
      <div className="lesson_grid">
        {lessons.map((category) => (
          <div className='lesson_category' style={{ flex: '1', maxWidth: '700px' }}>
            <h2>{category.name}</h2>
            {category.lessons.map((lesson) => (
              <div class="lesson_item"
                href={`${basename}lessons/${category.name}/${lesson.id}/1`}
                key={lesson.id}
                onClick={(e) => {
                  e.preventDefault();
                  selectLesson(category.name, lesson.id, lesson.title);
                }}
                style={{ color:category.color }}
              >
                {renderWithFurigana(lesson.title)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="title-screen">
      <div className="title-screen-header">
        <a href={basename}><h1>Sentsei</h1></a>
        <a href="https://github.com/JuicyStandoffishMan/Sentsei"><img className="github" src="github.png" /></a>
      </div>
      <label for="upload_file" className="upload">Upload Local Lesson</label>
      <input id="upload_file" type="file" onChange={uploadFile} accept=".zip" className="upload"/>
      <LessonList lessons={lessons} />
    </div>
  );
}

function MainSentence({text, breakdown, activeIndex, setActiveIndex, playAudioWord, playAudioFast, playAudioSlow, handleCopy, main, audioFiles}) {
  const [off, setOff] = useState(0);
  const ref = useRef(null);
  const ref2 = useRef(null);

  useLayoutEffect(() => {
    if (ref.current) {
      const buttonSize = ref2.current.getBoundingClientRect().height;
      const sentenceSize = ref.current.getBoundingClientRect().height;
      const ratio = window.devicePixelRatio;
      const offset = -sentenceSize + 130;// + 150 / ratio;
      if(sentenceSize > 0)
      {
        setOff(offset);
      }
    }
  }, [ref.current]);

  const createMarkup = (text, breakdown) => {
    return text.split(' ').map((word, index) => {
      let color = "white";
      
      // Try to get the word type from the breakdown
      const entries = Object.entries(breakdown);
      const entry = (index < entries.length) ? entries[index] : null;
      let wordType = "";
      if (entry) {
        wordType = extractWordType(entry[1])[1];
        color = typeToColor(wordType);
      }
  
      let formattedWord = word.replace(/{([^|]+)\|([^}]+)}/g, (match, mainWord, ruby) => {
        return `<ruby className="word">${mainWord}<rt>${ruby}</rt></ruby>`;
      });
  
      if (word.includes('{') && word.includes('}')) {
        return (
          <span className={`total_word_container${activeIndex === index ? '_active' : ''}`} onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)} onClick={() => { if (playAudioWord) playAudioWord(convertToHiragana(word), audioFiles);}}>
            <div className="word-container">
              <span className="word" style={{ color }} dangerouslySetInnerHTML={{ __html: formattedWord }} />
              <span className="word_type_ruby" style={{color}}>{wordType}</span>
            </div>
          </span>
        );
      } else {
        return (
          <span className={`total_word_container${activeIndex === index ? '_active' : ''}`} onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)} onClick={() => { if (playAudioWord) playAudioWord(convertToHiragana(word), audioFiles);}}>
          <div className="word-container">
            <span className="word" style={{ color }}>{word}</span>
            <span className="word_type" style={{color}}>{wordType}</span>
          </div>
          </span>
        );
      }
    });
  };

  return (
    <>
      <div className="main_sentence_container">
        <div ref={ref} id="main_sentence" className={`main_sentence`}>
          {createMarkup(text, breakdown)}
        </div>
      </div>
      <div className="main_sentence_container2">
        <div className="main_sentence2">
          {createMarkup(text, breakdown)}
        </div>
        <FontAwesomeIcon ref={ref2} className="button1" icon={faFastForward} onClick={playAudioFast} />
        <FontAwesomeIcon className="button2" icon={faPlay} onClick={playAudioSlow} />
        <FontAwesomeIcon className="button3" icon={faCopy} onClick={handleCopy} />
      </div>
    </>
  );
}

function Lesson({file}) {
  const swipeHandlers = useSwipeable({
    onSwiped: (eventData) => {
      if (eventData.dir === 'Left') {
        fetchSentence(1);
        eventData.event.preventDefault();
      } else if (eventData.dir === 'Right') {
        fetchSentence(-1);
        eventData.event.preventDefault();
      }
    },
    onSwiping: (eventData) => {
      if(Math.abs(eventData.deltaX) > Math.abs(eventData.deltaY)) {
        // It's a horizontal swipe
        if (eventData.dir === 'Up' || eventData.dir === 'Down') {
          // Prevent vertical swipes during a horizontal swipe
          eventData.event.preventDefault();
        }
      } else {
        // It's a vertical swipe
        if (eventData.dir === 'Left' || eventData.dir === 'Right') {
          // Prevent horizontal swipes during a vertical swipe
          eventData.event.preventDefault();
        }
      }
    },
    delta: 10, // minimum swipe distance
    preventDefaultTouchmoveEvent: false,
    trackMouse: false
  });

  const { category, title, index } = useParams();
  const navigate = useNavigate();

  const [lessonData, setLessonData] = useState([]);
  const [audioFiles, setAudioFiles] = useState({});

  const [sentence, setSentence] = useState({});
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null); // Add a state for the active lesson.
  const [activeLessonName, setActiveLessonName] = useState('');

  const [playAudioFast, setPlayAudioFast] = useState(null);
  const [playAudioSlow, setPlayAudioSlow] = useState(null);
  const [playAudioWord, setPlayAudioWord] = useState(null);

  const loadAudioFiles = async (zipData) => {
    const audioFiles = {};
  
    const promises = [];
    zipData.folder("audio").forEach((relativePath, file) => {
      if (!file.dir) {
        const promise = file.async("blob").then(blob => {
          const blobWithMime = new Blob([blob], { type: 'audio/mpeg' });
          audioFiles[relativePath] = URL.createObjectURL(blobWithMime);
        });
        promises.push(promise);
      }
    });
  
    await Promise.all(promises);
    setAudioFiles(audioFiles);
  };
  

  const fetchData = async () => {
    let lessonJson;
    if (category === 'local') {
      if(file)
      {
        try
        {
          const arrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
          });

          const zip = new JSZip();
          const zipData = await zip.loadAsync(arrayBuffer);
          await loadAudioFiles(zipData);
          const lessonFile = await zipData.file("lesson.json").async("text");
          lessonJson = JSON.parse(lessonFile);
        }
        catch(err)
        {
          window.alert("Error loading lesson file: " + err + ".\n\nPlease make sure this is a valid zip file with lesson.json inside it.");
          console.log(err);
          navigate(basename);
          return;
        }
      }
      else
      {
        navigate(basename);
        return;
      }
    } else {
      const response = await fetch(`lesson.json`);
      lessonJson = await response.json();
    }

    setLessonData(lessonJson);
    const ind = parseInt(index) - 1;
    setActiveSentenceIndex(ind);
    setSentence(lessonJson[ind]);
  };



  useEffect(() => {
    if (category === 'local' && !file)
    {
      navigate(basename);
      return;
    }
    const newLesson = { category, lesson: title };
    setActiveLesson(newLesson);
    setActiveIndex(-1);
    setActiveLessonName(title);
    fetchData();
  }, [category, title, index, file]);

  const fetchSentence = (delta) => {
    if(delta < 0)
      delta = lessonData.length + delta;
    else if(delta == 0)
      delta = Math.floor(Math.random() * lessonData.length);
    let ki = (activeSentenceIndex + delta) % lessonData.length;
    fetchSentenceAbsolute(ki);
  };

  const fetchSentenceAbsolute = (ki) => {
    window.scrollTo(0, 0);
    setSentence(lessonData[ki]);
    setActiveIndex(-1);
    setShowTranslation(false);
    setActiveSentenceIndex(ki);
    
    window.history.pushState({}, '', `${basename}lessons/${category}/${title}/${ki + 1}`, { replace: false });
  };



  
  
  
  const createBreakdowns = (breakdown) => {
    return Object.entries(breakdown).map(([key, value], index) => {
      key = key.split('*')[0]
  
      const result = extractWordType(value);
      const originalValue = result[0];
      value = result[0];
      const wordType = result[1];
      const color = typeToColor(wordType);
  
      let renderedValue = value;
      const valueMatches = originalValue.matchAll(/({([^|]+)\|([^}]+)})/g);
      for (const valueMatch of valueMatches) {
        const rubyText = `<ruby>${valueMatch[2]}<rt>${valueMatch[3]}</rt></ruby>`;
        renderedValue = renderedValue.replace(valueMatch[0], rubyText);
      }
  
      // Define a variable to hold formatted key
      let formattedKey = key;
  
      // Replace all furigana expressions in key
      formattedKey = formattedKey.replace(/{([^|]+)\|([^}]+)}/g, (match, mainWord, furigana) => {
        return `<ruby>${mainWord}<rt>${furigana}</rt></ruby>`;
      });
  
      return (
        <p key={index} className={`breakdown ${activeIndex === index ? 'active' : ''}`} style={{ color }} onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)}>
          <span className="breakdown_key" onClick={() => { if (playAudioWord) playAudioWord(convertToHiragana(key)); }}
            dangerouslySetInnerHTML={{ __html: formattedKey }}
          />
          : <span dangerouslySetInnerHTML={{ __html: renderedValue }} />
        </p>
      );
    });
  };
  
  
  

  const createNavigation = () => {
    const htmlContent = { __html: transformToRuby(activeLessonName) };
    
    return (
      <div className="navigation">
        <FontAwesomeIcon className="navigation-fa" icon={faHome}  onClick={(e) => { e.preventDefault(); if(activeSentenceIndex != 0) fetchSentence(-activeSentenceIndex); }}/>
        <span dangerouslySetInnerHTML={htmlContent} />
        <FontAwesomeIcon className="shuffle" icon={faRandom}  onClick={(e) => { e.preventDefault(); fetchSentence(0); }}/>
      </div>
    );
  };  

  const createControls = () => {
    return (
      <div className="controls">
        {/*<FontAwesomeIcon className="controls-fa" icon={faCopy} onClick={handleCopy} />*/}
        {/*<FontAwesomeIcon className="controls-fa" icon={faRefresh} onClick={(e) => { e.preventDefault(); fetchSentence(0); }} />*/}
        <FontAwesomeIcon className="controls-left" icon={faArrowLeft} onClick={(e) => { e.preventDefault(); fetchSentence(-1); }} />
        <FontAwesomeIcon className="controls-right" icon={faArrowRight} onClick={(e) => { e.preventDefault(); fetchSentence(1); }} />
      </div>
    );
  };

  const createClose = () => {
    return (
      <div className="close">
        <a href={basename} onClick={handleGoHome}>
          <FontAwesomeIcon icon={faClose} className="icon" />
        </a>
      </div>
    );
  };

  const handleCopy = () => {
    if(sentence.japanese === undefined)
    {
      if(sentence.content != undefined)
      {
        navigator.clipboard.writeText(sentence.content);
      }

      return;
    }
      
    const plainText = sentence.japanese.replace(/{([^|]+)\|[^}]+}/g, '$1').replace(/  /g, ' ');
    navigator.clipboard.writeText(plainText);
  };  

  const handleAudioError = (e) => {
    // console.log('Error occurred while playing the audio');
  };

  const handleGoHome = () => {
    setActiveLesson(null);
    setSentence("");
  };

  const Footer = ({ activeSentenceIndex, lessonData }) => {
    const footerRef = useRef();
  
    const handleClick = (event) => {
      const rect = footerRef.current.getBoundingClientRect();
      const clickPosition = event.clientX - rect.left;
      const percent = clickPosition / rect.width;
  
      const page = Math.floor(percent * lessonData.length) % lessonData.length;
      fetchSentenceAbsolute(page);
    };
  
    return (
      <div className="footer" ref={footerRef} onClick={handleClick}>
        <span className="progress" style={{ width: `${(activeSentenceIndex + 1) / lessonData.length * 100}%` }}> </span>
        <p>{`${activeSentenceIndex + 1} / ${lessonData.length}`}</p>
      </div>
    );
  };

  const LessonView = ({ entry, showTranslation, setShowTranslation, createControls, createBreakdowns }) => 
  {
    if (!entry) { // If no entry has been loaded yet
      return <p>Loading...</p>
    } else if (entry.type === 'information') {
      return (
        <div className="content">
          <div style={{textAlign:"justify"}}><RubyMarkdown>{entry.content}</RubyMarkdown></div>
          {createNavigation()}
          {createClose()}
        </div>
      );
    } else if (entry.type === 'sentence') {
      const sentence = entry;
      return (
        <div className="content">
          {sentence.japanese ? 
            <div>
              <MainSentence text={sentence.japanese} breakdown={sentence.breakdown} activeIndex={activeIndex} setActiveIndex={setActiveIndex} playAudioWord={playAudioWord} playAudioFast={playAudioFast} playAudioSlow={playAudioSlow} handleCopy={handleCopy} audioFiles={audioFiles} />

              <div className="rest">
                <p className={`translation ${showTranslation ? '' : 'hidden'}`} onClick={() => setShowTranslation(true)}>
                  {sentence.english}
                  {(() => 
                  {
                    if(sentence.literal && sentence.literal != "")
                      return (<span className="literal"><br/>{sentence.literal}</span>);
                  })()}
                  </p>
                {sentence.breakdown && createBreakdowns(sentence.breakdown)}
                <div className='bottomLessonContainer'><div className='bottomLesson'><RubyMarkdown>{entry.lesson}</RubyMarkdown></div></div>
              </div>
            </div>
          : 
            <p>Loading...</p>}
                          {createNavigation()}
                          {createClose()}
        </div>
      );
    }
  };

  return (
    <div className="lesson" {...swipeHandlers}>
    <LessonView entry={sentence} showTranslation={showTranslation} setShowTranslation={setShowTranslation} createControls={createControls} createBreakdowns={createBreakdowns} />
    <div className="controls">{createControls()}</div>
    <AudioComponent category={category} sentence={sentence} handleAudioError={handleAudioError} onPlayFast={setPlayAudioFast} onPlaySlow={setPlayAudioSlow} onPlayWord={setPlayAudioWord} audioFiles={audioFiles}/>
    <Footer activeSentenceIndex={activeSentenceIndex} lessonData={lessonData} />
  </div>
  );
}

};

export default App;
