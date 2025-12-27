import { useEffect } from "react";
import { useLocation } from "wouter";

interface SEOHeadProps {
  title?: string;
  description?: string;
}

const BASE_URL = "https://georgien-property.agency";

const languages = [
  { code: "de", name: "Deutsch" },
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
];

export default function SEOHead({ title, description }: SEOHeadProps) {
  const [location] = useLocation();

  useEffect(() => {
    // Update document title if provided
    if (title) {
      document.title = `${title} | Angelus Management Georgia`;
    }

    // Update meta description if provided
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", description);
      }
    }

    // Update canonical URL based on current path
    const canonicalUrl = `${BASE_URL}${location}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute("href", canonicalUrl);
    }

    // Update hreflang tags based on current path
    const updateHreflangTags = () => {
      // Remove existing hreflang tags
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

      // Add new hreflang tags for current page
      const head = document.head;
      
      languages.forEach(lang => {
        const link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = lang.code;
        link.href = lang.code === "de" 
          ? `${BASE_URL}${location}` 
          : `${BASE_URL}${location}${location.includes("?") ? "&" : "?"}lang=${lang.code}`;
        head.appendChild(link);
      });

      // Add x-default
      const defaultLink = document.createElement("link");
      defaultLink.rel = "alternate";
      defaultLink.hreflang = "x-default";
      defaultLink.href = `${BASE_URL}${location}`;
      head.appendChild(defaultLink);
    };

    updateHreflangTags();

    // Update Open Graph URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", canonicalUrl);
    }

    // Update Twitter URL
    let twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute("content", canonicalUrl);
    }

  }, [location, title, description]);

  return null; // This component doesn't render anything
}

// Hook to get current language from URL or localStorage
export function useCurrentLanguage(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("lang");
  
  if (urlLang && languages.some(l => l.code === urlLang)) {
    return urlLang;
  }
  
  const savedLang = localStorage.getItem("preferred_language");
  if (savedLang && languages.some(l => l.code === savedLang)) {
    return savedLang;
  }
  
  return "de";
}

// Helper to generate language-specific URLs
export function getLanguageUrl(path: string, langCode: string): string {
  if (langCode === "de") {
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}lang=${langCode}`;
}
