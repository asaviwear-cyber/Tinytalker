import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Music, Timer } from 'lucide-react';
import { AppMode } from './types';
import LearnMode from './components/LearnMode';
import PracticeMode from './components/PracticeMode';
import TimeChallengeMode from './components/TimeChallengeMode';
import { playTextToSpeech } from './services/gemini';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);

  // Pre-warm the audio context on user interaction
  const handleStart = (newMode: AppMode) => {
    setMode(newMode);
    // Trigger a silent or intro sound to unlock audio context on mobile
    playTextToSpeech("Let's go!", 'instruction');
  };

  return (
    <div className="min-h-screen w-full font-sans text-gray-800 overflow-x-hidden">
        {/* Background blobs */}
        <div className="blob bg-purple-300 w-96 h-96 rounded-full top-0 left-0 mix-blend-multiply opacity-30 animate-pulse"></div>
        <div className="blob bg-yellow-300 w-96 h-96 rounded-full bottom-0 right-0 mix-blend-multiply opacity-30 animate-pulse"></div>
        
        <header className="w-full p-4 flex justify-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-kidRed via-kidYellow to-kidBlue drop-shadow-sm py-2">
                TinyTalkers
            </h1>
        </header>

        <main className="container mx-auto px-4 py-4 flex flex-col items-center">
            <AnimatePresence mode="wait">
                {mode === AppMode.HOME && (
                    <motion.div 
                        key="home"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center gap-6 mt-6 w-full max-w-md"
                    >
                        <MenuButton 
                            color="bg-kidGreen"
                            icon={<BookOpen size={40} />}
                            title="Learn ABCs"
                            subtitle="Touch & Listen"
                            onClick={() => handleStart(AppMode.LEARN)}
                        />
                        <MenuButton 
                            color="bg-kidOrange"
                            icon={<Music size={40} />}
                            title="Practice"
                            subtitle="Speak into the Mic"
                            onClick={() => handleStart(AppMode.PRACTICE)}
                        />
                        <MenuButton 
                            color="bg-kidRed"
                            icon={<Timer size={40} />}
                            title="Time Challenge"
                            subtitle="Beat the Clock!"
                            onClick={() => handleStart(AppMode.TIME_CHALLENGE)}
                        />
                        
                        <div className="mt-8 p-4 bg-white/60 rounded-xl text-center text-sm text-gray-500 max-w-xs">
                            <p>Tip: Turn up your volume!</p>
                            <p>Allow microphone access for games.</p>
                        </div>
                    </motion.div>
                )}

                {mode === AppMode.LEARN && (
                    <motion.div 
                        key="learn"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="w-full"
                    >
                        <LearnMode onBack={() => setMode(AppMode.HOME)} />
                    </motion.div>
                )}

                {mode === AppMode.PRACTICE && (
                    <motion.div 
                        key="practice"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="w-full"
                    >
                        <PracticeMode onBack={() => setMode(AppMode.HOME)} />
                    </motion.div>
                )}

                {mode === AppMode.TIME_CHALLENGE && (
                    <motion.div 
                        key="time"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="w-full"
                    >
                        <TimeChallengeMode onBack={() => setMode(AppMode.HOME)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    </div>
  );
};

interface MenuButtonProps {
    color: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ color, icon, title, subtitle, onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`w-full p-4 rounded-3xl shadow-xl border-b-8 border-black/10 flex items-center gap-6 text-white ${color}`}
        >
            <div className="p-3 bg-white/20 rounded-2xl">
                {icon}
            </div>
            <div className="text-left">
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-white/90 font-semibold text-sm">{subtitle}</p>
            </div>
        </motion.button>
    );
}

export default App;