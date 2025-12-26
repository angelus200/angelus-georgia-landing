import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  TrendingUp, 
  Shield, 
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Calculator
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Mock data - will be replaced with real API call
const mockProperty = {
  id: 1,
  title: "Luxus-Apartment im Herzen von Tiflis",
  description: "Moderne 3-Zimmer-Wohnung mit Panoramablick über die Altstadt. Diese exklusive Immobilie befindet sich in einem der begehrtesten Viertel von Tiflis und bietet höchsten Wohnkomfort. Die Wohnung verfügt über bodentiefe Fenster, eine hochwertige Ausstattung und Zugang zu allen Annehmlichkeiten des modernen Stadtlebens.",
  location: "Vake District, Tiflis",
  city: "Tiflis",
  price: "125000",
  area: "95",
  bedrooms: 3,
  bathrooms: 2,
  constructionStatus: "structure",
  completionDate: "2025-12-01",
  images: ["/images/modern-apartment.jpg", "/images/tbilisi-skyline.jpg"],
  expectedReturn: "8.5",
  rentalGuarantee: true,
  installmentAvailable: true,
  minDownPayment: "30",
  maxInstallmentMonths: 36,
  status: "available",
  features: [
    "Panoramablick über die Altstadt",
    "Hochwertige Ausstattung",
    "Bodentiefe Fenster",
    "Balkon mit Stadtblick",
    "Tiefgaragenstellplatz",
    "Aufzug",
    "24/7 Concierge-Service",
    "Fitnessstudio im Gebäude"
  ]
};

const constructionStatusLabels: Record<string, string> = {
  planning: "Planung",
  foundation: "Fundament",
  structure: "Rohbau",
  finishing: "Ausbau",
  completed: "Fertiggestellt"
};

export default function PropertyDetail() {
  const [, params] = useRoute("/immobilien/:id");
  const { user } = useAuth();
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [installmentMonths, setInstallmentMonths] = useState(24);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const propertyId = params?.id ? parseInt(params.id) : null;

  // Calculate payment details
  const totalPrice = parseFloat(mockProperty.price);
  const downPayment = (totalPrice * downPaymentPercent) / 100;
  const remainingAmount = totalPrice - downPayment;
  const monthlyPayment = remainingAmount / installmentMonths;

  const bookingMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Buchung erfolgreich! Wir werden uns in Kürze bei Ihnen melden.");
      setShowBookingForm(false);
    },
    onError: (error) => {
      toast.error(`Fehler bei der Buchung: ${error.message}`);
    },
  });

  const handleBooking = () => {
    if (!user) {
      toast.error("Bitte melden Sie sich an, um eine Buchung vorzunehmen.");
      return;
    }

    bookingMutation.mutate({
      propertyId: mockProperty.id,
      totalAmount: totalPrice.toString(),
      downPayment: downPayment.toString(),
      installmentMonths,
      monthlyPayment: monthlyPayment.toString(),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a>
                <img
                  src="/images/angelus-logo.png"
                  alt="Angelus Management Georgia"
                  className="h-12 w-auto object-contain"
                />
              </a>
            </Link>
            <Link href="/immobilien">
              <a className="flex items-center gap-2 text-sm text-gold hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Zurück zur Übersicht
              </a>
            </Link>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <section className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden">
            <img
              src={mockProperty.images[0]}
              alt={mockProperty.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {mockProperty.rentalGuarantee && (
                <Badge className="bg-gold text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Mietgarantie
                </Badge>
              )}
              {mockProperty.installmentAvailable && (
                <Badge className="bg-blue-500 text-white">
                  Ratenzahlung
                </Badge>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {mockProperty.images.slice(1).map((img, idx) => (
              <div key={idx} className="relative h-60 rounded-xl overflow-hidden">
                <img
                  src={img}
                  alt={`${mockProperty.title} ${idx + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-blue-500/10 text-blue-500">
                  {constructionStatusLabels[mockProperty.constructionStatus]}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Fertigstellung: {new Date(mockProperty.completionDate).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-2">
                {mockProperty.title}
              </h1>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gold" />
                {mockProperty.location}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 py-6 border-y border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Zimmer</p>
                <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Bed className="h-5 w-5 text-gold" />
                  {mockProperty.bedrooms}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bäder</p>
                <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Bath className="h-5 w-5 text-gold" />
                  {mockProperty.bathrooms}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fläche</p>
                <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-gold" />
                  {mockProperty.area} m²
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rendite</p>
                <p className="text-2xl font-bold text-gold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {mockProperty.expectedReturn}%
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Beschreibung</h2>
              <p className="text-muted-foreground leading-relaxed">
                {mockProperty.description}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Ausstattung</h2>
              <div className="grid grid-cols-2 gap-3">
                {mockProperty.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-foreground">
                  {parseFloat(mockProperty.price).toLocaleString('de-DE')} €
                </CardTitle>
                <CardDescription>Gesamtpreis</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {mockProperty.installmentAvailable && !showBookingForm && (
                  <>
                    <div className="p-4 bg-gold/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-5 w-5 text-gold" />
                        <h3 className="font-semibold text-foreground">Ratenzahlungsrechner</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Berechnen Sie Ihre individuelle Ratenzahlung
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Anzahlung: {downPaymentPercent}% ({downPayment.toLocaleString('de-DE')} €)
                        </Label>
                        <Slider
                          value={[downPaymentPercent]}
                          onValueChange={(value) => setDownPaymentPercent(value[0])}
                          min={parseInt(mockProperty.minDownPayment)}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Mindestens {mockProperty.minDownPayment}%
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Laufzeit: {installmentMonths} Monate
                        </Label>
                        <Slider
                          value={[installmentMonths]}
                          onValueChange={(value) => setInstallmentMonths(value[0])}
                          min={6}
                          max={mockProperty.maxInstallmentMonths}
                          step={6}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Bis zu {mockProperty.maxInstallmentMonths} Monate
                        </p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Anzahlung</span>
                          <span className="font-semibold">{downPayment.toLocaleString('de-DE')} €</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Restbetrag</span>
                          <span className="font-semibold">{remainingAmount.toLocaleString('de-DE')} €</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                          <span>Monatliche Rate</span>
                          <span className="text-gold">{monthlyPayment.toLocaleString('de-DE')} €</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {showBookingForm && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 rounded-lg">
                      <h3 className="font-semibold text-green-600 mb-2">Buchungsübersicht</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gesamtpreis</span>
                          <span className="font-semibold">{totalPrice.toLocaleString('de-DE')} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Anzahlung</span>
                          <span className="font-semibold">{downPayment.toLocaleString('de-DE')} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Laufzeit</span>
                          <span className="font-semibold">{installmentMonths} Monate</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="text-muted-foreground">Monatlich</span>
                          <span className="font-bold text-gold">{monthlyPayment.toLocaleString('de-DE')} €</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Mit der Buchung bestätigen Sie, dass Sie die AGB und Datenschutzerklärung gelesen haben und akzeptieren.
                    </p>
                  </div>
                )}

                {!showBookingForm ? (
                  <Button
                    className="w-full bg-gold hover:bg-gold/90 text-white"
                    size="lg"
                    onClick={() => {
                      if (!user) {
                        toast.error("Bitte melden Sie sich an, um eine Buchung vorzunehmen.");
                        return;
                      }
                      setShowBookingForm(true);
                    }}
                  >
                    Jetzt buchen
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowBookingForm(false)}
                    >
                      Zurück
                    </Button>
                    <Button
                      className="flex-1 bg-gold hover:bg-gold/90 text-white"
                      onClick={handleBooking}
                      disabled={bookingMutation.isPending}
                    >
                      {bookingMutation.isPending ? "Wird gebucht..." : "Verbindlich buchen"}
                    </Button>
                  </div>
                )}

                <div className="pt-4 border-t border-border space-y-2">
                  <p className="text-sm font-semibold text-foreground">Ihre Vorteile:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {mockProperty.rentalGuarantee && (
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gold" />
                        Mietgarantie inklusive
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gold" />
                      Transparente Due Diligence
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gold" />
                      Professionelles Management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gold" />
                      Regelmäßige Baufortschritts-Updates
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-br from-gold/10 via-background to-background py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Haben Sie Fragen zu dieser Immobilie?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unsere Experten beraten Sie gerne persönlich und beantworten alle Ihre Fragen.
          </p>
          <Link href="/#contact">
            <Button size="lg" className="bg-gold hover:bg-gold/90">
              Jetzt Kontakt aufnehmen
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
