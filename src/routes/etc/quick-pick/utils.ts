export const countryCodeToFlag = (code: string): string =>
    code.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');

// Maps ISO 639-1 language codes to a representative country flag.
// Skips ambiguous languages (en, es, ar, etc.) where language != clear country.
const LANGUAGE_TO_COUNTRY: Record<string, string> = {
    fr: 'FR', de: 'DE', ja: 'JP', ko: 'KR', zh: 'CN', it: 'IT',
    hi: 'IN', ru: 'RU', sv: 'SE', da: 'DK', no: 'NO', fi: 'FI',
    nl: 'NL', pl: 'PL', tr: 'TR', th: 'TH', he: 'IL', fa: 'IR',
    cs: 'CZ', hu: 'HU', ro: 'RO', uk: 'UA', el: 'GR', id: 'ID',
    vi: 'VN', pt: 'BR', ms: 'MY', ta: 'IN', te: 'IN',
};

export const languageCodeToFlag = (lang: string): string | undefined => {
    const country = LANGUAGE_TO_COUNTRY[lang];
    return country ? countryCodeToFlag(country) : undefined;
};

export const formatRuntime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h${m}m`;
};

// Deterministic Fisher-Yates shuffle seeded from a string (e.g. session ID)
export const seededShuffle = <T>(arr: T[], seed: string): T[] => {
    const out = [...arr];
    let s = seed.split('').reduce((acc, c) => Math.imul(acc, 31) + c.charCodeAt(0) | 0, 0);
    for (let i = out.length - 1; i > 0; i--) {
        s = Math.imul(s, 1664525) + 1013904223 | 0;
        const j = Math.abs(s) % (i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};
