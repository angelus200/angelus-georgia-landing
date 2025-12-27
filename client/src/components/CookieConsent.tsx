import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie, Settings, Check } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  translation: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always required
  analytics: false,
  marketing: false,
  translation: false,
};

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem("cookie_consent");
    if (!savedConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed);
        // If translation cookies were accepted, initialize Google Translate
        if (parsed.translation) {
          initGoogleTranslate();
        }
      } catch {
        setIsVisible(true);
      }
    }
  }, []);

  const initGoogleTranslate = () => {
    // Trigger Google Translate initialization if not already done
    if (typeof window !== "undefined" && (window as any).google?.translate) {
      return;
    }
    // The script is already in index.html, just need to trigger init
    const event = new CustomEvent("cookieConsentGranted", { detail: { translation: true } });
    window.dispatchEvent(event);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie_consent", JSON.stringify(prefs));
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    setPreferences(prefs);
    setIsVisible(false);
    setShowSettings(false);

    if (prefs.translation) {
      initGoogleTranslate();
    }
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      translation: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    savePreferences(defaultPreferences);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
        onClick={() => {}} // Prevent closing by clicking backdrop
      />
      
      {/* Banner */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl pointer-events-auto mb-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C4A052] to-[#B39142] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cookie className="w-6 h-6 text-white" />
            <h2 className="text-lg font-semibold text-white">Cookie-Einstellungen</h2>
          </div>
          <button
            onClick={acceptNecessary}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showSettings ? (
          /* Main Banner Content */
          <div className="p-6">
            <p className="text-gray-700 mb-6 leading-relaxed">
              Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
              Einige Cookies sind für den Betrieb der Website erforderlich, während andere uns helfen, 
              die Website zu verbessern und Ihnen personalisierte Inhalte anzuzeigen. 
              Sie können Ihre Einstellungen jederzeit anpassen.
            </p>

            <div className="flex flex-wrap gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>
              <Button
                variant="outline"
                onClick={acceptNecessary}
                className="border-[#C4A052] text-[#C4A052] hover:bg-[#C4A052]/10"
              >
                Nur notwendige
              </Button>
              <Button
                onClick={acceptAll}
                className="bg-[#C4A052] hover:bg-[#B39142] text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Alle akzeptieren
              </Button>
            </div>
          </div>
        ) : (
          /* Settings Panel */
          <div className="p-6">
            <p className="text-gray-600 mb-6 text-sm">
              Hier können Sie Ihre Cookie-Einstellungen individuell anpassen. 
              Notwendige Cookies können nicht deaktiviert werden, da sie für den Betrieb der Website erforderlich sind.
            </p>

            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Notwendige Cookies</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Diese Cookies sind für den Betrieb der Website erforderlich und können nicht deaktiviert werden.
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-6 bg-[#C4A052] rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-70">
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Analyse-Cookies</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Helfen uns zu verstehen, wie Besucher mit der Website interagieren.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics ? "bg-[#C4A052] justify-end" : "bg-gray-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Marketing-Cookies</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Werden verwendet, um Besuchern relevante Werbung anzuzeigen.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.marketing ? "bg-[#C4A052] justify-end" : "bg-gray-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>

              {/* Translation Cookies (Google Translate) */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Übersetzungs-Cookies</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ermöglichen die automatische Übersetzung der Website in andere Sprachen (Google Translate).
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setPreferences(p => ({ ...p, translation: !p.translation }))}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.translation ? "bg-[#C4A052] justify-end" : "bg-gray-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="border-gray-300 text-gray-700"
              >
                Zurück
              </Button>
              <Button
                onClick={saveCustomPreferences}
                className="bg-[#C4A052] hover:bg-[#B39142] text-white"
              >
                Einstellungen speichern
              </Button>
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
          <a href="/datenschutz" className="text-[#C4A052] hover:underline">
            Datenschutzerklärung
          </a>
          <a href="/impressum" className="text-[#C4A052] hover:underline">
            Impressum
          </a>
        </div>
      </div>
    </div>
  );
}

// Export helper function to check if translation cookies are accepted
export function isTranslationCookieAccepted(): boolean {
  try {
    const consent = localStorage.getItem("cookie_consent");
    if (consent) {
      const parsed = JSON.parse(consent);
      return parsed.translation === true;
    }
  } catch {
    // Ignore parsing errors
  }
  return false;
}
