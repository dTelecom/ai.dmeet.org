interface LanguageOption {
  name: string;
  code: string;
  flagIsoCode: string;
  voiceRecognitionOverride?: string;
}

export const languageOptions: LanguageOption[] = [
  { name: "Arabic", code: "ar", flagIsoCode: "ae" },
  { name: "Chinese", code: "zh", flagIsoCode: "cn" },
  { name: "English", code: "en", flagIsoCode: "us" },
  { name: "French", code: "fr", flagIsoCode: "fr" },
  { name: "German", code: "de", flagIsoCode: "de" },
  { name: "Greek", code: "el", flagIsoCode: "gr" },
  { name: "Hindi", code: "hi", flagIsoCode: "in" },
  { name: "Italian", code: "it", flagIsoCode: "it" },
  { name: "Japanese", code: "ja", flagIsoCode: "jp" },
  { name: "Portuguese", code: "pt", flagIsoCode: "pt" },
  { name: "Russian", code: "ru", flagIsoCode: "ru" },
  { name: "Spanish", code: "es", flagIsoCode: "es" },
  { name: "Turkish", code: "tr", flagIsoCode: "tr" },
  { name: "Ukrainian", code: "uk", flagIsoCode: "ua" },
];
