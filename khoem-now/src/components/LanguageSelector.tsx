import React, { useEffect, useState } from "react";
import { KEI_LANGUAGES } from "../utils/languages";

const LANGUAGE_STORAGE_KEY = "kei-language";

export interface LanguageSelectorProps {
  value?: string;
  onChange?: (code: string) => void;
}

export default function LanguageSelector({
  value,
  onChange,
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    value || "km"
  );

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (
      savedLanguage &&
      KEI_LANGUAGES.some((item) => item.code === savedLanguage)
    ) {
      setSelectedLanguage(savedLanguage);
      onChange?.(savedLanguage);
    }
  }, [onChange]);

  // Keep selector synchronized with parent value
  useEffect(() => {
    if (value && value !== selectedLanguage) {
      setSelectedLanguage(value);
    }
  }, [value, selectedLanguage]);

  const handleChange = (code: string) => {
    setSelectedLanguage(code);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    onChange?.(code);
  };

  const currentLanguage =
    KEI_LANGUAGES.find((item) => item.code === selectedLanguage) ||
    KEI_LANGUAGES[0];

  return (
    <div className="kei-language-selector">
      <label htmlFor="kei-language-select">
        🌐 Language
      </label>

      <select
        id="kei-language-select"
        value={currentLanguage.code}
        onChange={(event) => handleChange(event.target.value)}
        aria-label="Select language"
      >
        {KEI_LANGUAGES.map((item) => (
          <option
            key={`${item.country}-${item.code}`}
            value={item.code}
          >
            {item.nativeName} — {item.language} ({item.country})
          </option>
        ))}
      </select>
    </div>
  );
}
