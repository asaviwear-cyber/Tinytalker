import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, RefreshCw, ArrowLeft, Volume2 } from 'lucide-react';
import { ALL_ITEMS, LETTERS, NUMBERS } from '../constants';
import { LearningItem } from '../types';
import { startListening } from '../services/speech';
import { playTextToSpeech } from '../services/gemini';
import Reward from './Reward';

interface PracticeModeProps {
  onBack: () => void;
}

const PracticeMode: React.FC<PracticeModeProps> = ({ onBack }) => {
  const [currentItem, setCurrentItem] = useState<LearningItem>(ALL_ITEMS[0]);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
  const [showReward, setShowReward] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Pick a random item
  const nextItem = () => {
    const randomIndex = Math.floor(Math.random() * ALL_ITEMS.length);
    setCurrentItem(ALL_ITEMS[randomIndex]);
    setFeedback('neutral');
    setShowReward(false);
  };

  useEffect(() => {
    // Initial prompt
    playTextToSpeech(`Can you say, ${currentItem.char}?`, 'instruction');
  }, [currentItem]);

  const handleListen = () => {
    if (isListening) return;

    setIsListening(true);
    setFeedback('neutral');
    
    recognitionRef.current = startListening(
      (transcript) => {
        setIsListening(false);
        checkAnswer(transcript);
      },
      () => {
        setIsListening(false);
      },
      (error) => {
        console.error("Speech error", error);
        setIsListening(false);
        playTextToSpeech("I couldn't hear you. Try again!", 'instruction');
      }
    );
  };

  const checkAnswer = (transcript: string) => {
    const spoken = transcript.toLowerCase().trim();
    console.log(`Target: ${currentItem.char}, Spoken: ${spoken}`);
    
    // Check against all valid pronunciations
    const isMatch = currentItem.pronunciation.some(p => spoken.includes(p));

    if (isMatch) {
      handleCorrect();
    } else {
      handleIncorrect(spoken);
    }
  };

  const handleCorrect = () => {
    setFeedback('correct');
    setShowReward(true);
    playTextToSpeech(`Great job! That is ${currentItem.char}!`, 'instruction');
    setTimeout(() => {
      setShowReward(false);
      nextItem();
    }, 3000);
  };

  const handleIncorrect = (spoken: string) => {
    setFeedback('wrong');
    playTextToSpeech(`Oops! I heard ${spoken}. This is ${currentItem.char}. Try again!`, 'instruction');
    // Replay correct sound
    setTimeout(() => {
        playTextToSpeech(currentItem.char);
    }, 3500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-4">
      <Reward show={showReward} />
      
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-8">
        <button 
            onClick={onBack}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        >
            <ArrowLeft className="w-8 h-8 text-gray-600" />
        </button>
        <div className="text-2xl font-bold text-gray-700 bg-white px-6 py-2 rounded-full shadow-sm">
            Practice Time
        </div>
        <button 
            onClick={nextItem}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        >
            <RefreshCw className="w-8 h-8 text-gray-600" />
        </button>
      </div>

      {/* Main Card */}
      <motion.div 
        key={currentItem.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`relative w-64 h-64 md:w-80 md:h-80 rounded-3xl shadow-2xl flex items-center justify-center mb-12 border-8 ${
            feedback === 'correct' ? 'border-green-400' : 
            feedback === 'wrong' ? 'border-red-400' : 'border-white'
        } ${currentItem.color}`}
      >
        <span className="text-9xl md:text-[10rem] font-bold text-white drop-shadow-md">
            {currentItem.char}
        </span>
        
        {/* Helper sound button */}
        <button 
            onClick={() => playTextToSpeech(currentItem.char)}
            className="absolute top-4 right-4 bg-white/30 hover:bg-white/50 p-2 rounded-full transition-colors text-white"
        >
            <Volume2 className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        <motion.button
            whileTap={{ scale: 0.9 }}
            animate={isListening ? { scale: [1, 1.1, 1], boxShadow: "0 0 0 10px rgba(255, 107, 107, 0.3)" } : {}}
            transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
            onClick={handleListen}
            className={`
                w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4
                transition-colors duration-300
                ${isListening ? 'bg-red-500 border-red-200' : 'bg-blue-500 border-blue-200 hover:bg-blue-600'}
            `}
        >
            <Mic className="w-12 h-12 text-white" />
        </motion.button>
        
        <p className="text-xl text-gray-600 font-bold bg-white/80 px-4 py-2 rounded-xl">
            {isListening ? "Listening..." : "Tap to Speak!"}
        </p>
      </div>
    </div>
  );
};

export default PracticeMode;