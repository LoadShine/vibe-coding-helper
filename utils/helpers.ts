// utils/helpers.ts
import type { LunarDate } from '../types';

// Solar terms data (approximate for any year)
const solarTermsData: { m: number, d: number, name: string }[] = [
    { m: 2, d: 4, name: '立春' }, { m: 2, d: 19, name: '雨水' },
    { m: 3, d: 5, name: '惊蛰' }, { m: 3, d: 20, name: '春分' },
    { m: 4, d: 4, name: '清明' }, { m: 4, d: 20, name: '谷雨' },
    { m: 5, d: 5, name: '立夏' }, { m: 5, d: 21, name: '小满' },
    { m: 6, d: 5, name: '芒种' }, { m: 6, d: 21, name: '夏至' },
    { m: 7, d: 7, name: '小暑' }, { m: 7, d: 23, name: '大暑' },
    { m: 8, d: 7, name: '立秋' }, { m: 8, d: 23, name: '处暑' },
    { m: 9, d: 7, name: '白露' }, { m: 9, d: 23, name: '秋分' },
    { m: 10, d: 8, name: '寒露' }, { m: 10, d: 23, name: '霜降' },
    { m: 11, d: 7, name: '立冬' }, { m: 11, d: 22, name: '小雪' },
    { m: 12, d: 7, name: '大雪' }, { m: 12, d: 21, name: '冬至' },
    { m: 1, d: 5, name: '小寒' }, { m: 1, d: 20, name: '大寒' },
];

export function getSolarTerm(date: Date = new Date()): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let term = '大寒'; // Default
    for (let i = 0; i < solarTermsData.length; i++) {
        const currentTerm = solarTermsData[i];
        if (month < currentTerm.m || (month === currentTerm.m && day < currentTerm.d)) {
            term = solarTermsData[(i + solarTermsData.length - 1) % solarTermsData.length].name;
            break;
        }
    }
    return term;
}

// Simplified Lunar Date calculation
export function getLunarDate(date: Date = new Date()): LunarDate {
    const lunarInfo = [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    ];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let total, m, n, k;
    let isEnd = false;
    const lunarYear = year - 1900;
    total = lunarYear * 365 + Math.floor(lunarYear / 4) + day - 26;

    if (year % 4 === 0 && month > 2) {
        total++;
    }

    for (m = 1; m <= month - 1; m++) {
        const daysInMonth = new Date(year, m, 0).getDate();
        total += daysInMonth;
    }

    const heavenlyStems = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'];
    const earthlyBranches = ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'];
    const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
    const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

    return {
        year: `${heavenlyStems[(year - 4) % 10]}${earthlyBranches[(year - 4) % 12]}年`,
        month: lunarMonths[date.getMonth()],
        day: lunarDays[date.getDate()-1]
    };
}


export function getMoonPhase(date: Date = new Date()): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let c = 0, e = 0, jd = 0;
    if (month < 3) {
        c = year - 1;
        e = month + 12;
    } else {
        c = year;
        e = month;
    }

    jd = Math.floor(365.25 * c) + Math.floor(30.6 * e) + day - 694039.09;
    jd /= 29.5305882;
    let b = Math.floor(jd);
    jd -= b;
    return jd;
}

export function normalize(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return Math.max(outMin, Math.min(outMax, ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin));
}