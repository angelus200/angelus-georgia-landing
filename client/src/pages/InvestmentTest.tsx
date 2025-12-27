import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  TrendingUp, 
  Shield, 
  Percent, 
  Home, 
  Users,
  Trophy,
  Sparkles,
  ThumbsUp,
  Lightbulb,
  ArrowRight
} from "lucide-react";

// Questions with point values
const questions = [
  {
    id: 1,
    question: "Suchen Sie nach Investments mit höherer Rendite als in Deutschland?",
    description: "Der deutsche Immobilienmarkt bietet oft nur 2-4% Rendite.",
    options: [
      { text: "Nein, mir reicht die aktuelle Rendite", points: 0, tag: null },
      { text: "Vielleicht, wenn das Risiko überschaubar ist", points: 5, tag: null },
      { text: "Ja, definitiv - ich suche bessere Renditen", points: 15, tag: "rendite" },
    ],
  },
  {
    id: 2,
    question: "Ist Ihnen Steueroptimierung bei Investments wichtig?",
    description: "Steuern können die Rendite erheblich schmälern.",
    options: [
      { text: "Nicht besonders relevant für mich", points: 0, tag: null },
      { text: "Wäre ein netter Bonus", points: 5, tag: null },
      { text: "Sehr wichtig - ich möchte legal Steuern sparen", points: 15, tag: "steuer" },
    ],
  },
  {
    id: 3,
    question: "Möchten Sie in einen aufstrebenden Wachstumsmarkt investieren?",
    description: "Wachstumsmärkte bieten oft höhere Wertsteigerungspotenziale.",
    options: [
      { text: "Lieber etablierte, sichere Märkte", points: 0, tag: null },
      { text: "Bin offen für neue Märkte", points: 8, tag: null },
      { text: "Ja, Wachstum und Potenzial sind mir wichtig", points: 15, tag: "wachstum" },
    ],
  },
  {
    id: 4,
    question: "Wie wichtig ist Ihnen eine garantierte Mieteinnahme?",
    description: "Mietgarantien bieten Sicherheit bei der Renditeplanung.",
    options: [
      { text: "Nicht wichtig, ich trage das Risiko selbst", points: 5, tag: null },
      { text: "Wäre ein Plus bei der Entscheidung", points: 10, tag: null },
      { text: "Sehr wichtig - Sicherheit geht vor", points: 15, tag: "garantie" },
    ],
  },
  {
    id: 5,
    question: "Bevorzugen Sie einen günstigen Einstiegspreis?",
    description: "Niedrigere Einstiegspreise ermöglichen Diversifikation.",
    options: [
      { text: "Der Preis ist zweitrangig", points: 0, tag: null },
      { text: "Gutes Preis-Leistungs-Verhältnis ist wichtig", points: 8, tag: null },
      { text: "Ja, günstiger Einstieg ist mir wichtig", points: 15, tag: "preis" },
    ],
  },
  {
    id: 6,
    question: "Wünschen Sie professionelles Management vor Ort?",
    description: "Lokales Management kümmert sich um Vermietung und Instandhaltung.",
    options: [
      { text: "Ich manage meine Immobilien selbst", points: 5, tag: null },
      { text: "Teilweise Unterstützung wäre gut", points: 10, tag: null },
      { text: "Ja, Full-Service ist mir wichtig", points: 15, tag: "management" },
    ],
  },
  {
    id: 7,
    question: "Interessiert Sie auch ein Feriendomizil oder Zweitwohnsitz?",
    description: "Kombination aus Investment und persönlicher Nutzung.",
    options: [
      { text: "Nein, rein als Investment", points: 0, tag: null },
      { text: "Vielleicht später einmal", points: 5, tag: null },
      { text: "Ja, das wäre ein schöner Bonus", points: 10, tag: "feriendomizil" },
    ],
  },
];

// Benefits based on tags
const benefitsByTag: Record<string, { icon: any; title: string; description: string }> = {
  rendite: {
    icon: TrendingUp,
    title: "8-12% Rendite p.a.",
    description: "Georgien bietet deutlich höhere Mietrenditen als westeuropäische Märkte.",
  },
  steuer: {
    icon: Percent,
    title: "0% Einkommensteuer",
    description: "Mieteinnahmen aus Georgien sind für Ausländer steuerfrei.",
  },
  wachstum: {
    icon: Sparkles,
    title: "Boomender Markt",
    description: "Batumi verzeichnet jährlich zweistellige Wertsteigerungen.",
  },
  garantie: {
    icon: Shield,
    title: "Mietgarantie verfügbar",
    description: "Viele Projekte bieten 5-8% garantierte Mietrendite.",
  },
  preis: {
    icon: Home,
    title: "Ab 50.000€ Einstieg",
    description: "Hochwertige Apartments zu einem Bruchteil deutscher Preise.",
  },
  management: {
    icon: Users,
    title: "Full-Service Management",
    description: "Professionelle Verwaltung, Vermietung und Instandhaltung vor Ort.",
  },
  feriendomizil: {
    icon: Home,
    title: "Eigene Nutzung möglich",
    description: "Nutzen Sie Ihr Apartment selbst für Urlaub am Schwarzen Meer.",
  },
};

// Score result categories
const getScoreResult = (score: number) => {
  if (score >= 80) {
    return {
      icon: Trophy,
      title: "Perfekter Match!",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      message: "Georgien passt hervorragend zu Ihren Investmentzielen! Mit 8-12% Rendite, 0% Einkommensteuer und professionellem Management ist jetzt der ideale Zeitpunkt für Ihr Investment.",
      cta: "Jetzt die besten Angebote sichern",
    };
  } else if (score >= 60) {
    return {
      icon: Sparkles,
      title: "Sehr gute Übereinstimmung",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      message: "Georgien bietet genau das, was Sie suchen. Lassen Sie uns gemeinsam die passende Immobilie für Ihre Ziele finden.",
      cta: "Passende Immobilien entdecken",
    };
  } else if (score >= 40) {
    return {
      icon: ThumbsUp,
      title: "Gutes Potenzial",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      message: "Georgien könnte eine interessante Ergänzung für Ihr Portfolio sein. Erfahren Sie mehr über die Vorteile in einem persönlichen Gespräch.",
      cta: "Mehr erfahren",
    };
  } else {
    return {
      icon: Lightbulb,
      title: "Entdecken Sie die Möglichkeiten",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      message: "Vielleicht haben Sie Georgien noch nicht auf dem Radar - aber die Vorteile könnten Sie überraschen! Lassen Sie sich unverbindlich beraten.",
      cta: "Unverbindlich informieren",
    };
  }
};

export default function InvestmentTest() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro, 1-7 = questions, 8 = lead form, 9 = result
  const [answers, setAnswers] = useState<Record<number, { points: number; tag: string | null }>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "", wantsConsultation: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const totalScore = Object.values(answers).reduce((sum, a) => sum + a.points, 0);
  const maxScore = 100;
  const scorePercentage = Math.round((totalScore / maxScore) * 100);

  const handleAnswer = (questionId: number, points: number, tag: string | null) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { points, tag } }));
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
    
    // Auto-advance to next question
    setTimeout(() => {
      if (currentStep < questions.length) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setShowResult(true);
      setCurrentStep(9);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.email) {
      toast.error("Bitte geben Sie Ihre E-Mail-Adresse ein");
      return;
    }
    
    setIsSubmitting(true);
    
    // Create lead with test results
    const relevantBenefits = selectedTags.map(tag => benefitsByTag[tag]?.title).filter(Boolean).join(", ");
    const scoreResult = getScoreResult(totalScore);
    
    submitMutation.mutate({
      name: leadForm.name || "Investment-Test Teilnehmer",
      email: leadForm.email,
      phone: leadForm.phone,
      message: `Investment-Score Test Ergebnis:\n\nScore: ${totalScore}/${maxScore} Punkte (${scorePercentage}%)\nErgebnis: ${scoreResult.title}\n\nRelevante Vorteile: ${relevantBenefits || "Keine spezifischen"}\n\nPersönliche Beratung gewünscht: ${leadForm.wantsConsultation ? "Ja" : "Nein"}`,
    });
  };

  const skipToResult = () => {
    setShowResult(true);
    setCurrentStep(9);
  };

  const scoreResult = getScoreResult(totalScore);
  const ResultIcon = scoreResult.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#F5F0E8]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/images/angelus-logo.png" 
              alt="Angelus Management" 
              className="h-10 w-auto"
            />
          </a>
          {currentStep > 0 && currentStep <= questions.length && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Frage {currentStep} von {questions.length}</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C4A052] transition-all duration-300"
                  style={{ width: `${(currentStep / questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Intro Screen */}
        {currentStep === 0 && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-[#C4A052]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-[#C4A052]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Ihr <span className="text-[#C4A052]">Georgien Investment-Score</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Finden Sie in nur 2 Minuten heraus, wie gut Georgien zu Ihren Investmentzielen passt.
              </p>
            </div>

            <Card className="p-8 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Was Sie erwartet:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C4A052] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">7 kurze Fragen zu Ihren Investmentzielen</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C4A052] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Persönlicher Score mit Auswertung</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C4A052] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Maßgeschneiderte Empfehlungen</span>
                </li>
              </ul>
            </Card>

            <Button 
              size="lg" 
              className="bg-[#C4A052] hover:bg-[#B39142] text-white px-8 py-6 text-lg"
              onClick={() => setCurrentStep(1)}
            >
              Test starten
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Questions */}
        {currentStep >= 1 && currentStep <= questions.length && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {questions[currentStep - 1].question}
                </h2>
                <p className="text-gray-500">
                  {questions[currentStep - 1].description}
                </p>
              </div>

              <div className="space-y-3">
                {questions[currentStep - 1].options.map((option, index) => {
                  const isSelected = answers[questions[currentStep - 1].id]?.points === option.points;
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(questions[currentStep - 1].id, option.points, option.tag)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-[#C4A052] bg-[#C4A052]/10"
                          : "border-gray-200 hover:border-[#C4A052]/50 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`font-medium ${isSelected ? "text-[#C4A052]" : "text-gray-900"}`}>
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Zurück
                </Button>
                
                {answers[questions[currentStep - 1]?.id] && (
                  <Button
                    className="bg-[#C4A052] hover:bg-[#B39142]"
                    onClick={() => {
                      if (currentStep === questions.length) {
                        setCurrentStep(8); // Go to lead form
                      } else {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                  >
                    {currentStep === questions.length ? "Ergebnis ansehen" : "Weiter"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>

            {/* Current Score Preview */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Aktueller Score: <span className="font-semibold text-[#C4A052]">{totalScore} Punkte</span>
              </p>
            </div>
          </div>
        )}

        {/* Lead Form */}
        {currentStep === 8 && !showResult && (
          <div className="max-w-xl mx-auto">
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#C4A052]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-[#C4A052]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ihr Ergebnis ist fertig!
                </h2>
                <p className="text-gray-600">
                  Geben Sie Ihre E-Mail ein, um Ihr persönliches Ergebnis zu sehen und zu speichern.
                </p>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail-Adresse *
                  </label>
                  <Input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="ihre@email.de"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (optional)
                  </label>
                  <Input
                    type="text"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    placeholder="Ihr Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon (optional)
                  </label>
                  <Input
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="+49 123 456789"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="consultation"
                    checked={leadForm.wantsConsultation}
                    onChange={(e) => setLeadForm({ ...leadForm, wantsConsultation: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="consultation" className="text-sm text-gray-600">
                    Ja, ich möchte eine kostenlose persönliche Beratung
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#C4A052] hover:bg-[#B39142] py-6 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Wird geladen..." : "Mein Ergebnis anzeigen"}
                </Button>

                <button
                  type="button"
                  onClick={skipToResult}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                >
                  Ohne E-Mail fortfahren
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* Result Screen */}
        {currentStep === 9 && showResult && (
          <div className="max-w-3xl mx-auto">
            {/* Score Display */}
            <Card className={`p-8 mb-8 ${scoreResult.bgColor} ${scoreResult.borderColor} border-2`}>
              <div className="text-center">
                <div className={`w-24 h-24 ${scoreResult.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 border-4 ${scoreResult.borderColor}`}>
                  <ResultIcon className={`h-12 w-12 ${scoreResult.color}`} />
                </div>
                
                <div className="mb-6">
                  <div className="text-6xl font-bold text-gray-900 mb-2">
                    {totalScore}<span className="text-3xl text-gray-400">/{maxScore}</span>
                  </div>
                  <h2 className={`text-2xl font-bold ${scoreResult.color}`}>
                    {scoreResult.title}
                  </h2>
                </div>

                <p className="text-lg text-gray-700 max-w-xl mx-auto">
                  {scoreResult.message}
                </p>
              </div>
            </Card>

            {/* Relevant Benefits */}
            {selectedTags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Diese Vorteile passen zu Ihnen:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTags.map((tag) => {
                    const benefit = benefitsByTag[tag];
                    if (!benefit) return null;
                    const Icon = benefit.icon;
                    return (
                      <Card key={tag} className="p-5 flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#C4A052]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-[#C4A052]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="/immobilien">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-[#C4A052] transition-colors">
                        Passende Immobilien ansehen
                      </h4>
                      <p className="text-sm text-gray-500">Entdecken Sie unsere aktuellen Angebote</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#C4A052] transition-colors" />
                  </div>
                </Card>
              </a>

              <a href="https://calendly.com/t-gross-lce/besprechung" target="_blank" rel="noopener noreferrer">
                <Card className="p-6 bg-[#C4A052] hover:bg-[#B39142] transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">
                        Kostenlose Beratung buchen
                      </h4>
                      <p className="text-sm text-white/80">Persönliches Gespräch mit unseren Experten</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white" />
                  </div>
                </Card>
              </a>
            </div>

            {/* Restart */}
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setAnswers({});
                  setSelectedTags([]);
                  setShowResult(false);
                  setLeadForm({ name: "", email: "", phone: "", wantsConsultation: true });
                }}
                className="text-sm text-gray-500 hover:text-[#C4A052] transition-colors"
              >
                Test erneut durchführen
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
