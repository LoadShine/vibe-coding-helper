// types.ts
export interface LunarDate {
    year: string;
    month: string;
    day: string;
}

export interface DivinationParams {
    // Time
    timestamp: number;
    solarTerms: string;
    lunarDate: LunarDate;
    hourBranch: string;
    weekday: number;
    moonPhase: number;

    // Geography
    longitude: number;
    latitude: number;
    timezone: string;
    city: string;
    country: string;

    // Device
    deviceType: string;
    os: string;
    browser: string;
    screenResolution: [number, number];
    cpuCores: number;

    // Network
    connectionType: string;
    downlink: number;

    // Randomness
    randomSeed: string;

    // User Behavior
    mouseEntropy: number;
    clickCadence: number;
    hoverHistory?: Map<string, number>;
}

export interface CompanyProfile {
    name: string;
    model: string;
    foundedYear: number;
    foundedMonth?: number;
    foundedDay?: number;
    founder: string[];
    headquarters: {
        city: string;
        country: string;
        longitude: number;
        latitude: number;
    };
}

export interface CompanyResult {
    company: CompanyProfile;
    score: number;
    rank: number;
}