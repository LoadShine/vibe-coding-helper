// constants.ts
import type { CompanyProfile } from './types';

export const COMPANIES: CompanyProfile[] = [
    {
        name: 'OpenAI',
        model: 'GPT-4o',
        foundedYear: 2015,
        foundedMonth: 12,
        foundedDay: 11,
        founder: ['Sam Altman', 'Elon Musk', 'Greg Brockman'],
        headquarters: { city: '旧金山', country: 'USA', longitude: -122.4194, latitude: 37.7749 }
    },
    {
        name: 'Anthropic',
        model: 'Claude 3.5',
        foundedYear: 2021,
        foundedMonth: 1,
        foundedDay: 1,
        founder: ['Dario Amodei', 'Daniela Amodei'],
        headquarters: { city: '旧金山', country: 'USA', longitude: -122.4194, latitude: 37.7749 }
    },
    {
        name: 'Google',
        model: 'Gemini 2.5',
        foundedYear: 1998,
        foundedMonth: 9,
        foundedDay: 4,
        founder: ['Larry Page', 'Sergey Brin'],
        headquarters: { city: '山景城', country: 'USA', longitude: -122.0840, latitude: 37.3861 }
    },
    {
        name: 'Meta',
        model: 'Llama 3',
        foundedYear: 2004,
        foundedMonth: 2,
        foundedDay: 4,
        founder: ['Mark Zuckerberg'],
        headquarters: { city: '门洛帕克', country: 'USA', longitude: -122.1817, latitude: 37.4529 }
    },
    {
        name: 'Mistral AI',
        model: 'Mixtral 8x22B',
        foundedYear: 2023,
        foundedMonth: 4,
        foundedDay: 1,
        founder: ['Arthur Mensch'],
        headquarters: { city: '巴黎', country: 'France', longitude: 2.3522, latitude: 48.8566 }
    },
    {
        name: 'xAI',
        model: 'Grok-2',
        foundedYear: 2023,
        foundedMonth: 7,
        foundedDay: 12,
        founder: ['Elon Musk'],
        headquarters: { city: '旧金山', country: 'USA', longitude: -122.4194, latitude: 37.7749 }
    },
    {
        name: '月之暗面',
        model: 'Kimi',
        foundedYear: 2023,
        foundedMonth: 3,
        foundedDay: 1,
        founder: ['杨植麟'],
        headquarters: { city: '北京', country: 'China', longitude: 116.4074, latitude: 39.9042 }
    },
    {
        name: '智谱AI',
        model: 'GLM-4',
        foundedYear: 2019,
        foundedMonth: 6,
        foundedDay: 1,
        founder: ['唐杰'],
        headquarters: { city: '北京', country: 'China', longitude: 116.4074, latitude: 39.9042 }
    },
    {
        name: '深度求索',
        model: 'DeepSeek-V2',
        foundedYear: 2023,
        foundedMonth: 3,
        foundedDay: 1,
        founder: ['梁文锋', '张鹏'],
        headquarters: { city: '北京', country: 'China', longitude: 116.4074, latitude: 39.9042 }
    },
    {
        name: '阿里巴巴',
        model: '通义千问 2.5',
        foundedYear: 1999,
        foundedMonth: 4,
        foundedDay: 4,
        founder: ['马云'],
        headquarters: { city: '杭州', country: 'China', longitude: 120.1551, latitude: 30.2741 }
    },
    {
        name: '字节跳动',
        model: '豆包',
        foundedYear: 2012,
        foundedMonth: 3,
        foundedDay: 1,
        founder: ['张一鸣'],
        headquarters: { city: '北京', country: 'China', longitude: 116.4074, latitude: 39.9042 }
    },
    {
        name: 'Cohere',
        model: 'Command R+',
        foundedYear: 2019,
        foundedMonth: 1,
        foundedDay: 1,
        founder: ['Aidan Gomez', 'Ivan Zhang', 'Nick Frosst'],
        headquarters: { city: '多伦多', country: 'Canada', longitude: -79.3832, latitude: 43.6532 }
    }
];

export const FOUNDER_PROFILES: Record<string, {
    lifePath: number;
    element: string;
    zodiac: string;
    charisma: number;
    innovation: number;
}> = {
    'Sam Altman': { lifePath: 5, element: '火', zodiac: 'Taurus', charisma: 0.95, innovation: 0.90 },
    'Elon Musk': { lifePath: 8, element: '金', zodiac: 'Cancer', charisma: 1.0, innovation: 1.0 },
    'Greg Brockman': { lifePath: 1, element: '土', zodiac: 'Virgo', charisma: 0.85, innovation: 0.92 },
    'Dario Amodei': { lifePath: 7, element: '水', zodiac: 'Unknown', charisma: 0.85, innovation: 0.95 },
    'Daniela Amodei': { lifePath: 9, element: '木', zodiac: 'Unknown', charisma: 0.80, innovation: 0.88 },
    'Larry Page': { lifePath: 4, element: '土', zodiac: 'Aries', charisma: 0.88, innovation: 0.98 },
    'Sergey Brin': { lifePath: 3, element: '木', zodiac: 'Leo', charisma: 0.86, innovation: 0.96 },
    'Mark Zuckerberg': { lifePath: 1, element: '火', zodiac: 'Taurus', charisma: 0.90, innovation: 0.92 },
    'Arthur Mensch': { lifePath: 6, element: '水', zodiac: 'Unknown', charisma: 0.75, innovation: 0.85 },
    'Aidan Gomez': { lifePath: 11, element: '气', zodiac: 'Unknown', charisma: 0.82, innovation: 0.91 },
    'Ivan Zhang': { lifePath: 3, element: '木', zodiac: 'Unknown', charisma: 0.78, innovation: 0.89 },
    'Nick Frosst': { lifePath: 9, element: '水', zodiac: 'Unknown', charisma: 0.80, innovation: 0.93 },
    '梁文锋': { lifePath: 2, element: '金', zodiac: 'Unknown', charisma: 0.70, innovation: 0.88 },
    '张鹏': { lifePath: 8, element: '木', zodiac: 'Unknown', charisma: 0.78, innovation: 0.82 },
    '唐杰': { lifePath: 5, element: '火', zodiac: 'Unknown', charisma: 0.80, innovation: 0.90 },
    '杨植麟': { lifePath: 9, element: '水', zodiac: 'Unknown', charisma: 0.82, innovation: 0.93 },
    '马云': { lifePath: 3, element: '木', zodiac: 'Libra', charisma: 1.0, innovation: 0.85 },
    '张一鸣': { lifePath: 7, element: '水', zodiac: 'Aries', charisma: 0.88, innovation: 0.94 }
};