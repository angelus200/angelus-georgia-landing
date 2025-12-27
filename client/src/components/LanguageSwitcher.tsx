import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("de");

  useEffect(() => {
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
    
    // Check periodically for language changes
    const interval = setInterval(checkLanguage, 1000);
    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (langCode: string) => {
    // Set cookie for Google Translate
    const domain = window.location.hostname;
    document.cookie = `googtrans=/de/${langCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/de/${langCode}; path=/`;
    
    setCurrentLang(langCode);
    
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
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
