import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { isTranslationCookieAccepted } from "./CookieConsent";

const languages = [
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

const LANGUAGE_STORAGE_KEY = "preferred_language";

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("de");
  const [translationEnabled, setTranslationEnabled] = useState(false);

  useEffect(() => {
    // Check if translation cookies are accepted
    const checkCookieConsent = () => {
      const accepted = isTranslationCookieAccepted();
      setTranslationEnabled(accepted);
      return accepted;
    };

    // Initial check
    const isAccepted = checkCookieConsent();

    // Load saved language preference
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLang && languages.some((l) => l.code === savedLang)) {
      setCurrentLang(savedLang);
      
      // If translation is accepted and saved language is not German, apply it
      if (isAccepted && savedLang !== "de") {
        applyLanguage(savedLang);
      }
    }

    // Check if Google Translate has set a language
    const checkLanguage = () => {
      const googleCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("googtrans="));
      if (googleCookie) {
        const lang = googleCookie.split("/").pop();
        if (lang && languages.some((l) => l.code === lang)) {
          setCurrentLang(lang);
        }
      }
    };
    checkLanguage();
    
    // Listen for cookie consent changes
    const handleConsentChange = (e: CustomEvent) => {
      if (e.detail?.translation) {
        setTranslationEnabled(true);
        // Apply saved language preference if exists
        const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLang && savedLang !== "de") {
          applyLanguage(savedLang);
        }
      }
    };
    
    window.addEventListener("cookieConsentGranted", handleConsentChange as EventListener);
    
    // Check periodically for language changes
    const interval = setInterval(() => {
      checkLanguage();
      checkCookieConsent();
    }, 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("cookieConsentGranted", handleConsentChange as EventListener);
    };
  }, []);

  const applyLanguage = (langCode: string) => {
    // Set cookie for Google Translate
    const domain = window.location.hostname;
    document.cookie = `googtrans=/de/${langCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/de/${langCode}; path=/`;
  };

  const changeLanguage = (langCode: string) => {
    // Save preference to localStorage (always, even if translation not enabled)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
    setCurrentLang(langCode);

    // If translation cookies are not accepted, show info message
    if (!translationEnabled && langCode !== "de") {
      // Try to show a toast or alert
      alert("Bitte akzeptieren Sie die Übersetzungs-Cookies in den Cookie-Einstellungen, um die automatische Übersetzung zu nutzen.");
      return;
    }

    // Apply the language
    applyLanguage(langCode);
    
    // Reload page to apply translation
    window.location.reload();
  };

  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-gray-100"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="hidden sm:inline text-sm font-medium">{currentLanguage.name}</span>
          <Globe className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLang === lang.code ? "bg-[#C4A052]/10 text-[#C4A052]" : ""
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
            {!translationEnabled && lang.code !== "de" && (
              <span className="text-xs text-gray-400 ml-auto">🔒</span>
            )}
          </DropdownMenuItem>
        ))}
        {!translationEnabled && (
          <div className="px-2 py-1.5 text-xs text-gray-500 border-t mt-1">
            Übersetzung erfordert Cookie-Zustimmung
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
