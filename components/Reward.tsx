import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardProps {
  show: boolean;
}

const Reward: React.FC<RewardProps> = ({ show }) => {
  const [stars, setStars] = useState<number[]>([]);

  useEffect(() => {
    if (show) {
      setStars(Array.from({ length: 15 }, (_, i) => i));
    } else {
      setStars([]);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          {stars.map((i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                scale: 0, 
                x: 0, 
                y: 0 
              }}
              animate={{ 
                opacity: [1, 0], 
                scale: [1, 1.5],
                x: (Math.random() - 0.5) * window.innerWidth * 0.8,
                y: (Math.random() - 0.5) * window.innerHeight * 0.8,
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 2, 
                ease: "easeOut"
              }}
              className="absolute text-6xl"
            >
              ⭐
            </motion.div>
          ))}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-8xl font-bold text-yellow-400 drop-shadow-lg bg-white rounded-full p-8 border-4 border-yellow-200"
          >
            Yay!
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Reward;