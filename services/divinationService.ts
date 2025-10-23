// services/divinationService.ts
import type { DivinationParams, CompanyProfile, LunarDate } from '../types';
import { COMPANIES, FOUNDER_PROFILES } from '../constants';
import { normalize } from '../utils/helpers';

// #region UTILITY & SHARED CONSTANTS
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
type HeavenlyStem = typeof HEAVENLY_STEMS[number];
type EarthlyBranch = typeof EARTHLY_BRANCHES[number];

const STEM_ELEMENTS: Record<HeavenlyStem, string> = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
const BRANCH_ELEMENTS: Record<EarthlyBranch, string> = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };

interface FourPillars {
    year: { stem: HeavenlyStem, branch: EarthlyBranch };
    month: { stem: HeavenlyStem, branch: EarthlyBranch };
    day: { stem: HeavenlyStem, branch: EarthlyBranch };
    hour: { stem: HeavenlyStem, branch: EarthlyBranch };
}
// #endregion

// #region ALGORITHMIC LAYERS (12 TOTAL)

// Layer 1: WuXing (Eastern Elemental System) - EXPANDED
class WuXingCalculator {
    private readonly INTERACTION_MATRIX = {
        '木': { '木': 0.5, '火': 1, '土': -1, '金': -0.8, '水': 0.9 },   // 生火, 克土, 耗水, 被金克
        '火': { '木': 0.9, '火': 0.5, '土': 1, '金': -1, '水': -0.8 },   // 生土, 克金, 耗木, 被水克
        '土': { '木': -1, '火': 0.9, '土': 0.5, '金': 1, '水': -0.8 },   // 生金, 克水, 耗火, 被木克
        '金': { '木': -0.8, '火': -1, '土': 0.9, '金': 0.5, '水': 1 },   // 生水, 克木, 耗土, 被火克
        '水': { '木': 1, '火': -0.8, '土': -1, '金': 0.9, '水': 0.5 }    // 生木, 克火, 耗金, 被土克
    };

    private getFourPillars(timestamp: number): FourPillars {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const hour = date.getHours();

        const yearCycle = (year - 4) % 60;
        const yearStem = HEAVENLY_STEMS[yearCycle % 10];
        const yearBranch = EARTHLY_BRANCHES[yearCycle % 12];

        const monthStemIndex = (yearCycle % 5 * 2 + month + 2) % 10;
        const monthStem = HEAVENLY_STEMS[monthStemIndex];
        const monthBranch = EARTHLY_BRANCHES[(month + 2) % 12];

        const epoch = new Date(1900, 0, 1);
        const dayDiff = Math.floor((timestamp - epoch.getTime()) / 86400000) + 10;
        const dayStem = HEAVENLY_STEMS[dayDiff % 10];
        const dayBranch = EARTHLY_BRANCHES[(dayDiff + 10) % 12];

        const hourBranch = EARTHLY_BRANCHES[Math.floor(((hour + 1) % 24) / 2)];
        const hourStemIndex = (dayDiff % 5 * 2 + EARTHLY_BRANCHES.indexOf(hourBranch)) % 10;
        const hourStem = HEAVENLY_STEMS[hourStemIndex];

        return {
            year: { stem: yearStem, branch: yearBranch },
            month: { stem: monthStem, branch: monthBranch },
            day: { stem: dayStem, branch: dayBranch },
            hour: { stem: hourStem, branch: hourBranch },
        };
    }

    private analyzePillarInteractions(timePillars: FourPillars, companyPillars: FourPillars): number {
        let score = 0;
        const branchClash: Record<string, string> = {'子':'午', '丑':'未', '寅':'申', '卯':'酉', '辰':'戌', '巳':'亥'};
        const branchCombo: Record<string, string> = {'子':'丑', '寅':'亥', '卯':'戌', '辰':'酉', '巳':'申', '午':'未'};

        // Compare each pillar
        (Object.keys(timePillars) as Array<keyof FourPillars>).forEach(pillar => {
            const timeBranch = timePillars[pillar].branch;
            const compBranch = companyPillars[pillar].branch;

            // Clashes are negative
            if (branchClash[timeBranch] === compBranch || branchClash[compBranch] === timeBranch) {
                score -= 0.25;
            }
            // Combinations are positive
            if (branchCombo[timeBranch] === compBranch || branchCombo[compBranch] === timeBranch) {
                score += 0.25;
            }
        });
        return score;
    }

    calculate(params: DivinationParams, company: CompanyProfile): number {
        const timePillars = this.getFourPillars(params.timestamp);
        const companyPillars = this.getFourPillars(new Date(company.foundedYear, company.foundedMonth! - 1, company.foundedDay).getTime());

        const hourElement = BRANCH_ELEMENTS[timePillars.hour.branch];
        const companyElement = STEM_ELEMENTS[companyPillars.year.stem];
        const locationElement = this.getLocationElement(params.longitude, params.latitude);
        const deviceElement = this.getDeviceElement(params.os);

        let harmony = 0;
        harmony += this.INTERACTION_MATRIX[hourElement][companyElement] * 0.3;
        harmony += this.INTERACTION_MATRIX[locationElement][companyElement] * 0.2;
        harmony += this.INTERACTION_MATRIX[deviceElement][companyElement] * 0.15;

        const pillarInteractionScore = this.analyzePillarInteractions(timePillars, companyPillars);
        harmony += pillarInteractionScore * 0.35;

        return normalize(harmony, -1.5, 1.5, 0, 20);
    }

    private getLocationElement(lon: number, lat: number): string {
        const angle = (Math.atan2(lat, lon) * 180 / Math.PI + 360) % 360;
        if (angle >= 337.5 || angle < 22.5) return '水'; if (angle < 67.5) return '土'; if (angle < 112.5) return '木';
        if (angle < 157.5) return '木'; if (angle < 202.5) return '火'; if (angle < 247.5) return '土';
        if (angle < 292.5) return '金'; return '金';
    }
    private getDeviceElement = (os: string): string => ({'Windows': '金', 'macOS': '木', 'Linux': '水', 'iOS': '火', 'Android': '土'}[os] || '土');
}

// Layer 2: Western Astrology - EXPANDED
class AstrologyCalculator {
    private readonly PLANET_CYCLES = { Sun: 365.25, Moon: 27.32, Mercury: 87.97, Venus: 224.7, Mars: 686.98, Jupiter: 4332.59, Saturn: 10759.22, Uranus: 30688.5, Neptune: 60182, Pluto: 90560 };
    private readonly ASTEROIDS = { Ceres: 1680, Pallas: 1686, Juno: 1592, Vesta: 1325 };

    private getPlanetPosition(planet: keyof typeof this.PLANET_CYCLES, timestamp: number): number {
        const baseTime = new Date('2000-01-01').getTime();
        const cycle = this.PLANET_CYCLES[planet] * 86400000;
        // Add a simple perturbation to make it look more complex
        const perturbation = Math.sin(timestamp / (cycle / 100)) * 2;
        return (((timestamp - baseTime) / cycle) * 360 + perturbation) % 360;
    }

    calculate(params: DivinationParams, company: CompanyProfile): number {
        const companyBirthday = new Date(company.foundedYear, (company.foundedMonth || 1) - 1, company.foundedDay || 1).getTime();

        let planetaryInfluence = 0;
        for (const p of Object.keys(this.PLANET_CYCLES) as Array<keyof typeof this.PLANET_CYCLES>) {
            const currentPos = this.getPlanetPosition(p, params.timestamp);
            const companyPos = this.getPlanetPosition(p, companyBirthday);
            const angle = Math.abs(currentPos - companyPos);
            planetaryInfluence += this.getAspectScore(angle);
        }

        let asteroidInfluence = 0;
        for (const a of Object.keys(this.ASTEROIDS) as Array<keyof typeof this.ASTEROIDS>) {
            const currentPos = this.getPlanetPosition('Mercury', params.timestamp); // Use a proxy planet
            const companyPos = (((companyBirthday - new Date('2000-01-01').getTime()) / (this.ASTEROIDS[a] * 86400000)) * 360) % 360;
            const angle = Math.abs(currentPos - companyPos);
            asteroidInfluence += this.getAspectScore(angle) * 0.2; // Asteroids have less weight
        }

        const houseScore = this.calculateHousePosition(params);
        const lunarInfluence = this.getMoonPhaseInfluence(params.moonPhase);

        const finalScore = (planetaryInfluence * 0.5) + (asteroidInfluence * 0.15) + (houseScore * 0.2) + (lunarInfluence * 0.15);
        return normalize(finalScore, -5, 10, 0, 20);
    }

    private getAspectScore(angle: number): number {
        const isNear = (target: number, tol: number) => Math.abs(angle - target) <= tol || Math.abs(angle - (360 - target)) <= tol;
        if (isNear(0, 8)) return 1.0;     // Conjunction
        if (isNear(180, 8)) return -1.0;  // Opposition
        if (isNear(90, 7)) return -0.8;   // Square
        if (isNear(120, 7)) return 0.9;   // Trine
        if (isNear(60, 5)) return 0.6;    // Sextile
        return 0;
    }

    private calculateHousePosition(params: DivinationParams): number {
        const LST = (params.timestamp % 86400000) / 3600000 * 15 + params.longitude;
        const ascendant = (Math.atan(Math.tan(LST * Math.PI / 180) * Math.cos(23.44 * Math.PI / 180)) * 180 / Math.PI + 360) % 360;
        const house = Math.floor(ascendant / 30) + 1;
        const houseScores: {[key: number]: number} = { 1: 0.8, 2: 0.6, 3: 0.9, 4: 0.5, 5: 0.85, 6: 0.95, 7: 0.7, 8: 0.4, 9: 0.75, 10: 0.9, 11: 0.8, 12: 0.3 };
        return houseScores[house] || 0.5;
    }

    private getMoonPhaseInfluence(moonPhase: number): number {
        // Curve representing waxing/waning energy
        return 0.5 + 0.5 * Math.sin(moonPhase * 2 * Math.PI - Math.PI / 2);
    }
}

// Layer 3: Numerology - EXPANDED
class NumerologyCalculator {
    calculate(params: DivinationParams, company: CompanyProfile): number {
        // Pythagorean
        const companyLifePathP = this.calculateLifePath(company.foundedYear, company.foundedMonth || 1, company.foundedDay || 1, 'P');
        const companyNameNumberP = this.calculateNameNumber(company.name, 'P');
        // Chaldean
        const companyNameNumberC = this.calculateNameNumber(company.name, 'C');

        const currentMoment = this.calculateMomentNumber(params.timestamp);
        const angelBonus = this.checkAngelNumbers(params.timestamp);

        const harmonyP = Math.abs(companyLifePathP - currentMoment) <= 1 ? 1 : 1 / (Math.abs(companyLifePathP - currentMoment) + 1);
        const harmonyC = Math.abs(companyNameNumberC - currentMoment) <= 1 ? 1 : 1 / (Math.abs(companyNameNumberC - currentMoment) + 1);
        const nameResonance = Math.abs(companyNameNumberP - companyNameNumberC) <= 1 ? 1 : 0.5;

        const finalScore = (harmonyP * 0.3) + (harmonyC * 0.3) + (angelBonus * 0.2) + (nameResonance * 0.2);
        return normalize(finalScore, 0.1, 1, 0, 20);
    }

    private digitSum = (num: number): number => num.toString().split('').reduce((s, d) => s + parseInt(d), 0);
    private reduceToSingleDigit = (num: number): number => { while (num > 9 && num !== 11 && num !== 22 && num !== 33) { num = this.digitSum(num); } return num; };
    private calculateLifePath = (y: number, m: number, d: number, sys: 'P'|'C'): number => this.reduceToSingleDigit(this.digitSum(y) + this.digitSum(m) + this.digitSum(d));
    private calculateMomentNumber = (ts: number): number => { const d = new Date(ts); return this.reduceToSingleDigit(d.getFullYear() + d.getMonth() + 1 + d.getDate() + d.getHours() + d.getMinutes()); };

    private calculateNameNumber(name: string, system: 'P' | 'C'): number {
        const P_VALS: {[k:string]:number} = { A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8 };
        const C_VALS: {[k:string]:number} = { A:1,B:2,C:3,D:4,E:5,U:6,O:7,F:8,P:8,I:1,J:1,Q:1,Y:1,K:2,G:3,L:3,S:3,M:4,T:4,N:5,H:5,X:5,V:6,W:6,Z:7,R:9 };
        const values = system === 'P' ? P_VALS : C_VALS;
        const sum = name.toUpperCase().replace(/[^A-Z]/g, '').split('').reduce((s, c) => s + (values[c] || 0), 0);
        return this.reduceToSingleDigit(sum);
    }

    private checkAngelNumbers(timestamp: number): number {
        const t = new Date(timestamp);
        const timeStr = `${t.getHours().toString().padStart(2,'0')}${t.getMinutes().toString().padStart(2,'0')}${t.getSeconds().toString().padStart(2,'0')}`;
        if (/(\d)\1{2,}/.test(timeStr)) return 1.0;
        if (/123|234|345|456|567|678|789/.test(timeStr)) return 0.9;
        return 0.5;
    }
}

// Layer 4: Feng Shui - EXPANDED
class FengShuiCalculator {
    // 24 Mountains Directions
    private readonly MOUNTAINS = ['子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬'];

    calculate(params: DivinationParams, company: CompanyProfile): number {
        const bearing = this.calculateBearing(params.latitude, params.longitude, company.headquarters.latitude, company.headquarters.longitude);
        const mountainIndex = Math.floor((bearing + 7.5) / 15) % 24;
        const mountain = this.MOUNTAINS[mountainIndex];

        // Flying Stars calculation
        const currentYearStar = (new Date(params.timestamp).getFullYear() - 2020) % 9 + 5;
        const companyStar = (company.foundedYear - 1984) % 9 + 1;
        const starHarmony = 1 - (Math.abs(currentYearStar - companyStar) / 8);

        const distanceScore = this.calculateEnergyByDistance(params.latitude, params.longitude, company.headquarters.latitude, company.headquarters.longitude);

        const finalScore = starHarmony * 0.5 + this.getMountainScore(mountain) * 0.3 + distanceScore * 0.2;
        return normalize(finalScore, 0.2, 1, 0, 20);
    }

    private calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
        const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }

    private calculateEnergyByDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; const dLat = (lat2-lat1) * Math.PI/180; const dLon = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
        const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.exp(-distance / 10000); // Exponential decay
    }

    private getMountainScore(mountain: string): number {
        const auspicious = ['子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬'];
        const scores = [0.9,0.8,0.7,0.8,0.9,1.0,0.9,0.8,0.7,0.8,0.9,1.0,0.9,0.8,0.7,0.8,0.9,1.0,0.9,0.8,0.7,0.8,0.9,1.0];
        return scores[auspicious.indexOf(mountain)] || 0.5;
    }
}

// Layer 5: Quantum Entropy & Chaos - EXPANDED
class QuantumEntropyCalculator {
    calculate(params: DivinationParams, company: CompanyProfile): number {
        const seedEntropy = this.analyzeSeedEntropy(params.randomSeed);
        const temporalChaos = this.calculateLorenzAttractor(params.timestamp);
        const hashResonance = this.calculateHashResonance(company.name, params.randomSeed);
        const mouseFFT = this.analyzeMouseFFT(params);

        const finalScore = seedEntropy * 0.2 + temporalChaos * 0.25 + hashResonance * 0.2 + mouseFFT * 0.2 + params.mouseEntropy * 0.15;
        return normalize(finalScore, 0, 1, 0, 20);
    }

    private analyzeSeedEntropy(seed: string): number {
        const freq: Record<string, number> = {};
        for (const char of seed) { freq[char] = (freq[char] || 0) + 1; }
        let entropy = 0; const len = seed.length;
        for (const count of Object.values(freq)) { const p = count / len; entropy -= p * Math.log2(p); }
        return Math.min(entropy / 4, 1);
    }

    private calculateLorenzAttractor(timestamp: number): number {
        let x = 0.1, y = 0, z = 0;
        const a = 10, b = 28, c = 8 / 3;
        const dt = 0.01;
        const seed = (timestamp % 1000) / 1000;
        x += seed * 0.01;

        for (let i = 0; i < 100; i++) {
            const dx = a * (y - x);
            const dy = x * (b - z) - y;
            const dz = x * y - c * z;
            x += dx * dt; y += dy * dt; z += dz * dt;
        }
        return normalize(z, 0, 50, 0, 1);
    }

    private simpleHash(str: string): number { let h = 0; for(let i=0;i<str.length;i++) h = (Math.imul(31,h) + str.charCodeAt(i))|0; return Math.abs(h); }
    private calculateHashResonance(companyName: string, seed: string): number {
        const h1 = this.simpleHash(companyName); const h2 = this.simpleHash(seed);
        const hw = (h1 ^ h2).toString(2).split('1').length - 1;
        return 1 - (hw / 32);
    }

    private analyzeMouseFFT(params: DivinationParams): number {
        // Dummy FFT as a full implementation is too large. Represents complexity.
        const entropy = params.mouseEntropy;
        // High entropy (chaotic movement) resonates with high-frequency energy (innovation)
        // Low entropy (smooth movement) resonates with low-frequency energy (stability)
        const highFreqEnergy = Math.pow(entropy, 2);
        const lowFreqEnergy = Math.pow(1 - entropy, 2);
        // Return a blend, favoring high frequency
        return (highFreqEnergy * 0.7 + lowFreqEnergy * 0.3);
    }
}

// Layer 6: Founder Destiny - EXPANDED
class FounderDestinyCalculator {
    calculate(params: DivinationParams, company: CompanyProfile): number {
        if (!company.founder || company.founder.length === 0) return 10;
        const foundersEnergy = this.calculateFoundersEnergy(company.founder);
        const destinyAlignment = this.calculateDestinyAlignment(params, company.founder);
        const teamBonus = this.calculateTeamBonus(company.founder.length);
        const balanceScore = this.calculateLeadershipBalance(company.founder);
        const culturalDiversity = this.calculateCulturalDiversity(company.founder);

        const finalScore = foundersEnergy * 0.3 + destinyAlignment * 0.25 + teamBonus * 0.15 + balanceScore * 0.15 + culturalDiversity * 0.15;
        return normalize(finalScore, 0.4, 1, 0, 20);
    }

    private calculateFoundersEnergy(founders: string[]): number {
        const { totalCharisma, totalInnovation, count } = founders.reduce((acc, f) => {
            const p = FOUNDER_PROFILES[f];
            if(p) { acc.totalCharisma += p.charisma; acc.totalInnovation += p.innovation; acc.count++; }
            return acc;
        }, { totalCharisma: 0, totalInnovation: 0, count: 0 });
        if (count === 0) return 0.7;
        return Math.sqrt((totalCharisma / count) * (totalInnovation / count));
    }

    private calculateDestinyAlignment(params: DivinationParams, founders: string[]): number {
        let totalAlignment = 0; let count = 0;
        const currentLifePath = new Date(params.timestamp).getHours() % 9 + 1;
        for (const founder of founders) {
            const profile = FOUNDER_PROFILES[founder];
            if (profile) {
                const lifePathDiff = Math.abs(profile.lifePath - currentLifePath);
                totalAlignment += (1 - (lifePathDiff / 9));
                count++;
            }
        }
        return count > 0 ? totalAlignment / count : 0.5;
    }

    private calculateTeamBonus = (count: number) => (count === 1 ? 0.8 : count === 2 ? 1.0 : count === 3 ? 0.95 : 0.85);

    private calculateLeadershipBalance(founders: string[]): number {
        const { totalCharisma, totalInnovation, count } = founders.reduce((acc, f) => {
            const p = FOUNDER_PROFILES[f];
            if(p) { acc.totalCharisma += p.charisma; acc.totalInnovation += p.innovation; acc.count++; }
            return acc;
        }, { totalCharisma: 0, totalInnovation: 0, count: 0 });
        if (count === 0) return 0.5;
        const avgC = totalCharisma / count; const avgI = totalInnovation / count;
        const balance = 1 - Math.abs(avgC - avgI);
        const overall = (avgC + avgI) / 2;
        return balance * 0.4 + overall * 0.6;
    }

    private calculateCulturalDiversity(founders: string[]): number {
        const hasChinese = founders.some(f => /[\u4e00-\u9fa5]/.test(f));
        const hasWestern = founders.some(f => !/[\u4e00-\u9fa5]/.test(f));
        return (hasChinese && hasWestern) ? 1.0 : 0.85;
    }
}

// Layer 7: User Behavior - EXPANDED
class UserBehaviorCalculator {
    calculate(params: DivinationParams, company: CompanyProfile): number {
        const intentionScore = 1 / (1 + Math.exp(-10 * (params.mouseEntropy - 0.5)));
        const psychologicalState = params.clickCadence > 2 ? 0.7 : (params.clickCadence > 0.5 ? 1.0 : 0.85);
        let hoverBonus = 0.5;
        if (params.hoverHistory && params.hoverHistory.size > 0) {
            const total = Array.from(params.hoverHistory.values()).reduce((a, b) => a + b, 0);
            if (total > 0) {
                const companyHover = params.hoverHistory.get(company.name) || 0;
                hoverBonus = Math.pow(companyHover / total, 0.7);
            }
        }
        const osAlignment = this.calculateHabitAlignment(params.os, company.name);
        const finalScore = intentionScore * 0.25 + psychologicalState * 0.20 + hoverBonus * 0.30 + osAlignment * 0.25;
        return normalize(finalScore, 0.2, 1, 0, 20);
    }

    private calculateHabitAlignment(os: string, companyName: string): number {
        const alignmentMap: Record<string, Record<string, number>> = {
            'macOS': {'OpenAI': 0.95,'Anthropic': 0.93,'Google': 0.85,'Meta': 0.80,'xAI': 0.90,'Mistral AI': 0.88,'Cohere': 0.82,'月之暗面': 0.88},
            'Windows': {'OpenAI': 0.90,'Google': 0.92,'Meta': 0.88,'Cohere': 0.85,'深度求索': 0.88,'智谱AI': 0.90,'阿里巴巴': 0.92,'字节跳动': 0.94},
            'Linux': {'Meta': 0.98,'Mistral AI': 0.95,'Cohere': 0.92,'深度求索': 0.96,'xAI': 0.90, 'Google': 0.85, '智谱AI': 0.93},
            'iOS': {'字节跳动': 0.95, 'Meta': 0.92, 'Google': 0.90, 'OpenAI': 0.88},
            'Android': {'Google': 0.98, '字节跳动': 0.96, '阿里巴巴': 0.93, 'Meta': 0.91}
        };
        return alignmentMap[os]?.[companyName] || 0.80;
    }

    public hoverHistory = new Map<string, number>();
    public recordHover = (name: string, duration: number) => this.hoverHistory.set(name, (this.hoverHistory.get(name) || 0) + duration);
    public getHoverHistory = () => new Map(this.hoverHistory);
    public resetHoverHistory = () => this.hoverHistory.clear();
}

// Layer 8: I-Ching Hexagram Oracle - NEW
class IChingCalculator {
    // Hexagram judgments simplified and mapped to tech concepts
    private readonly H_DATA: {[k:number]: {name: string, score: number}} = {0:{name:'坤',score:0.8},1:{name:'剥',score:0.2},/*...*/63:{name:'既济',score:0.9}};

    calculate(params: DivinationParams): number {
        const seed = BigInt('0x' + params.randomSeed);
        let lines: number[] = [];
        for(let i=0; i < 6; i++) {
            const rand = Number(seed >> BigInt(i*8) & 0xFFn);
            // Simulate yarrow stalk method
            const c1 = rand % 4 + 5;
            const c2 = (rand >> 2) % 4 + 5;
            const c3 = (rand >> 4) % 4 + 5;
            const r1 = c1 % 2 === 0 ? 2 : 3;
            const r2 = c2 % 2 === 0 ? 2 : 3;
            const r3 = c3 % 2 === 0 ? 2 : 3;
            lines.push(r1+r2+r3);
        }

        const isYin = (l:number) => l % 2 === 0;
        const primaryBinary = lines.map(l => isYin(l) ? '0' : '1').join('');
        const primaryIndex = parseInt(primaryBinary, 2);

        const hasChangingLines = lines.some(l => l === 6 || l === 9);
        if(!hasChangingLines) return (this.H_DATA[primaryIndex]?.score || 0.5) * 15;

        const secondaryBinary = lines.map(l => l === 6 ? '1' : l === 9 ? '0' : (isYin(l) ? '0' : '1')).join('');
        const secondaryIndex = parseInt(secondaryBinary, 2);

        const primaryScore = this.H_DATA[primaryIndex]?.score || 0.5;
        const secondaryScore = this.H_DATA[secondaryIndex]?.score || 0.5;

        return (primaryScore * 0.6 + secondaryScore * 0.4) * 15;
    }
}

// Layer 9: Kabbalah Gematria & Tree of Life - NEW
class KabbalahCalculator {
    private readonly SEPHIROTH_SCORES = [1.0, 0.9, 0.8, 0.85, 0.7, 0.95, 0.75, 0.6, 1.0, 0.5]; // Keter to Malkuth

    private gematria(text: string): number {
        const values: {[k:string]: number} = {A:1,B:2,C:3,D:4,E:5,F:80,G:3,H:8,I:10,J:10,K:20,L:30,M:40,N:50,O:70,P:80,Q:100,R:200,S:300,T:9,U:6,V:6,W:6,X:60,Y:10,Z:7};
        let sum = text.toUpperCase().replace(/[^A-Z]/g, '').split('').reduce((s, c) => s + (values[c] || 0), 0);
        while(sum > 9) { sum = String(sum).split('').reduce((s,d)=>s+parseInt(d),0); }
        return sum;
    }
    calculate(params: DivinationParams, company: CompanyProfile): number {
        const companyPath = this.gematria(company.name);
        const modelPath = this.gematria(company.model);
        const sephirahIndex = (companyPath + modelPath + (new Date(params.timestamp).getDay())) % 10;
        return this.SEPHIROTH_SCORES[sephirahIndex] * 10;
    }
}

// Layer 10: Tarot Reading - NEW
class TarotCalculator {
    private readonly CARDS = 78; // 0-21 Major, 22-77 Minor
    calculate(params: DivinationParams): number {
        const seed = parseInt(params.randomSeed.slice(-8), 16);
        const card1 = (seed) % this.CARDS;
        const card2 = (seed >> 8) % this.CARDS;
        const card3 = (seed >> 16) % this.CARDS;

        const score1 = this.getCardScore(card1);
        const score2 = this.getCardScore(card2);
        const score3 = this.getCardScore(card3);

        // Past, Present, Future weighting
        return (score1 * 0.2 + score2 * 0.5 + score3 * 0.3) * 10;
    }
    private getCardScore(card: number): number {
        // Major Arcana are more potent
        if (card <= 21) return (1 - Math.abs(10.5 - card) / 10.5) * 1.2;
        // Minor Arcana score based on suit/number (simplified)
        const suit = Math.floor((card - 22) / 14); // 0-3
        const number = (card - 22) % 14 + 1; // 1-14
        const suitModifier = [0.9, 1.0, 0.8, 1.1][suit]; // Wands, Cups, Swords, Pentacles
        return (number / 14) * suitModifier;
    }
}

// Layer 11: Eigenvector Resonance Matrix - NEW (Final Math Layer)
class EigenvectorCalculator {
    // This is a fixed matrix representing the "cosmic interactions" between layers
    private readonly COSMIC_MATRIX = [
        [1.0, 0.5, 0.3, 0.6, 0.2, 0.4, 0.1, 0.7, 0.4, 0.3], // WuXing
        [0.5, 1.0, 0.6, 0.4, 0.3, 0.5, 0.2, 0.3, 0.7, 0.5], // Astrology
        [0.3, 0.6, 1.0, 0.2, 0.5, 0.6, 0.4, 0.4, 0.8, 0.7], // Numerology
        [0.6, 0.4, 0.2, 1.0, 0.3, 0.5, 0.1, 0.8, 0.2, 0.1], // FengShui
        [0.2, 0.3, 0.5, 0.3, 1.0, 0.4, 0.8, 0.5, 0.6, 0.9], // Quantum
        [0.4, 0.5, 0.6, 0.5, 0.4, 1.0, 0.7, 0.3, 0.6, 0.5], // Founder
        [0.1, 0.2, 0.4, 0.1, 0.8, 0.7, 1.0, 0.2, 0.5, 0.8], // Behavior
        [0.7, 0.3, 0.4, 0.8, 0.5, 0.3, 0.2, 1.0, 0.4, 0.3], // IChing
        [0.4, 0.7, 0.8, 0.2, 0.6, 0.6, 0.5, 0.4, 1.0, 0.8], // Kabbalah
        [0.3, 0.5, 0.7, 0.1, 0.9, 0.5, 0.8, 0.3, 0.8, 1.0], // Tarot
    ];

    private getPrincipalEigenvector(): number[] {
        let b_k = Array(10).fill(1);
        for (let i = 0; i < 20; i++) { // Power iteration
            const Ab_k = this.matrixVectorMultiply(this.COSMIC_MATRIX, b_k);
            const norm = Math.sqrt(Ab_k.reduce((s, v) => s + v*v, 0));
            b_k = Ab_k.map(v => v / norm);
        }
        return b_k;
    }

    private matrixVectorMultiply(A: number[][], v: number[]): number[] {
        return A.map(row => row.reduce((sum, val, j) => sum + val * v[j], 0));
    }

    public calculateResonance(scores: Record<string, number>): number {
        const eigenvector = this.getPrincipalEigenvector();
        const scoreVector = [scores.wuxing, scores.astrology, scores.numerology, scores.fengshui, scores.quantum, scores.founder, scores.behavior, scores.iching, scores.kabbalah, scores.tarot].map(s => s/20); // Normalize scores
        const dotProduct = scoreVector.reduce((sum, val, i) => sum + val * eigenvector[i], 0);
        return normalize(dotProduct, 0, 1, 0.8, 1.2); // Resonance acts as a final multiplier
    }
}

// #endregion

// Main Divination Service
export class VibeCodingDivination {
    private calculators = {
        wuxing: new WuXingCalculator(),
        astrology: new AstrologyCalculator(),
        numerology: new NumerologyCalculator(),
        fengshui: new FengShuiCalculator(),
        quantum: new QuantumEntropyCalculator(),
        founder: new FounderDestinyCalculator(),
        behavior: new UserBehaviorCalculator(),
        iching: new IChingCalculator(),
        kabbalah: new KabbalahCalculator(),
        tarot: new TarotCalculator(),
    };
    private eigenvector = new EigenvectorCalculator();
    private rerollCount = new Map<string, number>();

    public divineAllCompanies(params: DivinationParams, isReroll: boolean = false) {
        // === MODIFIED HERE ===
        if (isReroll && (this.rerollCount.get(params.hourBranch) || 0) >= 7) {
            throw new Error('本时辰夺运次数已用尽，请等待下一时辰');
        }

        const results = COMPANIES.map(company => {
            const rawScores = Object.fromEntries(
                Object.entries(this.calculators).map(([key, calculator]) => {
                    try {
                        // @ts-ignore
                        return [key, calculator.calculate(params, company)];
                    } catch(e) {
                        console.error(`Error in calculator ${key} for ${company.name}:`, e);
                        return [key, 5]; // Default score on error
                    }
                })
            ) as Record<keyof typeof this.calculators, number>;

            return { company, rawScores };
        });

        const finalResults = results.map(({ company, rawScores }) => {
            const weights = this.calculateDynamicWeights(params.hourBranch, isReroll);

            // Normalize each raw score by its potential max value before applying weight
            const scoreValues = Object.values(rawScores);
            const maxScores = [20,20,20,20,20,20,20,15,10,10];
            const normalizedScores = scoreValues.map((s, i) => s / maxScores[i]);

            let baseScore = Object.keys(weights).reduce((acc, key, i) => acc + normalizedScores[i] * weights[key as keyof typeof weights], 0);
            baseScore *= 100; // Scale to 0-100 before bonuses

            const resonanceMultiplier = this.eigenvector.calculateResonance(rawScores);

            const hourBonus = this.getHourBonus(params.hourBranch, company);
            const solarTermBonus = this.getSolarTermBonus(params.solarTerms, company);
            const moonPhaseBonus = this.getMoonPhaseBonus(params.moonPhase, company);

            const finalScore = (baseScore + hourBonus + solarTermBonus + moonPhaseBonus) * resonanceMultiplier;
            return { company, score: parseFloat(Math.min(100, Math.max(0, finalScore)).toFixed(2)), rank: 0 };
        });

        finalResults.sort((a, b) => b.score - a.score);
        finalResults.forEach((r, i) => r.rank = i + 1);

        if (isReroll) this.rerollCount.set(params.hourBranch, (this.rerollCount.get(params.hourBranch) || 0) + 1);

        return finalResults;
    }

    private calculateDynamicWeights(hour: string, isReroll: boolean) {
        let weights: Record<keyof typeof this.calculators, number> = {
            wuxing: 0.15, astrology: 0.13, numerology: 0.11, fengshui: 0.10,
            quantum: 0.12, founder: 0.11, behavior: 0.08,
            iching: 0.08, kabbalah: 0.07, tarot: 0.05
        };
        if (isReroll) {
            weights = {
                wuxing: 0.10, astrology: 0.08, numerology: 0.07, fengshui: 0.06,
                quantum: 0.10, founder: 0.08, behavior: 0.40, // Behavior is supreme
                iching: 0.04, kabbalah: 0.04, tarot: 0.03
            };
        }
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        Object.keys(weights).forEach(key => weights[key as keyof typeof weights] /= sum);
        return weights;
    }

    private getHourBonus = (hour: string, company: CompanyProfile) => ({'子':{'xAI':5,'OpenAI':4},'寅':{'月之暗面':5},'卯':{'Google':4.5},'巳':{'OpenAI':5},'午':{'Meta':4.8},'未':{'阿里巴巴':5},'申':{'xAI':4.8},'酉':{'Mistral AI':5},'亥':{'xAI':5}}[hour]?.[company.name] || 0);

    private getSolarTermBonus(term: string, company: CompanyProfile): number {
        const spring = ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨'];
        const summer = ['立夏', '小满', '芒种', '夏至', '小暑', '大暑'];
        const autumn = ['立秋', '处暑', '白露', '秋分', '寒露', '霜降'];
        const winter = ['立冬', '小雪', '大雪', '冬至', '小寒', '大寒'];
        if(spring.includes(term) && ['OpenAI','xAI','月之暗面'].includes(company.name)) return 2.5;
        if(summer.includes(term) && ['Meta', '字节跳动', 'Google'].includes(company.name)) return 2.8;
        if(autumn.includes(term) && ['Google', '阿里巴巴', 'Anthropic'].includes(company.name)) return 3.0;
        if(winter.includes(term) && ['深度求索', 'Anthropic', 'Mistral AI'].includes(company.name)) return 3.2;
        return 0;
    };

    private getMoonPhaseBonus(moonPhase: number, company: CompanyProfile): number {
        if (moonPhase > 0.95 || moonPhase < 0.05) { // New Moon
            if (['OpenAI', 'xAI', '月之暗面'].includes(company.name)) return 2.0;
        } else if (moonPhase > 0.45 && moonPhase < 0.55) { // Full Moon
            if (['Google', '阿里巴巴', 'Meta'].includes(company.name)) return 2.5;
        }
        return 0;
    }

    // === MODIFIED HERE ===
    public getRemainingRerolls = (hour: string) => Math.max(0, 7 - (this.rerollCount.get(hour) || 0));

    public resetBehaviorTracking = () => this.calculators.behavior.resetHoverHistory();
}