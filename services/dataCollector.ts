// services/dataCollector.ts
import type { DivinationParams, LunarDate } from '../types';
import { getSolarTerm, getLunarDate, getMoonPhase } from '../utils/helpers';

export class FrontendDataCollector {
    private mousePositions: { x: number, y: number }[] = [];
    private lastClickTime: number = 0;
    private clickCount: number = 0;

    constructor() {
        if (typeof window !== 'undefined') {
            document.addEventListener('mousemove', this.trackMouse.bind(this), { passive: true });
            document.addEventListener('click', this.trackClick.bind(this), { passive: true });
        }
    }

    private trackMouse(e: MouseEvent) {
        this.mousePositions.push({ x: e.clientX, y: e.clientY });
        if (this.mousePositions.length > 100) {
            this.mousePositions.shift();
        }
    }

    private trackClick() {
        const now = Date.now();
        if (now - this.lastClickTime < 2000) {
            this.clickCount++;
        } else {
            this.clickCount = 1;
        }
        this.lastClickTime = now;
    }

    public async collectAllParams(): Promise<DivinationParams> {
        const location = await this.getLocation();

        return {
            timestamp: Date.now(),
            solarTerms: getSolarTerm(),
            lunarDate: getLunarDate(),
            hourBranch: this.getHourBranch(),
            weekday: new Date().getDay(),
            moonPhase: getMoonPhase(),
            longitude: location.longitude,
            latitude: location.latitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            city: 'Unknown',
            country: 'Unknown',
            deviceType: this.getDeviceType(),
            os: this.getOS(),
            browser: this.getBrowser(),
            screenResolution: [window.screen.width, window.screen.height],
            cpuCores: navigator.hardwareConcurrency || 4,
            connectionType: (navigator as any).connection?.effectiveType || 'unknown',
            downlink: (navigator as any).connection?.downlink || 50,
            randomSeed: this.generateCryptoSeed(),
            mouseEntropy: this.calculateMouseEntropy(),
            clickCadence: this.calculateClickCadence(),
            hoverHistory: undefined
        };
    }

    private async getLocation(): Promise<{ latitude: number, longitude: number }> {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    () => {
                        // Fallback to a random location if permission is denied
                        resolve({ latitude: 40.7128, longitude: -74.0060 });
                    },
                    { timeout: 5000 }
                );
            } else {
                resolve({ latitude: 40.7128, longitude: -74.0060 });
            }
        });
    }

    private getHourBranch(): string {
        const hour = new Date().getHours();
        const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        return branches[Math.floor(((hour + 1) % 24) / 2)];
    }

    private generateCryptoSeed(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private getDeviceType(): string {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return "tablet";
        }
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return "mobile";
        }
        return "desktop";
    }

    private getOS(): string {
        const platform = navigator.platform;
        const userAgent = navigator.userAgent;
        if (/Mac/i.test(platform)) return 'macOS';
        if (/Win/i.test(platform)) return 'Windows';
        if (/Linux/i.test(platform)) return 'Linux';
        if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
        if (/Android/.test(userAgent)) return 'Android';
        return 'Unknown';
    }

    private getBrowser(): string {
        const ua = navigator.userAgent;
        if (ua.includes("Firefox")) return "Firefox";
        if (ua.includes("SamsungBrowser")) return "Samsung Browser";
        if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
        if (ua.includes("Edge")) return "Edge";
        if (ua.includes("Chrome")) return "Chrome";
        if (ua.includes("Safari")) return "Safari";
        return "Unknown";
    }

    private calculateMouseEntropy(): number {
        if (this.mousePositions.length < 20) return 0.5;
        const angles: number[] = [];
        for (let i = 1; i < this.mousePositions.length - 1; i++) {
            const p1 = this.mousePositions[i-1];
            const p2 = this.mousePositions[i];
            const p3 = this.mousePositions[i+1];
            const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
            angles.push(angle);
        }
        const mean = angles.reduce((a, b) => a + b, 0) / angles.length;
        const variance = angles.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / angles.length;
        return Math.min(1, variance / 5);
    }

    private calculateClickCadence(): number {
        if (this.lastClickTime === 0) return 1;
        const duration = Date.now() - this.lastClickTime;
        return duration < 2000 ? this.clickCount / (duration / 1000) : 1;
    }
}