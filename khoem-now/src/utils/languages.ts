// ============================================================
// KEI Data — Important World Languages
// 30 major countries / languages
// ============================================================
// NOTE: `id` is unique per row (used for selection); `code` is the plain
// ISO-639-1 language code and MAY repeat across countries that share a
// language (e.g. English in US/UK, Portuguese in Portugal/Brazil).
// Never use `code` alone as a list key or a <select>-style value.

export interface KEILanguage {
  id: string;
  country: string;
  language: string;
  code: string;
  nativeName: string;
}

export const KEI_LANGUAGES: KEILanguage[] = [
  { id: 'km-KH', country: 'Cambodia', language: 'Khmer', code: 'km', nativeName: 'ភាសាខ្មែរ' },
  { id: 'en-US', country: 'United States', language: 'English', code: 'en', nativeName: 'English' },
  { id: 'en-GB', country: 'United Kingdom', language: 'English', code: 'en', nativeName: 'English' },
  { id: 'zh-CN', country: 'China', language: 'Chinese', code: 'zh', nativeName: '中文' },
  { id: 'ja-JP', country: 'Japan', language: 'Japanese', code: 'ja', nativeName: '日本語' },
  { id: 'ko-KR', country: 'South Korea', language: 'Korean', code: 'ko', nativeName: '한국어' },
  { id: 'hi-IN', country: 'India', language: 'Hindi', code: 'hi', nativeName: 'हिन्दी' },
  { id: 'fr-FR', country: 'France', language: 'French', code: 'fr', nativeName: 'Français' },
  { id: 'de-DE', country: 'Germany', language: 'German', code: 'de', nativeName: 'Deutsch' },
  { id: 'es-ES', country: 'Spain', language: 'Spanish', code: 'es', nativeName: 'Español' },
  { id: 'it-IT', country: 'Italy', language: 'Italian', code: 'it', nativeName: 'Italiano' },
  { id: 'pt-PT', country: 'Portugal', language: 'Portuguese', code: 'pt', nativeName: 'Português' },
  { id: 'pt-BR', country: 'Brazil', language: 'Portuguese', code: 'pt', nativeName: 'Português' },
  { id: 'ru-RU', country: 'Russia', language: 'Russian', code: 'ru', nativeName: 'Русский' },
  { id: 'uk-UA', country: 'Ukraine', language: 'Ukrainian', code: 'uk', nativeName: 'Українська' },
  { id: 'tr-TR', country: 'Turkey', language: 'Turkish', code: 'tr', nativeName: 'Türkçe' },
  { id: 'ar-SA', country: 'Saudi Arabia', language: 'Arabic', code: 'ar', nativeName: 'العربية' },
  { id: 'ar-AE', country: 'United Arab Emirates', language: 'Arabic', code: 'ar', nativeName: 'العربية' },
  { id: 'fa-IR', country: 'Iran', language: 'Persian', code: 'fa', nativeName: 'فارسی' },
  { id: 'he-IL', country: 'Israel', language: 'Hebrew', code: 'he', nativeName: 'עברית' },
  { id: 'th-TH', country: 'Thailand', language: 'Thai', code: 'th', nativeName: 'ภาษาไทย' },
  { id: 'vi-VN', country: 'Vietnam', language: 'Vietnamese', code: 'vi', nativeName: 'Tiếng Việt' },
  { id: 'id-ID', country: 'Indonesia', language: 'Indonesian', code: 'id', nativeName: 'Bahasa Indonesia' },
  { id: 'ms-MY', country: 'Malaysia', language: 'Malay', code: 'ms', nativeName: 'Bahasa Melayu' },
  { id: 'fil-PH', country: 'Philippines', language: 'Filipino', code: 'fil', nativeName: 'Filipino' },
  { id: 'my-MM', country: 'Myanmar', language: 'Burmese', code: 'my', nativeName: 'မြန်မာဘာသာ' },
  { id: 'bn-BD', country: 'Bangladesh', language: 'Bengali', code: 'bn', nativeName: 'বাংলা' },
  { id: 'ur-PK', country: 'Pakistan', language: 'Urdu', code: 'ur', nativeName: 'اردو' },
  { id: 'nl-NL', country: 'Netherlands', language: 'Dutch', code: 'nl', nativeName: 'Nederlands' },
  { id: 'el-GR', country: 'Greece', language: 'Greek', code: 'el', nativeName: 'Ελληνικά' },
];
