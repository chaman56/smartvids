'use client';

import { useState, useEffect, useRef } from 'react';

import { SceneType } from '@/app/(main)/workspace/project/[id]/page';
import VideoDownload from './VideoDownload';

type AudioPlayerProps = {
  data: any;
  scenes: SceneType[];
};

type WordsStamp = {
  word: string;
  start: number;
  end: number;
};

const transitions = [
  'fade-in-out',
  'slide-left-right',
  'slide-up-down',
  'rotate-in-out',
  'scale-in-out',
  'flip-horizontal',
  'flip-vertical',
  'zoom-in-out'
];

const getRandomTransition = () => {
  const randomIndex = Math.floor(Math.random() * transitions.length);
  return transitions[randomIndex];
};

const AudioPlayer = ({ data, scenes }: AudioPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [transitionClass, setTransitionClass] = useState<string>('');
  const [previousSceneIndex, setPreviousSceneIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stamps: WordsStamp[] = data.words.map((word: string, index: number) => ({
    word,
    start: data.start[index],
    end: data.end[index],
  }));

  const emojis = Object.create(JSON.parse(data?.emoji))

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentSceneIndex = scenes.findIndex(img => img.start <= currentTime && currentTime <= img.end);

    if (currentSceneIndex !== previousSceneIndex) {
      const scene = scenes[currentSceneIndex];
      setTransitionClass(''); // Reset the transition class
        setCurrentImage(scene ? scene.url : null);
        setTransitionClass(getRandomTransition());
      setCurrentSubtitle(scene ? scene.text.split(/\s+/) : []);
      setPreviousSceneIndex(currentSceneIndex);
    }
  }, [currentTime, scenes, previousSceneIndex]);

  useEffect(() => {
    const wordIndex = stamps.findIndex(
      stamp => stamp.start <= currentTime && currentTime <= stamp.end
    );
    if (wordIndex !== -1) {
      setCurrentWord(stamps[wordIndex].word);
    } else {
      setCurrentWord(null);
    }
  }, [currentTime, stamps]);

  return (
    <div className='flex gap-2 flex-col items-center'>
      <div className='relative bg-black overflow-hidden rounded-xl'>
        {currentImage ? (
          <img src={currentImage} alt="Current display" width={340} /> //className={transitionClass} 
        ) : (
          <img src={data.thumbnail} width={340} />
        )}
        <div className='absolute bottom-5 w-full flex flex-col justify-center items-center'>
            {currentWord && <div className='bg-white text-black text-center rounded-2xl px-3 py-1'>
              <div className={" text-3xl"} >{currentWord && emojis[currentWord.replace(/[\s,\.]+$/, '')]}</div>
              <div className='font-bold '>{currentWord}</div>
            </div>}
        </div>
      </div>
      {/* <div className='font-bold shadow-md text-black rounded px-2 py-1 text-wrap'>
        {currentSubtitle.map((word: string | null, index: number) => (
          word === currentWord ? (
            <span key={index} className='bg-green-300'>{word}</span>
          ) : (
            <span key={index}> {word} </span>
          )
        ))}
      </div> */}
      <div className='flex justify-end items-center'>
        <audio src={data.audio || ''} controls ref={audioRef}></audio>
        <VideoDownload data={data} />
      </div>
      
    </div>
  );
};

export default AudioPlayer;
