// components/MysticalButton.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface MysticalButtonProps {
    onClick: () => void;
}

const trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

const MysticalButton: React.FC<MysticalButtonProps> = ({ onClick }) => {
    return (
        <motion.div
            className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center cursor-pointer group"
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* Outer rings */}
            <motion.div
                className="absolute w-full h-full border border-amber-400/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute w-[85%] h-[85%] border border-cyan-400/30 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            />

            {/* Trigrams */}
            <motion.div
                className="absolute w-[70%] h-[70%]"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
                {trigrams.map((trigram, i) => {
                    const angle = (i / 8) * 360;
                    return (
                        <motion.div
                            key={i}
                            className="absolute w-10 h-10 top-1/2 left-1/2"
                            style={{
                                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-100px) rotate(-${angle}deg)`,
                                originX: '50%',
                                originY: '50%'
                            }}
                            initial={{ opacity: 0.5, scale: 0.8 }}
                            animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1, 0.8] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                        >
                            <span className="text-3xl text-amber-500/80 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-300"
                                  style={{filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.5))'}}>
                                {trigram}
                            </span>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Central Taijitu Core */}
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center bg-white/50 backdrop-blur-md border-2 border-amber-400/30 shadow-[0_0_25px_5px_rgba(245,158,11,0.2),inset_0_0_15px_rgba(0,0,0,0.1)]">
                <motion.div
                    className="relative w-24 h-24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                    <div className="absolute w-full h-full rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 w-1/2 h-full bg-slate-100"></div>
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-slate-100">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-800"></div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-slate-800">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-100"></div>
                        </div>
                    </div>
                </motion.div>

                {/* Text Overlay */}
                <div className="absolute text-center">
                    <div className="text-4xl md:text-5xl font-bold text-amber-600" style={{ textShadow: '0 0 10px rgba(245, 158, 11, 0.5)', fontFamily: "'Zhi Mang Xing', cursive" }}>
                        起卦
                    </div>
                    <div className="text-sm md:text-base text-cyan-700 opacity-80 tracking-[0.2em] font-orbitron">
                        ACTIVATE
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MysticalButton;