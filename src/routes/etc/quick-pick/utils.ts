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
