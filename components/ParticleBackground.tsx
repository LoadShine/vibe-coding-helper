// components/ParticleBackground.tsx
import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

const ParticleBackground: React.FC = () => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "grab",
                        },
                        resize: true,
                    },
                    modes: {
                        grab: {
                            distance: 180,
                            links: {
                                opacity: 0.3,
                                color: "#fbbf24"
                            }
                        },
                    },
                },
                particles: {
                    color: {
                        value: ["#f59e0b", "#ffffff", "#06b6d4"],
                    },
                    links: {
                        color: "#a7f3d0",
                        distance: 150,
                        enable: true,
                        opacity: 0.1,
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "out",
                        },
                        random: true,
                        speed: 0.2,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 200,
                    },
                    opacity: {
                        value: { min: 0.2, max: 0.9 },
                        animation: {
                            enable: true,
                            speed: 0.5,
                            minimumValue: 0.1,
                            sync: false,
                        },
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 2.5 },
                    },
                },
                detectRetina: true,
            }}
            className="absolute top-0 left-0 w-full h-full -z-10"
        />
    );
};

export default ParticleBackground;