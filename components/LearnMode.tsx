import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { LETTERS, NUMBERS } from '../constants';
import { LearningItem } from '../types';
import { playTextToSpeech } from '../services/gemini';

interface LearnModeProps {
  onBack: () => void;
}

const LearnMode: React.FC<LearnModeProps> = ({ onBack }) => {
  const [selectedItem, setSelectedItem] = useState<LearningItem | null>(null);

  useEffect(() => {
    if (selectedItem) {
      // Small delay to allow the modal to pop up visually before audio starts
      const timeout = setTimeout(() => {
        if (selectedItem.type === 'letter' && selectedItem.word) {
           playTextToSpeech(`${selectedItem.char}... ${selectedItem.char} is for ${selectedItem.word}`);
        } else {
           playTextToSpeech(selectedItem.char);
        }
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [selectedItem]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 pb-20 relative">
      <div className="flex items-center mb-6 sticky top-0 bg-[#f0f9ff]/90 backdrop-blur-sm p-4 z-10 rounded-xl">
        <button 
            onClick={onBack}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors mr-4"
        >
            <ArrowLeft className="w-8 h-8 text-gray-600" />
        </button>
        <h2 className="text-3xl font-bold text-gray-700">Let's Learn!</h2>
      </div>

      {/* Letters Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-kidBlue mb-4 ml-2">Letters</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {LETTERS.map((item, index) => (
                <ItemCard 
                    key={item.id} 
                    item={item} 
                    index={index} 
                    onClick={() => setSelectedItem(item)} 
                />
            ))}
        </div>
      </div>

      {/* Numbers Section */}
      <div>
        <h3 className="text-2xl font-bold text-kidRed mb-4 ml-2">Numbers</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {NUMBERS.map((item, index) => (
                <ItemCard 
                    key={item.id} 
                    item={item} 
                    index={index} 
                    onClick={() => setSelectedItem(item)} 
                />
            ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={() => setSelectedItem(null)}
            >
                <motion.div
                    initial={{ scale: 0.5, y: 100 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.5, y: 100 }}
                    className={`
                        relative w-full max-w-sm aspect-[3/4] rounded-3xl shadow-2xl 
                        flex flex-col items-center justify-center p-8 border-8 border-white
                        ${selectedItem.color}
                    `}
                    onClick={(e) => e.stopPropagation()} // Prevent clicking modal from closing it
                >
                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="absolute top-4 right-4 p-2 bg-white/30 rounded-full text-white hover:bg-white/50 transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <span className="text-9xl font-bold text-white drop-shadow-md">
                            {selectedItem.char}
                        </span>
                        
                        {selectedItem.emoji && (
                             <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="text-8xl filter drop-shadow-xl"
                             >
                                {selectedItem.emoji}
                             </motion.div>
                        )}

                        {selectedItem.word && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-4 bg-white/90 px-6 py-2 rounded-full"
                            >
                                <span className="text-3xl font-bold text-gray-800">
                                    {selectedItem.word}
                                </span>
                            </motion.div>
                        )}
                    </div>
                    
                    <p className="text-white/80 font-semibold mt-4">Tap anywhere to close</p>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ItemCard: React.FC<{ item: LearningItem; index: number; onClick: () => void }> = ({ item, index, onClick }) => {
    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.1, rotate: Math.random() * 10 - 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={`
                aspect-square rounded-2xl shadow-lg border-b-8 border-black/10
                flex items-center justify-center relative overflow-hidden
                ${item.color}
            `}
        >
            <span className="text-5xl md:text-6xl font-bold text-white drop-shadow-sm select-none z-10">
                {item.char}
            </span>
            {/* Subtle background decoration */}
            <span className="absolute -bottom-4 -right-4 text-8xl opacity-20 pointer-events-none select-none">
                {item.emoji || item.char}
            </span>
        </motion.button>
    );
};

export default LearnMode;