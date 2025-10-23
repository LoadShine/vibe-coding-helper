// components/LoadingAnimation.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Particles from "react-tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

const runes = ['敕', '令', '天', '地', '玄', '黄', '宇', '宙', '洪', '荒', '日', '月', '星', '辰', '陰', '陽'];
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
const twentyEightMansions = ['角','亢','氐','房','心','尾','箕','斗','牛','女','虚','危','室','壁','奎','娄','胃','昴','毕','觜','参','井','鬼','柳','星','张','翼','轸'];

const useWindowSize = () => {
    const [size, setSize] = useState([0, 0]);
    useEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
};

const LoadingAnimation: React.FC = () => {
    const [width, height] = useWindowSize();
    const baseRadius = Math.min(width, height) / 2.5;
    const centerX = width / 2;
    const centerY = height / 2;

    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const getPolygonPoints = (sides: number, radius: number, rotationOffset = 0) => {
        const angle = (Math.PI * 2) / sides;
        return [...Array(sides)].map((_, i) => {
            const x = centerX + radius * Math.cos(angle * i + rotationOffset);
            const y = centerY + radius * Math.sin(angle * i + rotationOffset);
            return `${x},${y}`;
        }).join(' ');
    };

    const hexagramRadius = baseRadius * 0.35; // reduced size
    const triangleUpPoints = getPolygonPoints(3, hexagramRadius, -Math.PI / 2);
    const triangleDownPoints = getPolygonPoints(3, hexagramRadius, Math.PI / 2);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
            style={{ background: 'radial-gradient(circle, #1a052a 0%, #000000 70%)' }}
        >
            <Particles
                id="loading-particles"
                init={particlesInit}
                options={{
                    fpsLimit: 120,
                    background: { color: { value: "transparent" } },
                    particles: {
                        number: { value: 250, density: { enable: true, area: 800 } },
                        color: { value: ["#fbbf24", "#a7f3d0", "#ffffff"] },
                        shape: { type: "circle" },
                        opacity: { value: { min: 0.1, max: 0.6 }, animation: { enable: true, speed: 0.8, minimumValue: 0, sync: false } },
                        size: { value: { min: 0.5, max: 1.5 } },
                        move: {
                            enable: true,
                            speed: 0.5,
                            direction: "none",
                            random: true,
                            straight: false,
                            outModes: { default: "out" },
                        },
                    },
                    interactivity: { enable: false },
                    detectRetina: true,
                }}
                className="absolute top-0 left-0 w-full h-full"
            />

            <div className="absolute inset-0 flex items-center justify-center">

                {runes.map((rune, i) => (
                    <motion.div
                        key={`rune-${i}`}
                        className="absolute text-xl text-amber-500/70 font-serif"
                        style={{ originX: '50%', originY: '50%', filter: 'blur(0.5px)'}}
                        initial={{ opacity: 0, scale: 0.2, rotate: Math.random() * 360, x: (Math.random() - 0.5) * width, y: (Math.random() - 0.5) * height }}
                        animate={{ opacity: [0, 0.7, 0], scale: 1, x: 0, y: 0, rotate: (i % 2 === 0 ? 1 : -1) * (360 + Math.random() * 360) }}
                        transition={{ duration: 4, delay: i * 0.15, ease: "circIn" }}
                    >
                        {rune}
                    </motion.div>
                ))}

                <motion.div
                    className="absolute text-[22rem] text-amber-400/10 font-black select-none"
                    style={{ fontFamily: "'Zhi Mang Xing', cursive" }}
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{ duration: 8, delay: 2, ease: "easeInOut" }}
                >
                    敕
                </motion.div>

                <motion.div
                    className="absolute rounded-full"
                    style={{
                        width: baseRadius * 4,
                        height: baseRadius * 4,
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0) 60%)',
                        filter: 'blur(10px)',
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1, 0.8, 1], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 5, delay: 3, ease: 'easeOut' }}
                />

                <div className="absolute w-full h-full">
                    <svg width="100%" height="100%" className="absolute overflow-visible">
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        <motion.g animate={{ rotate: 360 }} transition={{ duration: 40, ease: 'linear', repeat: Infinity, delay: 4 }}>
                            <motion.circle cx={centerX} cy={centerY} r={baseRadius} stroke="#a7f3d0" strokeWidth="0.5" fill="none"
                                           initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }} transition={{ duration: 2, delay: 2, ease: "easeInOut" }} style={{ filter: 'url(#glow)' }}/>
                        </motion.g>

                        <motion.g animate={{ rotate: -360 }} transition={{ duration: 50, ease: 'linear', repeat: Infinity, delay: 4.5 }}>
                            <motion.circle cx={centerX} cy={centerY} r={baseRadius * 0.85} stroke="#fbbf24" strokeWidth="0.75" fill="none"
                                           initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }} transition={{ duration: 2, delay: 2.5, ease: "easeInOut" }} style={{ filter: 'url(#glow)' }}/>
                        </motion.g>

                        <motion.g animate={{ rotate: 360 }} transition={{ duration: 30, ease: 'linear', repeat: Infinity, delay: 5 }}>
                            <motion.circle cx={centerX} cy={centerY} r={baseRadius * 0.65} stroke="#67e8f9" strokeWidth="1" fill="none"
                                           initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 2, delay: 3, ease: "easeInOut" }} style={{ filter: 'url(#glow)' }}/>
                        </motion.g>

                        <motion.circle cx={centerX} cy={centerY} r={baseRadius * 0.45} stroke="#c4b5fd" strokeWidth="1.5" fill="none"
                                       initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, delay: 3.5, ease: "easeInOut" }} style={{ filter: 'url(#glow)' }}/>

                        <motion.polygon
                            points={triangleUpPoints}
                            fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1"
                            style={{ filter: 'url(#glow)' }}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2.5, delay: 5.5, ease: 'easeInOut' }}
                        />
                        <motion.polygon
                            points={triangleDownPoints}
                            fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1"
                            style={{ filter: 'url(#glow)' }}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2.5, delay: 5.8, ease: 'easeInOut' }}
                        />

                        {[...Array(12)].map((_, i) => (
                            <motion.line key={`pulse-line-${i}`}
                                         x1={centerX} y1={centerY}
                                         x2={centerX + baseRadius * 1.2 * Math.cos(i * Math.PI / 6)}
                                         y2={centerY + baseRadius * 1.2 * Math.sin(i * Math.PI / 6)}
                                         stroke="rgba(196, 181, 253, 0.5)" strokeWidth="0.5"
                                         initial={{ pathLength: 0, opacity: 0 }}
                                         animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                                         transition={{ duration: 2, delay: 6.5 + i * 0.1, repeat: Infinity, repeatDelay: 4 }}
                            />
                        ))}
                    </svg>

                    <motion.div className="absolute w-full h-full" animate={{ rotate: 360 }} transition={{ duration: 40, ease: 'linear', repeat: Infinity, delay: 4 }}>
                        {twentyEightMansions.map((char, i) => (
                            <motion.div key={`mansion-${i}`} className="absolute" style={{ top: centerY, left: centerX, transform: `translate(-50%, -50%) rotate(${i * (360/28)}deg) translateY(-${baseRadius}px) rotate(-${i * (360/28)}deg)`}}
                                        initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 4 + i * 0.05 }}>
                                <span className="text-sm text-emerald-300">{char}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div className="absolute w-full h-full" animate={{ rotate: -360 }} transition={{ duration: 50, ease: 'linear', repeat: Infinity, delay: 4.5 }}>
                        {earthlyBranches.map((char, i) => (
                            <motion.div key={`branch-${i}`} className="absolute" style={{ top: centerY, left: centerX, transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-${baseRadius * 0.85}px) rotate(-${i * 30}deg)`}}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.5 + i * 0.07 }}>
                                <span className="text-lg text-amber-300">{char}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div className="absolute w-full h-full" animate={{ rotate: 360 }} transition={{ duration: 30, ease: 'linear', repeat: Infinity, delay: 5 }}>
                        {heavenlyStems.map((char, i) => (
                            <motion.div key={`stem-${i}`} className="absolute" style={{ top: centerY, left: centerX, transform: `translate(-50%, -50%) rotate(${i * 36}deg) translateY(-${baseRadius * 0.65}px) rotate(-${i * 36}deg)`}}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5 + i * 0.08 }}>
                                <span className="text-xl text-cyan-300">{char}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div>
                        {trigrams.map((char, i) => (
                            <motion.div key={`trigram-${i}`} className="absolute" style={{ top: centerY, left: centerX, transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${baseRadius * 0.45}px) rotate(-${i * 45}deg)`}}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5.5 + i * 0.1 }}>
                                <span className="text-3xl text-indigo-300">{char}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div className="absolute w-[250%] h-[250%]"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0.5, 0], scale: [0, 1, 1.2, 1.3] }}
                            transition={{ duration: 1.2, delay: 9.5, ease: 'easeOut' }}
                            style={{ background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 55%)' }}
                />
            </div>
        </div>
    );
};

export default LoadingAnimation;