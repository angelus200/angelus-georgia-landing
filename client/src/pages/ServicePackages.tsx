import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Building2, Shield, TrendingUp, Package } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const services = [
  {
    id: 1,
    name: "Firmengründung in Georgien",
    description: "Vollständige Unterstützung bei der Gründung Ihrer georgischen Gesellschaft",
    price: 500,
    icon: Building2,
    features: [
      "Beratung zur optimalen Rechtsform",
      "Vorbereitung aller erforderlichen Dokumente",
      "Registrierung beim georgischen Handelsregister",
      "Eröffnung eines Geschäftskontos",
      "Steuerregistrierung",
      "Notarielle Beglaubigungen",
    ],
    duration: "2-3 Wochen",
    popular: false,
  },
  {
    id: 2,
    name: "Property Management",
    description: "Professionelle Verwaltung Ihrer Immobilie vor Ort",
    price: 50,
    priceUnit: "pro Monat",
    icon: Shield,
    features: [
      "Mietersuche und -verwaltung",
      "Mietinkasso und Buchhaltung",
      "Regelmäßige Inspektionen",
      "Koordination von Reparaturen",
      "Monatliche Berichte",
      "24/7 Notfall-Hotline",
    ],
    duration: "Laufend",
    popular: true,
  },
  {
    id: 3,
    name: "Mietgarantie",
    description: "Garantierte Mieteinnahmen unabhängig von der Vermietungssituation",
    price: 0,
    priceInfo: "Individuell nach Objekt",
    icon: TrendingUp,
    features: [
      "Garantierte monatliche Zahlung",
      "Unabhängig von Leerstand",
      "Professionelle Mieterauswahl",
      "Vollständige Verwaltung inklusive",
      "Langfristige Verträge möglich",
      "Keine versteckten Kosten",
    ],
    duration: "Mind. 12 Monate",
    popular: false,
  },
];

const packages = [
  {
    id: "starter",
    name: "Starter-Paket",
    description: "Ideal für Ihren ersten Immobilienkauf in Georgien",
    price: 550,
    savings: 50,
    icon: Package,
    includes: ["Firmengründung", "Beratung zum Immobilienkauf"],
    features: [
      "Firmengründung in Georgien",
      "Persönliche Beratung (2 Stunden)",
      "Due Diligence Unterstützung",
      "Vertragspr üfung",
    ],
  },
  {
    id: "premium",
    name: "Premium-Paket",
    description: "Rundum-Sorglos-Paket für langfristige Investoren",
    price: 1200,
    savings: 400,
    icon: Package,
    includes: ["Firmengründung", "Property Management (12 Monate)", "Mietgarantie"],
    features: [
      "Firmengründung in Georgien",
      "Property Management für 12 Monate",
      "Mietgarantie für 12 Monate",
      "Persönliche Beratung (5 Stunden)",
      "Prioritäts-Support",
      "Jährlicher Investitionsbericht",
    ],
    popular: true,
  },
];

export default function ServicePackages() {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const handleBookService = (serviceName: string) => {
    toast.success(`Anfrage für "${serviceName}" wurde gesendet. Wir melden uns in Kürze bei Ihnen.`);
  };

  const handleBookPackage = (packageName: string) => {
    toast.success(`Anfrage für "${packageName}" wurde gesendet. Wir melden uns in Kürze bei Ihnen.`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-12 w-auto object-contain"
              />
            </a>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/immobilien" className="text-sm font-medium hover:text-gold transition-colors">
              Immobilien
            </Link>
            <Link href="/service-pakete" className="text-sm font-medium text-gold">
              Services
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white">
                Anmelden
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-gold/5 to-gold/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Unsere <span className="text-gold">Service-Pakete</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Von der Firmengründung bis zur professionellen Verwaltung – wir bieten Ihnen alle Dienstleistungen
              für erfolgreiche Immobilieninvestitionen in Georgien.
            </p>
          </div>
        </div>
      </section>

      {/* Individual Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Einzelleistungen</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wählen Sie genau die Services, die Sie benötigen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.id}
                  className={`relative hover:shadow-xl transition-shadow ${
                    service.popular ? "border-gold border-2" : ""
                  }`}
                >
                  {service.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold">
                      Beliebt
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="text-3xl font-bold text-gold">
                        {service.priceInfo ? (
                          <span className="text-lg">{service.priceInfo}</span>
                        ) : (
                          <>
                            €{service.price}
                            {service.priceUnit && (
                              <span className="text-base font-normal text-muted-foreground ml-2">
                                {service.priceUnit}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Dauer: {service.duration}</p>
                    </div>

                    <ul className="space-y-3">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full bg-gold hover:bg-gold/90"
                      onClick={() => handleBookService(service.name)}
                    >
                      Jetzt anfragen
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Package Deals */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Komplettpakete</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sparen Sie mit unseren vorkonfigurierten Paketen
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg) => {
              const Icon = pkg.icon;
              return (
                <Card
                  key={pkg.id}
                  className={`relative hover:shadow-xl transition-shadow ${
                    pkg.popular ? "border-gold border-2" : ""
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold">
                      Empfohlen
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gold">€{pkg.price}</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Sparen Sie €{pkg.savings}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Enthält: {pkg.includes.join(", ")}
                      </p>
                    </div>

                    <ul className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full bg-gold hover:bg-gold/90"
                      onClick={() => handleBookPackage(pkg.name)}
                    >
                      Paket buchen
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gold/10 to-gold/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Individuelle Beratung gewünscht?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Lassen Sie sich von unseren Experten beraten und finden Sie die perfekte Lösung für Ihre
              Investitionsziele.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#contact">
                <Button size="lg" className="bg-gold hover:bg-gold/90">
                  Beratungsgespräch vereinbaren
                </Button>
              </Link>
              <Link href="/immobilien">
                <Button size="lg" variant="outline">
                  Immobilien ansehen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-16 w-auto object-contain mb-4 brightness-0 invert"
              />
              <p className="text-gray-400 text-sm">
                Ihr Partner für strukturierte Immobilieninvestments in Georgien
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/" className="hover:text-gold transition-colors">
                    Startseite
                  </Link>
                </li>
                <li>
                  <Link href="/immobilien" className="hover:text-gold transition-colors">
                    Immobilien
                  </Link>
                </li>
                <li>
                  <Link href="/service-pakete" className="hover:text-gold transition-colors">
                    Services
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Rechtliches</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/impressum" className="hover:text-gold transition-colors">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className="hover:text-gold transition-colors">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="/agb" className="hover:text-gold transition-colors">
                    AGB
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Kontakt</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>angelusmanagementgeorgia@gmail.com</li>
                <li>+995 579 10 67 19</li>
                <li>26 May Street, No. 19</li>
                <li>Batumi, Georgia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Angelus Management Georgia LLC. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
