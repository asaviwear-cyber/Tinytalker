import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import { ALL_ITEMS } from '../constants';
import { LearningItem } from '../types';
import { startListening } from '../services/speech';
import { playTextToSpeech } from '../services/gemini';

interface TimeChallengeModeProps {
  onBack: () => void;
}

const GAME_DURATION = 60; // seconds

const TimeChallengeMode: React.FC<TimeChallengeModeProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentItem, setCurrentItem] = useState<LearningItem>(ALL_ITEMS[0]);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  
  // Ref to handle the active recognition instance so we can stop it cleanly
  const recognitionRef = useRef<any>(null);
  // Ref to track if we should restart listening (avoiding stale closures)
  const isPlayingRef = useRef(false);

  useEffect(() => {
    isPlayingRef.current = gameState === 'playing';
  }, [gameState]);

  // Timer Logic
  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('finished');
            playTextToSpeech(`Time's up! You got ${score} correct!`, 'instruction');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score]);

  // Speech Recognition Loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const handleSpeechStart = () => {
      if (!isPlayingRef.current) return;

      recognitionRef.current = startListening(
        (transcript) => {
          checkAnswer(transcript);
          // Restart listening for the next word/attempt immediately
          // We rely on the 'onEnd' to loop, but if we got a result, 
          // 'onEnd' triggers naturally.
        },
        () => {
          // On End: Restart if still playing
          if (isPlayingRef.current) {
            // Small delay to prevent browser "hot mic" issues
            setTimeout(handleSpeechStart, 100);
          }
        },
        (error) => {
          console.warn("Mic error or silence:", error);
          // On Error: Restart if still playing
          if (isPlayingRef.current) {
            setTimeout(handleSpeechStart, 500);
          }
        }
      );
    };

    handleSpeechStart();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort(); // Force stop
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]); // Only re-run if game state changes

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    nextItem();
    playTextToSpeech("Ready? Go!", 'instruction');
  };

  const nextItem = () => {
    const randomIndex = Math.floor(Math.random() * ALL_ITEMS.length);
    setCurrentItem(ALL_ITEMS[randomIndex]);
    setFeedback('none');
  };

  const checkAnswer = (transcript: string) => {
    const spoken = transcript.toLowerCase().trim();
    const isMatch = currentItem.pronunciation.some(p => spoken.includes(p));

    if (isMatch) {
      // Correct!
      setScore(s => s + 1);
      setFeedback('correct');
      // Visual feedback + sound?
      // playTextToSpeech("Good!", 'content'); // Can be too slow for speed mode.
      // Just move to next immediately for flow
      setTimeout(() => {
        nextItem();
      }, 500); 
    } else {
      setFeedback('wrong');
      // For speed mode, we don't penalize score, just show visual wrong
      // and keep listening for the SAME item until they get it or skip?
      // Let's just let them keep trying.
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-4">
      
      {/* Top Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <button 
            onClick={onBack}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        >
            <ArrowLeft className="w-8 h-8 text-gray-600" />
        </button>
        
        {gameState === 'playing' && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-kidBlue">
              <Timer className="w-6 h-6 text-kidBlue" />
              <span className={`text-xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-kidYellow">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-xl font-bold text-gray-700">
                {score}
              </span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* Intro Screen */}
        {gameState === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center text-center p-8 bg-white/80 rounded-3xl shadow-xl backdrop-blur-sm"
          >
            <Timer className="w-24 h-24 text-kidBlue mb-4" />
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Time Challenge!</h2>
            <p className="text-xl text-gray-600 mb-8">
                How many can you say in {GAME_DURATION} seconds?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-kidGreen text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg flex items-center gap-3"
            >
              <Play fill="currentColor" /> Start
            </motion.button>
          </motion.div>
        )}

        {/* Game Play Screen */}
        {gameState === 'playing' && (
          <motion.div 
            key="game"
            className="flex flex-col items-center"
          >
            <motion.div 
                key={currentItem.id} // Re-animate on new item
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`
                    relative w-64 h-64 md:w-80 md:h-80 rounded-3xl shadow-2xl flex items-center justify-center mb-8 border-8
                    ${feedback === 'correct' ? 'border-green-400 bg-green-50' : 
                      feedback === 'wrong' ? 'border-red-400 bg-red-50' : 'border-white bg-white'}
                `}
            >
                <span className={`
                    text-9xl md:text-[10rem] font-bold drop-shadow-md select-none
                    ${feedback === 'wrong' ? 'text-red-400' : currentItem.color.replace('bg-', 'text-')}
                `}>
                    {currentItem.char}
                </span>
            </motion.div>
            
            <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="font-semibold">Listening... Say it fast!</span>
            </div>
          </motion.div>
        )}

        {/* Finished Screen */}
        {gameState === 'finished' && (
          <motion.div 
            key="finished"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center text-center p-8 bg-white/90 rounded-3xl shadow-xl"
          >
            <div className="mb-6 relative">
                 <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-lg" />
                 <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-2 -right-2 text-4xl"
                 >
                    ⭐
                 </motion.div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Time's Up!</h2>
            <p className="text-2xl text-gray-600 mb-8">
                You got <span className="text-4xl font-bold text-kidBlue">{score}</span> correct!
            </p>

            <div className="flex gap-4">
                <button 
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors"
                >
                    Menu
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-kidBlue text-white text-xl font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2"
                >
                  <RotateCcw size={24} /> Play Again
                </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default TimeChallengeMode;