import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Shield, TrendingUp, Users, CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // In einer echten Implementierung würde hier ein API-Call erfolgen
    toast.success("Vielen Dank für Ihr Interesse! Wir melden uns in Kürze bei Ihnen.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background opacity-50"></div>
        <div className="container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Logo & Headline */}
            <div className="space-y-8 animate-slide-up">
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-24 w-auto object-contain"
              />
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Strukturierte <span className="text-gold">Immobilieninvestments</span> in Georgien
              </h1>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                Professionelles Management, transparente Due Diligence und nachhaltige Renditen im georgischen Wachstumsmarkt.
              </p>
              <Button
                size="lg"
                onClick={scrollToContact}
                className="bg-gold text-background hover:bg-gold/90 hover:gold-glow transition-all duration-300 text-lg px-8 py-6"
              >
                Jetzt Beratung anfragen
              </Button>
            </div>

            {/* Right: Quick Contact Card */}
            <Card className="glass-card p-8 space-y-6 animate-fade-in border-gold/20">
              <h3 className="text-2xl font-semibold text-gold">Interessiert?</h3>
              <p className="text-muted-foreground">
                Lassen Sie uns über Ihre Investitionsziele sprechen.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-5 w-5 text-gold" />
                  <a href="mailto:info@angelus-georgia.com" className="hover:text-gold transition-colors">
                    info@angelus-georgia.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-5 w-5 text-gold" />
                  <a href="tel:+995123456789" className="hover:text-gold transition-colors">
                    +995 123 456 789
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-5 w-5 text-gold" />
                  <span>Tiflis, Georgien</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={scrollToContact}
                className="w-full border-gold text-gold hover:bg-gold hover:text-background transition-all duration-300"
              >
                Zum Kontaktformular
              </Button>
            </Card>
          </div>
        </div>

        {/* Decorative diagonal element */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent"></div>
      </section>

      {/* Value Proposition Section */}
      <section className="diagonal-section bg-card">
        <div className="container py-20">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Warum <span className="text-gold">Angelus Management</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
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
                className="glass-card p-6 space-y-4 hover:gold-glow transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Georgien 2025: <span className="text-gold">Vom Wachstumsmarkt zur investierbaren Assetklasse</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Der georgische Immobilienmarkt erlebt einen strukturellen Übergang: weg von opportunistischer Dynamik hin zu einer reiferen Phase, in der Qualität, Betriebsfähigkeit und Developer-Struktur die Rendite dominieren.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Angelus Management Georgia arbeitet mit den Ressourcen der Angelus Group entlang der gesamten Wertschöpfungskette: von der Selektion über Due Diligence und Strukturierung bis hin zum operativen Betrieb und Exit-Optionen.
              </p>
            </div>

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
        </div>
      </section>

      {/* Services Section */}
      <section className="diagonal-section bg-card">
        <div className="container py-20">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Unsere <span className="text-gold">Leistungen</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
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
              <Card key={index} className="glass-card p-8 space-y-6 hover:gold-glow transition-all duration-300">
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
      <section id="contact" className="py-20 bg-background">
        <div className="container max-w-4xl">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Bereit für Ihr <span className="text-gold">Investment</span>?
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Kontaktieren Sie uns für eine unverbindliche Erstberatung.
            </p>
          </div>

          <Card className="glass-card p-8 lg:p-12 border-gold/20">
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
                    className="bg-background/50 border-gold/30 focus:border-gold"
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
                    className="bg-background/50 border-gold/30 focus:border-gold"
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
                  className="bg-background/50 border-gold/30 focus:border-gold"
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
                  className="bg-background/50 border-gold/30 focus:border-gold resize-none"
                  placeholder="Erzählen Sie uns von Ihren Investitionszielen..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gold text-background hover:bg-gold/90 hover:gold-glow transition-all duration-300 text-lg py-6"
              >
                Nachricht senden
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t border-gold/20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-16 w-auto object-contain"
              />
              <p className="text-sm text-muted-foreground">
                Strukturierte Immobilieninvestments in Georgien mit professionellem Management.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gold">Kontakt</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Angelus Management Georgia</p>
                <p>Tiflis, Georgien</p>
                <p>
                  <a href="mailto:info@angelus-georgia.com" className="hover:text-gold transition-colors">
                    info@angelus-georgia.com
                  </a>
                </p>
                <p>
                  <a href="tel:+995123456789" className="hover:text-gold transition-colors">
                    +995 123 456 789
                  </a>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gold">Rechtliches</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <a href="#" className="hover:text-gold transition-colors">
                    Impressum
                  </a>
                </p>
                <p>
                  <a href="#" className="hover:text-gold transition-colors">
                    Datenschutz
                  </a>
                </p>
                <p>
                  <a href="#" className="hover:text-gold transition-colors">
                    AGB
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gold/20 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Angelus Management Georgia. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
