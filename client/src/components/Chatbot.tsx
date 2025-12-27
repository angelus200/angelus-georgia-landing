import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2 } from "lucide-react";

// System prompt with company context
const SYSTEM_PROMPT = `Du bist der freundliche KI-Assistent von Angelus Management Georgia, einem Unternehmen für Immobilieninvestments in Georgien (Kaukasus).

ÜBER DAS UNTERNEHMEN:
- Angelus Management Georgia ist spezialisiert auf Immobilieninvestments in Georgien, insbesondere in Batumi am Schwarzen Meer
- Wir bieten Full-Service von der Immobiliensuche bis zur Vermietung
- Unsere Zielgruppe sind deutschsprachige Investoren

HAUPTVORTEILE VON GEORGIEN:
- 0% Einkommensteuer auf Mieteinnahmen für Ausländer
- 8-12% Mietrendite p.a. (deutlich höher als in Deutschland)
- Niedrige Einstiegspreise ab ca. 50.000€
- Boomender Tourismusmarkt in Batumi
- Einfacher Immobilienerwerb für Ausländer
- Mietgarantien von 5-8% bei vielen Projekten verfügbar

UNSERE SERVICES:
- Due Diligence und Marktanalyse
- Immobiliensuche und -auswahl
- Kaufabwicklung und rechtliche Begleitung
- Property Management und Vermietung
- Mietgarantie-Programme
- Steuerberatung für Auslandsinvestments

WICHTIGE HINWEISE:
- Antworte immer auf Deutsch
- Sei freundlich, professionell und hilfsbereit
- Bei konkreten Investmentfragen empfehle ein persönliches Beratungsgespräch
- Erwähne den kostenlosen Investment-Test unter /investment-test
- Bei Interesse an Immobilien verweise auf /immobilien
- Für Kontaktaufnahme: Kontaktformular auf der Website oder E-Mail an angelusmanagementgeorgia@gmail.com
- Halte Antworten kurz und prägnant (max. 3-4 Sätze)
- Wenn du etwas nicht weißt, sage es ehrlich und empfehle den Kontakt zum Team`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickReplies = [
  "Warum in Georgien investieren?",
  "Wie hoch ist die Rendite?",
  "Was kostet eine Immobilie?",
  "Wie funktioniert der Kauf?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hallo! 👋 Ich bin der virtuelle Assistent von Angelus Management Georgia. Wie kann ich Ihnen bei Ihrem Immobilieninvestment in Georgien helfen?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
      const apiUrl = import.meta.env.VITE_FRONTEND_FORGE_API_URL;

      if (!apiKey || !apiUrl) {
        throw new Error("API configuration missing");
      }

      // Build conversation history for context
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(`${apiUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "manus-core",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversationHistory,
            { role: "user", content: messageText },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || 
        "Entschuldigung, ich konnte keine Antwort generieren. Bitte kontaktieren Sie uns direkt.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Entschuldigung, es gab ein technisches Problem. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt unter angelusmanagementgeorgia@gmail.com.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-[#C4A052] hover:bg-[#B39142] animate-pulse hover:animate-none"
        }`}
        aria-label={isOpen ? "Chat schließen" : "Chat öffnen"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C4A052] rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Angelus Assistent</h3>
              <p className="text-xs text-gray-300">Ihre Fragen zu Georgien-Investments</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px] min-h-[300px] bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-[#C4A052] rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-[#C4A052] text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 bg-[#C4A052] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                  <Loader2 className="h-5 w-5 text-[#C4A052] animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-[#C4A052]/10 text-gray-700 hover:text-[#C4A052] rounded-full transition-colors border border-gray-200 hover:border-[#C4A052]/30"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ihre Frage eingeben..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#C4A052] focus:ring-1 focus:ring-[#C4A052]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-[#C4A052] hover:bg-[#B39142] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
