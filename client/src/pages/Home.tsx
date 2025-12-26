import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  Shield, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  Quote,
  Award,
  Globe,
  Target
} from "lucide-react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Vielen Dank für Ihr Interesse! Wir melden uns in Kürze bei Ihnen.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    },
    onError: (error) => {
      toast.error(`Fehler beim Senden: ${error.message}`);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <a href="/">
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-10 w-auto object-contain"
              />
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/#projects" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors">Projekte</a>
              <a href="/immobilien" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors">Immobilien</a>
              <a href="/service-pakete" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors">Services</a>
              <a href="/#contact" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors">Kontakt</a>
            </nav>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <a href="/dashboard">
                    <Button variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-white">
                      Dashboard
                    </Button>
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => logout()} className="text-muted-foreground hover:text-foreground">
                    Abmelden
                  </Button>
                </>
              ) : (
                <>
                  <a href="/login">
                    <Button variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-white">
                      Anmelden
                    </Button>
                  </a>
                  <a href="/login">
                    <Button size="sm" className="bg-gold text-white hover:bg-gold/90">
                      Registrieren
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-gradient pt-20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'url(/images/tbilisi-skyline.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
        </div>
        
        <div className="container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Logo & Headline */}
            <div className="space-y-8 animate-slide-up">
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-24 w-auto object-contain"
              />
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Strukturierte <span className="text-gold">Immobilieninvestments</span> in Georgien
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Professionelles Management, transparente Due Diligence und nachhaltige Renditen im georgischen Wachstumsmarkt.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={scrollToContact}
                  className="bg-gold text-white hover:bg-gold/90 transition-all duration-300 text-lg px-8 py-6"
                >
                  Jetzt Beratung anfragen
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                  className="border-gold text-gold hover:bg-gold hover:text-white transition-all duration-300 text-lg px-8 py-6"
                >
                  Unsere Projekte
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.location.href = user ? "/dashboard" : "/login"}
                  className="border-gold text-gold hover:bg-gold hover:text-white transition-all duration-300 text-lg px-8 py-6"
                >
                  {user ? "Mein Dashboard" : "Anmelden"}
                </Button>
              </div>
              
              {/* Social Media Channels */}
              <div className="flex items-center gap-4 pt-4 flex-wrap">
                <span className="text-sm text-muted-foreground">Folgen Sie uns:</span>
                <a 
                  href="https://whatsapp.com/channel/0029VbC18IWCsU9YyrOyj01N" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a 
                  href="https://t.me/Angelus_Management_GeorgiaDE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0088cc] hover:bg-[#006699] text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61584186435160" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1877F2] hover:bg-[#0d65d9] text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative animate-fade-in">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/modern-apartment.jpg"
                  alt="Luxuriöse Immobilie in Georgien"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-xl border border-gold/20">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gold">5-10%</p>
                    <p className="text-sm text-muted-foreground">Nettorendite p.a.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Warum <span className="text-gold">Angelus Management</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Wir kombinieren lokale Expertise mit internationalen Standards für Ihre Investitionssicherheit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Due Diligence",
                description: "Umfassende Prüfung aller Bauträger, Projekte und rechtlichen Rahmenbedingungen nach strengen Kriterien.",
              },
              {
                icon: Building2,
                title: "Professioneller Betrieb",
                description: "Full-Service-Management mit Reporting, Vermietung und Instandhaltung für passives Investment.",
              },
              {
                icon: TrendingUp,
                title: "Mietgarantien",
                description: "Optional: Kalkulierte Mindestrenditen mit transparenter Haftungslogik und Betreiberverantwortung.",
              },
              {
                icon: Users,
                title: "Co-Investment",
                description: "Interessengleichheit durch eigene Investments – wir sind Partner, nicht nur Vermittler.",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="p-6 space-y-4 card-hover bg-white border-border"
              >
                <div className="h-12 w-12 rounded-lg bg-gold/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Angelus Group Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src="/images/investment-meeting.jpg"
                alt="Angelus Group Team"
                className="rounded-2xl shadow-xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border border-gold/20">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-gold" />
                  <div>
                    <p className="font-semibold text-foreground">Seit 2018</p>
                    <p className="text-sm text-muted-foreground">Am Markt aktiv</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                Über die <span className="text-gold">Angelus Group</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Die Angelus Group ist eine internationale Investmentgesellschaft mit Fokus auf Emerging Markets und strukturierte Immobilieninvestments. Mit Büros in Europa und Georgien verbinden wir institutionelle Qualität mit lokaler Marktexpertise.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Angelus Management Georgia ist die operative Einheit vor Ort und arbeitet mit den Ressourcen der Angelus Group entlang der gesamten Wertschöpfungskette: von der Selektion über Due Diligence und Strukturierung bis hin zum operativen Betrieb und Exit-Optionen.
              </p>

              <div className="grid md:grid-cols-2 gap-6 pt-6">
                {[
                  { icon: Globe, title: "International", desc: "Präsenz in 5 Ländern" },
                  { icon: Users, title: "Erfahren", desc: "15+ Jahre Expertise" },
                  { icon: Target, title: "Fokussiert", desc: "Spezialisiert auf Georgien" },
                  { icon: Award, title: "Zertifiziert", desc: "ISO-Standards" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview Section */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                Georgien 2025: <span className="text-gold">Vom Wachstumsmarkt zur investierbaren Assetklasse</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Der georgische Immobilienmarkt erlebt einen strukturellen Übergang: weg von opportunistischer Dynamik hin zu einer reiferen Phase, in der Qualität, Betriebsfähigkeit und Developer-Struktur die Rendite dominieren.
              </p>

              <div className="space-y-4">
                {[
                  "Eigentumsfreundlicher Rechtsrahmen für internationale Investoren",
                  "Geringe bürokratische Hürden im Vergleich zu EU-Märkten",
                  "Strukturelle Nachfrage durch Urbanisierung und Tourismus",
                  "Professionelle Marktreife mit institutioneller Qualität",
                  "Transparente Registrierungsprozesse und digitalisierte Behörden",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-gold flex-shrink-0 mt-1" />
                    <p className="text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="/images/tbilisi-skyline.jpg"
                alt="Tiflis Skyline"
                className="rounded-2xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Unsere <span className="text-gold">Immobilienprojekte</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sorgfältig ausgewählte Projekte in erstklassigen Lagen mit geprüften Bauträgern.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Tiflis Premium Residences",
                location: "Saburtalo, Tiflis",
                image: "/images/luxury-building.jpg",
                type: "Residential",
                status: "In Bau",
                completion: "Q4 2025",
                yield: "6-8% p.a.",
              },
              {
                title: "Batumi Beachfront",
                location: "Küste, Batumi",
                image: "/images/batumi-coast.jpg",
                type: "Serviced Apartments",
                status: "Verfügbar",
                completion: "Q2 2025",
                yield: "8-10% p.a.",
              },
              {
                title: "Old Town Apartments",
                location: "Altstadt, Tiflis",
                image: "/images/modern-apartment.jpg",
                type: "Residential",
                status: "Fast ausverkauft",
                completion: "Q3 2025",
                yield: "5-7% p.a.",
              },
            ].map((project, index) => (
              <Card key={index} className="overflow-hidden card-hover bg-white border-border">
                <div className="relative h-64">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {project.status}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {project.location}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Typ</p>
                      <p className="font-semibold text-foreground">{project.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fertigstellung</p>
                      <p className="font-semibold text-foreground">{project.completion}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Erwartete Rendite</p>
                    <p className="text-2xl font-bold text-gold">{project.yield}</p>
                  </div>
                  <Button 
                    onClick={scrollToContact}
                    className="w-full bg-gold text-white hover:bg-gold/90"
                  >
                    Mehr erfahren
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Was unsere <span className="text-gold">Kunden sagen</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Vertrauen Sie auf die Erfahrungen unserer zufriedenen Investoren.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Michael Weber",
                role: "Unternehmer, Deutschland",
                text: "Die Professionalität von Angelus Management hat mich überzeugt. Transparente Kommunikation, solide Due Diligence und ein Investment, das sich auszahlt.",
                rating: 5,
              },
              {
                name: "Sarah Müller",
                role: "Family Office, Schweiz",
                text: "Wir haben mehrere Projekte über Angelus strukturiert. Das Team vor Ort in Tiflis ist exzellent, und die Renditen entsprechen den Prognosen.",
                rating: 5,
              },
              {
                name: "Thomas Schneider",
                role: "Investor, Österreich",
                text: "Nach anfänglicher Skepsis bin ich begeistert. Die Mietgarantie funktioniert, das Reporting ist lückenlos, und der Markt entwickelt sich positiv.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-8 space-y-6 bg-white border-border card-hover">
                <Quote className="h-10 w-10 text-gold/30" />
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Unsere <span className="text-gold">Leistungen</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Von der ersten Analyse bis zum laufenden Betrieb – wir begleiten Sie durch den gesamten Investmentprozess.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Bauträger-Selektion",
                items: [
                  "5-Achsen Due-Diligence-Framework",
                  "Track Record Analyse",
                  "Finanzstärke-Prüfung",
                  "Bauträger-Scorecard (≥75% Mindestscore)",
                ],
              },
              {
                title: "Betrieb & Management",
                items: [
                  "Angelus Operating Standard (AOS)",
                  "Vermietungsmanagement",
                  "Monatliches Reporting",
                  "Kosten- und Margencontrolling",
                ],
              },
              {
                title: "Renditeoptimierung",
                items: [
                  "Konservative Modellierung",
                  "Optionale Mietgarantien",
                  "Stress-Test-Szenarien",
                  "Exit-Strategien",
                ],
              },
            ].map((service, index) => (
              <Card key={index} className="p-8 space-y-6 card-hover bg-white border-border">
                <h3 className="text-2xl font-semibold text-gold">{service.title}</h3>
                <ul className="space-y-3">
                  {service.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-card">
        <div className="container max-w-4xl">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Bereit für Ihr <span className="text-gold">Investment</span>?
            </h2>
            <p className="text-xl text-muted-foreground">
              Kontaktieren Sie uns für eine unverbindliche Erstberatung.
            </p>
          </div>

          <Card className="p-8 lg:p-12 bg-white border-gold/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-border focus:border-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    E-Mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-background border-border focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  Telefon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background border-border focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">
                  Ihre Nachricht *
                </Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-background border-border focus:border-gold resize-none"
                  placeholder="Erzählen Sie uns von Ihren Investitionszielen..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitMutation.isPending}
                className="w-full bg-gold text-white hover:bg-gold/90 transition-all duration-300 text-lg py-6"
              >
                {submitMutation.isPending ? "Wird gesendet..." : "Nachricht senden"}
              </Button>
            </form>
          </Card>

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <Mail className="h-8 w-8 text-gold mx-auto" />
              <p className="font-semibold text-foreground">E-Mail</p>
              <a href="mailto:angelusmanagementgeorgia@gmail.com" className="text-muted-foreground hover:text-gold transition-colors">
                angelusmanagementgeorgia@gmail.com
              </a>
            </div>
            <div className="space-y-2">
              <Phone className="h-8 w-8 text-gold mx-auto" />
              <p className="font-semibold text-foreground">Telefon</p>
              <a href="tel:+995579106719" className="text-muted-foreground hover:text-gold transition-colors">
                +995 579 10 67 19
              </a>
            </div>
            <div className="space-y-2">
              <MapPin className="h-8 w-8 text-gold mx-auto" />
              <p className="font-semibold text-foreground">Standort</p>
              <p className="text-muted-foreground">26 May Street, No. 19, Batumi, Georgia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="space-y-4">
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-14 w-auto object-contain"
              />
              <p className="text-sm text-muted-foreground">
                Strukturierte Immobilieninvestments in Georgien mit professionellem Management.
              </p>
              {/* Social Media Buttons */}
              <div className="flex gap-3 pt-2">
                <a 
                  href="https://whatsapp.com/channel/0029VbC18IWCsU9YyrOyj01N" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#128C7E] transition-colors"
                  title="WhatsApp Kanal abonnieren"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a 
                  href="https://t.me/Angelus_Management_GeorgiaDE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0088cc] hover:bg-[#006699] transition-colors"
                  title="Telegram Kanal abonnieren"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61584186435160" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#0d65d9] transition-colors"
                  title="Facebook Seite besuchen"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gold">Kontakt</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>ANGELUS MANAGEMENT GEORGIA LLC</p>
                <p>26 May Street, No. 19, Batumi, Georgia</p>
                <p>
                  <a href="mailto:angelusmanagementgeorgia@gmail.com" className="hover:text-gold transition-colors">
                    angelusmanagementgeorgia@gmail.com
                  </a>
                </p>
                <p>
                  <a href="tel:+995579106719" className="hover:text-gold transition-colors">
                    +995 579 10 67 19
                  </a>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gold">Services</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Due Diligence</p>
                <p>Property Management</p>
                <p>Mietgarantien</p>
                <p>Investment Consulting</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gold">Rechtliches</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <a href="/impressum" className="hover:text-gold transition-colors">
                    Impressum
                  </a>
                </p>
                <p>
                  <a href="/datenschutz" className="hover:text-gold transition-colors">
                    Datenschutz
                  </a>
                </p>
                <p>
                  <a href="/agb" className="hover:text-gold transition-colors">
                    AGB
                  </a>
                </p>
                <p>
                  <a href="/admin/login" className="hover:text-gold transition-colors">
                    Admin-Login
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Angelus Management Georgia. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
