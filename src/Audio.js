import { useEffect, useRef } from 'react';

const AudioComponent = ({ category, sentence, handleAudioError, onPlayFast, onPlaySlow, onPlayWord, audioFiles }) => {
  const audioRef = useRef(null);
  const audioRefSlow = useRef(null);
  const audioRefWord = useRef(null);

  const stopAll = () =>
  {
    if(audioRef.current && audioRef.current.readyState >= 2)
    {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset audio position to the start
    }

    if(audioRefSlow.current && audioRefSlow.current.readyState >= 2)
    {
      audioRefSlow.current.pause();
      audioRefSlow.current.currentTime = 0; // Reset audio position to the start
    }

    if(audioRefWord.current && audioRefWord.current.readyState >= 2)
    {
      audioRefWord.current.pause();
      audioRefWord.current.currentTime = 0; // Reset audio position to the start
    }

  }

  const handlePlayAudioFast = () => {
    stopAll();
    if (audioRef.current&& audioRefSlow.current.readyState >= 1) {
      audioRef.current.currentTime = 0; // Reset audio position to the start
      audioRef.current.play();
    }
  };
  const handlePlayAudioSlow = () => {
    stopAll();
    if (audioRefSlow.current&& audioRefSlow.current.readyState >= 1) {
      audioRefSlow.current.currentTime = 0; // Reset audio position to the start
      audioRefSlow.current.play();
    }
  };

  const handlePlayAudioWord = (wordToPlay, audioFiles) => {
    stopAll();
    if (wordToPlay && audioRefWord.current) {
      const wordName = wordToPlay.replace(/ /g, '').replace('…', '');
      const audioSrcWord = category === 'local' ? audioFiles[`words/${wordName}.mp3`] : `audio/words/${wordName}.mp3`;
      audioRefWord.current.src = audioSrcWord;
  
      audioRefWord.current.onloadeddata = () => {
        if (audioRefWord.current.readyState >= 2) {
          audioRefWord.current.currentTime = 0; // Reset audio position to the start
          audioRefWord.current.play();
        }
      };
      audioRefWord.current.load();
    }
  };
  

  // Provide the play functions to parent component using useEffect
  useEffect(() => {
    if (typeof onPlayFast === 'function') {
      onPlayFast(() => handlePlayAudioFast);
    }
    if (typeof onPlaySlow === 'function') {
      onPlaySlow(() => handlePlayAudioSlow);
    }
    if (typeof onPlayWord === 'function') {
      onPlayWord((audioFiles) => handlePlayAudioWord);
    }
  }, [onPlayFast, onPlaySlow, onPlayWord, audioFiles]);

  // Set the audio source dynamically whenever the activeLesson or sentence changes
  useEffect(() => {
    if(sentence.audio)
    {
      if (audioRef.current) {
        const name = sentence.audio.replace(/ /g, '');
        const audioSrc = category === 'local' ? audioFiles[`${name}.mp3`] : `audio/${name}.mp3`;
        audioRef.current.src = audioSrc;
      }
    }
    else
    {
      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current.currentTime = 0; // Reset audio position to the start
        audioRef.current.pause();
      }
    }

    if(sentence.audio_slow)
    {
      if (audioRefSlow.current) {
        const nameSlow = sentence.audio_slow.replace(/ /g, '');
        const audioSrcSlow = category === 'local' ? audioFiles[`mid_speed/${nameSlow}.mp3`] : `audio/mid_speed/${nameSlow}.mp3`;
        audioRefSlow.current.src = audioSrcSlow;
      }
    }
    else
    {
      if (audioRefSlow.current) 
      {
        audioRefSlow.current.src = '';
        audioRefSlow.current.currentTime = 0; // Reset audio position to the start
        audioRefSlow.current.pause();
      }
    }
  }, [sentence]);


  return (
    <div>
      <audio ref={audioRef} onError={handleAudioError} />
      <audio ref={audioRefSlow} onError={handleAudioError} />
      <audio ref={audioRefWord} onError={handleAudioError} />
    </div>
  );
};

export default AudioComponent;