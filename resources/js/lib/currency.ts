/**
 * تحويل العملات حسب الدولة لصفحة التسعير.
 * أسعار تقريبية ثابتة (وحدات لكل 1 دولار أمريكي).
 */

export interface Country {
    code: string;
    name_ar: string;
    currency: string;
}

export const COUNTRIES: Country[] = [
    { code: 'SA', name_ar: 'السعودية', currency: 'SAR' },
    { code: 'AE', name_ar: 'الإمارات', currency: 'AED' },
    { code: 'QA', name_ar: 'قطر', currency: 'QAR' },
    { code: 'KW', name_ar: 'الكويت', currency: 'KWD' },
    { code: 'BH', name_ar: 'البحرين', currency: 'BHD' },
    { code: 'OM', name_ar: 'عُمان', currency: 'OMR' },
    { code: 'US', name_ar: 'دول أخرى', currency: 'USD' },
];

/** وحدات العملة مقابل 1 دولار أمريكي. */
const USD_RATES: Record<string, number> = {
    USD: 1,
    SAR: 3.75,
    AED: 3.67,
    QAR: 3.64,
    KWD: 0.307,
    BHD: 0.376,
    OMR: 0.385,
};

/** رمز العملة بالعربية. */
export const CURRENCY_LABEL: Record<string, string> = {
    SAR: 'ر.س',
    AED: 'د.إ',
    QAR: 'ر.ق',
    KWD: 'د.ك',
    BHD: 'د.ب',
    OMR: 'ر.ع',
    USD: '$',
};

/** العملات ذات الوحدات الصغيرة (تُعرض بخانة عشرية واحدة). */
const SMALL_UNIT = new Set(['KWD', 'BHD', 'OMR']);

/** يحوّل مبلغًا من عملة لأخرى عبر الدولار كوسيط. */
export function convert(amount: number, from: string, to: string): number {
    const f = USD_RATES[from] ?? 1;
    const t = USD_RATES[to] ?? 1;
    return (amount / f) * t;
}

/** يصيغ المبلغ المُحوَّل برقم إنجليزي وفواصل. */
export function formatPrice(amount: number, from: string, to: string): string {
    const value = convert(amount, from, to);
    const decimals = SMALL_UNIT.has(to) ? 1 : 0;
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/** يخمّن دولة الزائر من إعدادات المتصفح (منطقة اللغة)، مع التحقق من المنطقة الزمنية. */
export function detectCountry(): Country {
    try {
        const fallback = COUNTRIES[0];
        const langs = (globalThis.navigator?.languages ?? [globalThis.navigator?.language]).filter(Boolean) as string[];
        for (const lang of langs) {
            const region = lang.split('-')[1]?.toUpperCase();
            const match = COUNTRIES.find((c) => c.code === region);
            if (match) return match;
        }
        // تخمين إضافي من المنطقة الزمنية الخليجية
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
        const tzMap: Record<string, string> = {
            'Asia/Riyadh': 'SA',
            'Asia/Dubai': 'AE',
            'Asia/Qatar': 'QA',
            'Asia/Kuwait': 'KW',
            'Asia/Bahrain': 'BH',
            'Asia/Muscat': 'OM',
        };
        const code = tzMap[tz];
        if (code) return COUNTRIES.find((c) => c.code === code) ?? fallback;
        return fallback;
    } catch {
        return COUNTRIES[0];
    }
}
