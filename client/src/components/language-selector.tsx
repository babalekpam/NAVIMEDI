import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Languages } from "lucide-react";

const supportedLanguages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "he", name: "Hebrew", nativeName: "עברית" }
];

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  compact?: boolean;
}

export function LanguageSelector({ 
  currentLanguage = "en", 
  onLanguageChange, 
  compact = false 
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
    
    // Store in localStorage for persistence
    localStorage.setItem("selectedLanguage", languageCode);
    
    // Trigger translation update for the UI
    window.dispatchEvent(new CustomEvent("languageChanged", { 
      detail: { language: languageCode } 
    }));
  };

  const currentLang = supportedLanguages.find(lang => lang.code === selectedLanguage);

  if (compact) {
    return (
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-auto min-w-[120px]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span className="text-xs">{language.code.toUpperCase()}</span>
                <span>{language.nativeName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Languages className="w-5 h-5 text-emerald-600" />
        <h3 className="font-semibold">Language Settings</h3>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Current Language</label>
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {supportedLanguages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center justify-between w-full">
                  <span>{language.name}</span>
                  <span className="text-slate-500 ml-2">{language.nativeName}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentLang && (
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">Selected: {currentLang.name}</span>
          </div>
          <p className="text-sm text-slate-600">
            The interface will display in {currentLang.nativeName}. 
            Medical content will be automatically translated when communicating with patients.
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Multi-Language Features</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Pro+</Badge>
            <span>Real-time translation of medical communications</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Pro+</Badge>
            <span>Patient portal in multiple languages</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Pro+</Badge>
            <span>Automated prescription instructions translation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LanguageSelector;