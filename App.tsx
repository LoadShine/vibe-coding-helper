// App.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Business Logic Services
import { VibeCodingDivination } from './services/divinationService';
import { FrontendDataCollector } from './services/dataCollector';
import { HoverTracker } from './services/hoverTracker';
import type { CompanyResult } from './types';

// UI Components
import HomePage from './components/HomePage';
import LoadingAnimation from './components/LoadingAnimation';
import ResultPage from './components/ResultPage';
import ParticleBackground from './components/ParticleBackground';

type Page = 'home' | 'loading' | 'result';

const GitHubIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
);


const App: React.FC = () => {
    const [page, setPage] = useState<Page>('home');
    const [results, setResults] = useState<CompanyResult[]>([]);
    const [currentHour, setCurrentHour] = useState<string>('');
    const [remainingRerolls, setRemainingRerolls] = useState<number>(7);

    const divinationService = useMemo(() => new VibeCodingDivination(), []);
    const dataCollector = useMemo(() => new FrontendDataCollector(), []);
    const hoverTracker = useMemo(() => new HoverTracker(), []);

    const getInitialHour = useCallback(() => {
        const hour = new Date().getHours();
        const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        return branches[Math.floor(((hour + 1) % 24) / 2)];
    }, []);

    useEffect(() => {
        const initialHour = getInitialHour();
        setCurrentHour(initialHour);
        setRemainingRerolls(divinationService.getRemainingRerolls(initialHour));

        const interval = setInterval(() => {
            const newHour = getInitialHour();
            if(newHour !== currentHour) {
                setCurrentHour(newHour);
                setRemainingRerolls(divinationService.getRemainingRerolls(newHour));
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [divinationService, getInitialHour, currentHour]);

    const handleDivine = useCallback(async (isReroll: boolean = false) => {
        if (isReroll && remainingRerolls <= 0) {
            alert('本时辰夺运次数已用尽，请等待下一时辰。');
            return;
        }

        setPage('loading');

        try {
            const params = await dataCollector.collectAllParams();
            setCurrentHour(params.hourBranch);

            if (isReroll) {
                params.hoverHistory = hoverTracker.getHoverData();
            } else {
                divinationService.resetBehaviorTracking();
                hoverTracker.reset();
            }

            const calculationPromise = new Promise(resolve => setTimeout(resolve, 2500))
                .then(() => divinationService.divineAllCompanies(params, isReroll));

            const animationMinTimePromise = new Promise(resolve => setTimeout(resolve, 13000));

            const [divinationResults] = await Promise.all([calculationPromise, animationMinTimePromise]);

            setResults(divinationResults as CompanyResult[]);
            setRemainingRerolls(divinationService.getRemainingRerolls(params.hourBranch));
            setPage('result');
        } catch (error) {
            console.error("Divination failed:", error);
            alert(error instanceof Error ? error.message : "An unknown error occurred.");
            setPage('home');
        }
    }, [dataCollector, divinationService, hoverTracker, remainingRerolls]);

    const handleHover = useCallback((companyName: string, isHovering: boolean) => {
        if (isHovering) {
            hoverTracker.startHover(companyName);
        } else {
            hoverTracker.endHover(companyName);
        }
    }, [hoverTracker]);

    return (
        <div className="relative min-h-screen w-full bg-transparent text-gray-800 overflow-hidden">
            <ParticleBackground />

            <motion.a
                href="https://github.com/LoadShine/vibe-coding-helper"
                target="_blank"
                rel="noopener noreferrer"
                title="View on GitHub"
                className="fixed bottom-6 right-6 z-50 text-gray-400 hover:text-amber-600 transition-colors duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
            >
                <GitHubIcon />
            </motion.a>

            <AnimatePresence mode="wait">
                {page === 'home' && (
                    <motion.div
                        key="home"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="w-full h-full"
                    >
                        <HomePage onStart={() => handleDivine(false)} />
                    </motion.div>
                )}
                {page === 'loading' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                    >
                        <LoadingAnimation />
                    </motion.div>
                )}
                {page === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0}}
                        transition={{ duration: 1.5 }}
                        className="w-full h-full"
                    >
                        <ResultPage
                            results={results}
                            onRerun={() => handleDivine(true)}
                            onHover={handleHover}
                            remainingRerolls={remainingRerolls}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default App;