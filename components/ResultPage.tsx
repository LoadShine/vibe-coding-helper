// components/ResultPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronsRight } from 'lucide-react';
import type { CompanyResult } from '../types';

interface ResultPageProps {
    results: CompanyResult[];
    onRerun: () => void;
    onHover: (companyName: string, isHovering: boolean) => void;
    remainingRerolls: number;
}

const FortunePillar: React.FC<{ result: CompanyResult; index: number; onHover: (name: string, isHovering: boolean) => void }> = ({ result, index, onHover }) => {
    const heightPercentage = `${Math.max(15, result.score)}%`;
    const hue = 190 + (result.score * 1.5);

    return (
        <div
            className="flex flex-col items-center h-full justify-end relative group flex-shrink-0"
            onMouseEnter={() => onHover(result.company.name, true)}
            onMouseLeave={() => onHover(result.company.name, false)}
        >
            <motion.div
                className="w-16 md:w-20 rounded-t-lg relative"
                initial={{ height: 0 }}
                animate={{ height: heightPercentage }}
                transition={{ duration: 1.5, delay: index * 0.1, type: 'spring', stiffness: 50, damping: 15 }}
                style={{
                    background: `linear-gradient(to top, hsla(${hue}, 80%, 50%, 0.8), hsla(${hue}, 90%, 70%, 1))`,
                    boxShadow: `0 0 15px 5px hsla(${hue}, 90%, 70%, 0.4), 0 0 25px 10px hsla(${hue}, 90%, 70%, 0.3)`
                }}
            >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xl font-bold text-slate-800 transition-all duration-300 opacity-0 group-hover:opacity-100">
                    {result.score.toFixed(2)}
                </div>
            </motion.div>
            <p className="mt-3 text-sm md:text-base text-gray-700 font-semibold min-w-max px-2">{result.company.name}</p>
        </div>
    );
};

const ResultPage: React.FC<ResultPageProps> = ({ results, onRerun, onHover, remainingRerolls }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollability = () => {
        const el = scrollContainerRef.current;
        if (el) {
            const hasOverflow = el.scrollWidth > el.clientWidth;
            setIsOverflowing(hasOverflow);
            setCanScrollLeft(el.scrollLeft > 1);
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
        }
    };

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const timer = setTimeout(checkScrollability, 100);

        const resizeObserver = new ResizeObserver(checkScrollability);
        resizeObserver.observe(el);

        el.addEventListener('scroll', checkScrollability);

        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
            el.removeEventListener('scroll', checkScrollability);
        };
    }, [results]);


    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
            <motion.div
                className="w-full max-w-7xl mx-auto bg-white/40 backdrop-blur-2xl border-2 border-amber-400/30 rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 md:p-8 flex flex-col"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="text-center mb-4 md:mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-br from-amber-600 to-amber-800">
                        星宿照临 · 天机无限
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-amber-700/70 tracking-widest">
                        当前时刻您更适合用以下公司的模型进行氛围编程
                    </p>
                </div>

                <div className="relative w-full">
                    <AnimatePresence>
                        {canScrollLeft && (
                            <motion.div
                                className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white/50 to-transparent pointer-events-none z-10"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            />
                        )}
                    </AnimatePresence>

                    <div
                        ref={scrollContainerRef}
                        className="w-full h-96 md:h-[30rem] flex items-end gap-8 md:gap-10 overflow-x-auto px-4 md:px-6 pb-4 scrollbar-hide"
                    >
                        {results.map((result, index) => (
                            <FortunePillar key={result.company.name} result={result} index={index} onHover={onHover} />
                        ))}
                    </div>

                    <AnimatePresence>
                        {canScrollRight && (
                            <motion.div
                                className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white/50 to-transparent pointer-events-none z-10"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            />
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {isOverflowing && (
                        <motion.div
                            className="flex items-center justify-center gap-2 text-xs text-amber-700/60 mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 1 } }}
                            exit={{ opacity: 0 }}
                        >
                            <ChevronsRight size={14} className="animate-pulse"/>
                            <span>滑动查看更多</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col items-center mt-8">
                    <motion.button
                        onClick={onRerun}
                        disabled={remainingRerolls <= 0}
                        className="flex items-center gap-3 px-8 py-3 bg-white/50 text-amber-700 border-2 border-amber-500/60 font-bold rounded-lg shadow-lg hover:bg-amber-500/20 hover:border-amber-500/90 hover:shadow-amber-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-white/50"
                        whileHover={remainingRerolls > 0 ? { scale: 1.05, y: -2 } : {}}
                        whileTap={remainingRerolls > 0 ? { scale: 0.95 } : {}}
                    >
                        <RefreshCw size={20} />
                        夺运重演 ({remainingRerolls})
                    </motion.button>
                    {remainingRerolls <= 0 && <p className="text-xs text-amber-800/60 mt-2">本时辰夺运次数已用尽，请待天时运转。</p>}
                </div>
            </motion.div>
        </div>
    );
};

const style = document.createElement('style');
style.innerHTML = `
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;
document.head.appendChild(style);

export default ResultPage;