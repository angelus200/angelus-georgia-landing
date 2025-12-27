import { Building2, Mail, MapPin, Phone, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border py-6">
        <div className="container flex items-center justify-between">
          <a href="/" className="inline-block">
            <img
              src="/images/angelus-logo.png"
              alt="Angelus Management Georgia"
              className="h-12 w-auto object-contain"
            />
          </a>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl lg:text-5xl font-bold mb-8 text-foreground">
            Impressum
          </h1>

          <div className="space-y-8">
            {/* Company Information */}
            <Card className="p-8 bg-white border-border">
              <h2 className="text-2xl font-semibold text-gold mb-6 flex items-center gap-3">
                <Building2 className="h-6 w-6" />
                Angaben gemäß Informationspflicht
              </h2>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Firmenname</p>
                  <p className="text-lg font-semibold text-foreground">ANGELUS MANAGEMENT GEORGIA LLC</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Registrierungsnummer</p>
                  <p className="text-lg text-foreground">445810613</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Geschäftsführung</p>
                  <p className="text-lg text-foreground">Irina Fedotova (Director)</p>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-8 bg-white border-border">
              <h2 className="text-2xl font-semibold text-gold mb-6">
                Kontaktdaten
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Anschrift</p>
                    <p className="text-foreground">26 May Street, No. 19</p>
                    <p className="text-foreground">Batumi, Georgia</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Telefon</p>
                    <a 
                      href="tel:+995579106719" 
                      className="text-foreground hover:text-gold transition-colors"
                    >
                      +995 579 10 67 19
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">E-Mail</p>
                    <a 
                      href="mailto:angelusmanagementgeorgia@gmail.com" 
                      className="text-foreground hover:text-gold transition-colors break-all"
                    >
                      angelusmanagementgeorgia@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            {/* Legal Information */}
            <Card className="p-8 bg-white border-border">
              <h2 className="text-2xl font-semibold text-gold mb-6">
                Rechtliche Hinweise
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Haftungsausschluss</h3>
                  <p className="leading-relaxed">
                    Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
                    Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
                    Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen 
                    Gesetzen verantwortlich.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Haftung für Links</h3>
                  <p className="leading-relaxed">
                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
                    Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                    Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber 
                    der Seiten verantwortlich.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Urheberrecht</h3>
                  <p className="leading-relaxed">
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                    dem georgischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                    der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung 
                    des jeweiligen Autors bzw. Erstellers.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Investitionshinweis</h3>
                  <p className="leading-relaxed">
                    Die auf dieser Website dargestellten Informationen stellen keine Anlageberatung dar. 
                    Jede Investitionsentscheidung sollte auf Grundlage einer individuellen Beratung und 
                    unter Berücksichtigung der persönlichen Verhältnisse getroffen werden. Vergangene 
                    Wertentwicklungen sind keine Garantie für zukünftige Erträge.
                  </p>
                </div>
              </div>
            </Card>

            {/* Director Information */}
            <Card className="p-8 bg-white border-border">
              <h2 className="text-2xl font-semibold text-gold mb-6 flex items-center gap-3">
                <User className="h-6 w-6" />
                Verantwortlich für den Inhalt
              </h2>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Irina Fedotova</p>
                <p className="text-muted-foreground">Director</p>
                <p className="text-muted-foreground">ANGELUS MANAGEMENT GEORGIA LLC</p>
                <p className="text-muted-foreground">26 May Street, No. 19, Batumi, Georgia</p>
              </div>
            </Card>
          </div>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors font-semibold"
            >
              ← Zurück zur Startseite
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 border-t border-border mt-20">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ANGELUS MANAGEMENT GEORGIA LLC. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
