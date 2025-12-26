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
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-gradient">
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
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-14 w-auto object-contain"
              />
              <p className="text-sm text-muted-foreground">
                Strukturierte Immobilieninvestments in Georgien mit professionellem Management.
              </p>
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
