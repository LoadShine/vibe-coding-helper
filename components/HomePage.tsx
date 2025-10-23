// components/HomePage.tsx
import React from 'react';
import MysticalButton from './MysticalButton';
import { motion } from 'framer-motion';

interface HomePageProps {
    onStart: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <header className="text-center mb-10 md:mb-12 relative">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold tracking-wider text-amber-700/90"
                    style={{ textShadow: '0 0 15px rgba(245, 158, 11, 0.3), 0 0 5px rgba(0, 0, 0, 0.1)' }}
                >
                    维 C 助手
                </motion.h1>
            </header>

            <main className="relative flex items-center justify-center">
                <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ fontFamily: "'Zhi Mang Xing', cursive" }}
                    className="absolute right-full mr-8 md:mr-16 text-lg md:text-xl text-gray-600/80 [writing-mode:vertical-rl] tracking-widest"
                >
                    策落定山河
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4, type: 'spring' }}
                >
                    <MysticalButton onClick={onStart} />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ fontFamily: "'Zhi Mang Xing', cursive" }}
                    className="absolute left-full ml-8 md:ml-16 text-lg md:text-xl text-gray-600/80 [writing-mode:vertical-rl] tracking-widest"
                >
                    卦起引星海
                </motion.p>
            </main>

            <footer className="absolute bottom-4 text-xs text-black/20">
                万般皆是命，半点不由人。
            </footer>
        </div>
    );
};

export default HomePage;