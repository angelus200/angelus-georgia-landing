import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendlyPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendlyPopup({ isOpen, onClose }: CalendlyPopupProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#C4A052]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C4A052] rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Beratungstermin buchen</h3>
              <p className="text-sm text-gray-500">Wählen Sie einen passenden Termin mit Thomas Gross</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Calendly Embed */}
        <div className="h-[calc(100%-80px)]">
          <iframe
            src="https://calendly.com/t-gross-lce/besprechung?hide_gdpr_banner=1&background_color=faf8f5&text_color=1a1a2e&primary_color=c4a052"
            width="100%"
            height="100%"
            frameBorder="0"
            title="Termin buchen"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

// Floating Calendly Button Component
export function CalendlyButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 bg-[#C4A052] hover:bg-[#B39142] text-white shadow-lg rounded-full px-6 py-6 flex items-center gap-2 animate-in slide-in-from-bottom duration-500"
      >
        <Calendar className="w-5 h-5" />
        <span className="hidden sm:inline">Termin buchen</span>
      </Button>
      <CalendlyPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default CalendlyPopup;
