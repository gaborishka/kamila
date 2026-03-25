export interface CountryEntry {
  code: string;       // calling code, e.g. "+380"
  country: string;    // country name
  flag: string;       // emoji flag
  lang: string;       // ElevenLabs language code
}

/** Countries with phone codes, sorted alphabetically by country name */
export const COUNTRIES: CountryEntry[] = [
  { code: "+213", country: "Algeria", flag: "\u{1F1E9}\u{1F1FF}", lang: "ar" },
  { code: "+54",  country: "Argentina", flag: "\u{1F1E6}\u{1F1F7}", lang: "es" },
  { code: "+61",  country: "Australia", flag: "\u{1F1E6}\u{1F1FA}", lang: "en" },
  { code: "+43",  country: "Austria", flag: "\u{1F1E6}\u{1F1F9}", lang: "de" },
  { code: "+32",  country: "Belgium", flag: "\u{1F1E7}\u{1F1EA}", lang: "nl" },
  { code: "+55",  country: "Brazil", flag: "\u{1F1E7}\u{1F1F7}", lang: "pt" },
  { code: "+359", country: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}", lang: "bg" },
  { code: "+1",   country: "Canada", flag: "\u{1F1E8}\u{1F1E6}", lang: "en" },
  { code: "+56",  country: "Chile", flag: "\u{1F1E8}\u{1F1F1}", lang: "es" },
  { code: "+86",  country: "China", flag: "\u{1F1E8}\u{1F1F3}", lang: "zh" },
  { code: "+57",  country: "Colombia", flag: "\u{1F1E8}\u{1F1F4}", lang: "es" },
  { code: "+385", country: "Croatia", flag: "\u{1F1ED}\u{1F1F7}", lang: "hr" },
  { code: "+53",  country: "Cuba", flag: "\u{1F1E8}\u{1F1FA}", lang: "es" },
  { code: "+357", country: "Cyprus", flag: "\u{1F1E8}\u{1F1FE}", lang: "el" },
  { code: "+420", country: "Czech Republic", flag: "\u{1F1E8}\u{1F1FF}", lang: "cs" },
  { code: "+45",  country: "Denmark", flag: "\u{1F1E9}\u{1F1F0}", lang: "da" },
  { code: "+20",  country: "Egypt", flag: "\u{1F1EA}\u{1F1EC}", lang: "ar" },
  { code: "+358", country: "Finland", flag: "\u{1F1EB}\u{1F1EE}", lang: "fi" },
  { code: "+33",  country: "France", flag: "\u{1F1EB}\u{1F1F7}", lang: "fr" },
  { code: "+49",  country: "Germany", flag: "\u{1F1E9}\u{1F1EA}", lang: "de" },
  { code: "+30",  country: "Greece", flag: "\u{1F1EC}\u{1F1F7}", lang: "el" },
  { code: "+852", country: "Hong Kong", flag: "\u{1F1ED}\u{1F1F0}", lang: "zh" },
  { code: "+36",  country: "Hungary", flag: "\u{1F1ED}\u{1F1FA}", lang: "hu" },
  { code: "+91",  country: "India", flag: "\u{1F1EE}\u{1F1F3}", lang: "hi" },
  { code: "+62",  country: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}", lang: "id" },
  { code: "+353", country: "Ireland", flag: "\u{1F1EE}\u{1F1EA}", lang: "en" },
  { code: "+972", country: "Israel", flag: "\u{1F1EE}\u{1F1F1}", lang: "en" },
  { code: "+39",  country: "Italy", flag: "\u{1F1EE}\u{1F1F9}", lang: "it" },
  { code: "+81",  country: "Japan", flag: "\u{1F1EF}\u{1F1F5}", lang: "ja" },
  { code: "+82",  country: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", lang: "ko" },
  { code: "+60",  country: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}", lang: "ms" },
  { code: "+52",  country: "Mexico", flag: "\u{1F1F2}\u{1F1FD}", lang: "es" },
  { code: "+212", country: "Morocco", flag: "\u{1F1F2}\u{1F1E6}", lang: "ar" },
  { code: "+31",  country: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}", lang: "nl" },
  { code: "+234", country: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}", lang: "en" },
  { code: "+47",  country: "Norway", flag: "\u{1F1F3}\u{1F1F4}", lang: "no" },
  { code: "+51",  country: "Peru", flag: "\u{1F1F5}\u{1F1EA}", lang: "es" },
  { code: "+63",  country: "Philippines", flag: "\u{1F1F5}\u{1F1ED}", lang: "fil" },
  { code: "+48",  country: "Poland", flag: "\u{1F1F5}\u{1F1F1}", lang: "pl" },
  { code: "+351", country: "Portugal", flag: "\u{1F1F5}\u{1F1F9}", lang: "pt" },
  { code: "+974", country: "Qatar", flag: "\u{1F1F6}\u{1F1E6}", lang: "ar" },
  { code: "+40",  country: "Romania", flag: "\u{1F1F7}\u{1F1F4}", lang: "ro" },
  { code: "+7",   country: "Russia", flag: "\u{1F1F7}\u{1F1FA}", lang: "ru" },
  { code: "+966", country: "Saudi Arabia", flag: "\u{1F1F8}\u{1F1E6}", lang: "ar" },
  { code: "+65",  country: "Singapore", flag: "\u{1F1F8}\u{1F1EC}", lang: "en" },
  { code: "+421", country: "Slovakia", flag: "\u{1F1F8}\u{1F1F0}", lang: "sk" },
  { code: "+27",  country: "South Africa", flag: "\u{1F1FF}\u{1F1E6}", lang: "en" },
  { code: "+34",  country: "Spain", flag: "\u{1F1EA}\u{1F1F8}", lang: "es" },
  { code: "+46",  country: "Sweden", flag: "\u{1F1F8}\u{1F1EA}", lang: "sv" },
  { code: "+41",  country: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}", lang: "de" },
  { code: "+886", country: "Taiwan", flag: "\u{1F1F9}\u{1F1FC}", lang: "zh" },
  { code: "+90",  country: "Turkey", flag: "\u{1F1F9}\u{1F1F7}", lang: "tr" },
  { code: "+971", country: "UAE", flag: "\u{1F1E6}\u{1F1EA}", lang: "ar" },
  { code: "+380", country: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}", lang: "uk" },
  { code: "+44",  country: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}", lang: "en" },
  { code: "+1",   country: "United States", flag: "\u{1F1FA}\u{1F1F8}", lang: "en" },
  { code: "+84",  country: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}", lang: "vi" },
];

export interface LanguageEntry {
  code: string;  // ElevenLabs language code
  name: string;  // Display name
}

/** Unique languages for the language selector, sorted by name */
export const LANGUAGES: LanguageEntry[] = [
  { code: "ar", name: "Arabic" },
  { code: "bg", name: "Bulgarian" },
  { code: "zh", name: "Chinese" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "id", name: "Indonesian" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ms", name: "Malay" },
  { code: "no", name: "Norwegian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sk", name: "Slovak" },
  { code: "es", name: "Spanish" },
  { code: "sv", name: "Swedish" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "vi", name: "Vietnamese" },
];

/** Detect ElevenLabs language code from a phone number. Defaults to "en". */
export function detectLanguage(phone: string): string {
  const normalized = phone.replace(/[\s\-().]/g, "");
  // Try longest prefix first
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  for (const entry of sorted) {
    if (normalized.startsWith(entry.code)) return entry.lang;
  }
  return "en";
}
