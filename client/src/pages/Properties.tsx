import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Bed, Bath, Maximize, TrendingUp, Shield, Calendar } from "lucide-react";

// Mock data - will be replaced with real database queries
const mockProperties = [
  {
    id: 1,
    title: "Luxus-Apartment im Herzen von Tiflis",
    description: "Moderne 3-Zimmer-Wohnung mit Panoramablick über die Altstadt",
    location: "Vake District, Tiflis",
    city: "Tiflis",
    price: "125000",
    area: "95",
    bedrooms: 3,
    bathrooms: 2,
    constructionStatus: "structure",
    completionDate: "2025-12-01",
    images: ["/images/modern-apartment.jpg"],
    expectedReturn: "8.5",
    rentalGuarantee: true,
    installmentAvailable: true,
    minDownPayment: "30",
    status: "available"
  },
  {
    id: 2,
    title: "Strandnahes Investment in Batumi",
    description: "Exklusive 2-Zimmer-Wohnung nur 200m vom Schwarzen Meer",
    location: "New Boulevard, Batumi",
    city: "Batumi",
    price: "89000",
    area: "68",
    bedrooms: 2,
    bathrooms: 1,
    constructionStatus: "finishing",
    completionDate: "2025-06-01",
    images: ["/images/batumi-coast.jpg"],
    expectedReturn: "10.2",
    rentalGuarantee: true,
    installmentAvailable: true,
    minDownPayment: "25",
    status: "available"
  },
  {
    id: 3,
    title: "Premium Tower mit Meerblick",
    description: "4-Zimmer-Penthouse in hochwertigem Neubau-Projekt",
    location: "Saburtalo, Tiflis",
    city: "Tiflis",
    price: "185000",
    area: "135",
    bedrooms: 4,
    bathrooms: 3,
    constructionStatus: "foundation",
    completionDate: "2026-03-01",
    images: ["/images/luxury-building.jpg"],
    expectedReturn: "7.8",
    rentalGuarantee: false,
    installmentAvailable: true,
    minDownPayment: "35",
    status: "available"
  },
];

const constructionStatusLabels: Record<string, string> = {
  planning: "Planung",
  foundation: "Fundament",
  structure: "Rohbau",
  finishing: "Ausbau",
  completed: "Fertiggestellt"
};

const constructionStatusColors: Record<string, string> = {
  planning: "bg-gray-500/10 text-gray-500",
  foundation: "bg-yellow-500/10 text-yellow-500",
  structure: "bg-blue-500/10 text-blue-500",
  finishing: "bg-purple-500/10 text-purple-500",
  completed: "bg-green-500/10 text-green-500"
};

export default function Properties() {
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("price-asc");

  let filteredProperties = [...mockProperties];

  // Apply filters
  if (cityFilter !== "all") {
    filteredProperties = filteredProperties.filter(p => p.city === cityFilter);
  }
  if (statusFilter !== "all") {
    filteredProperties = filteredProperties.filter(p => p.constructionStatus === statusFilter);
  }

  // Apply sorting
  if (sortBy === "price-asc") {
    filteredProperties.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortBy === "price-desc") {
    filteredProperties.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else if (sortBy === "return-desc") {
    filteredProperties.sort((a, b) => parseFloat(b.expectedReturn) - parseFloat(a.expectedReturn));
  }

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
            <Link href="/">
              <a className="text-sm text-gold hover:underline">← Zurück zur Startseite</a>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gold/10 via-background to-background py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Immobilien in Georgien
            </h1>
            <p className="text-xl text-muted-foreground">
              Entdecken Sie sorgfältig ausgewählte Immobilienprojekte mit attraktiven Renditen 
              und flexiblen Ratenzahlungsoptionen.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Stadt</label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Städte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Städte</SelectItem>
                  <SelectItem value="Tiflis">Tiflis</SelectItem>
                  <SelectItem value="Batumi">Batumi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Baufortschritt</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="planning">Planung</SelectItem>
                  <SelectItem value="foundation">Fundament</SelectItem>
                  <SelectItem value="structure">Rohbau</SelectItem>
                  <SelectItem value="finishing">Ausbau</SelectItem>
                  <SelectItem value="completed">Fertiggestellt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Sortierung</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sortieren nach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Preis aufsteigend</SelectItem>
                  <SelectItem value="price-desc">Preis absteigend</SelectItem>
                  <SelectItem value="return-desc">Rendite absteigend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="container py-12">
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredProperties.length} {filteredProperties.length === 1 ? "Immobilie" : "Immobilien"} gefunden
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.rentalGuarantee && (
                    <Badge className="bg-gold text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Mietgarantie
                    </Badge>
                  )}
                  {property.installmentAvailable && (
                    <Badge className="bg-blue-500 text-white">
                      Ratenzahlung
                    </Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className={constructionStatusColors[property.constructionStatus]}>
                    {constructionStatusLabels[property.constructionStatus]}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl">{property.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {property.description}
                </p>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gold" />
                    <span>{property.bedrooms} Zimmer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-gold" />
                    <span>{property.bathrooms} Bad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="h-4 w-4 text-gold" />
                    <span>{property.area} m²</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Erwartete Rendite</p>
                    <p className="text-lg font-semibold text-gold flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {property.expectedReturn}% p.a.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Fertigstellung</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(property.completionDate).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between bg-muted/50 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Preis</p>
                  <p className="text-2xl font-bold text-foreground">
                    {parseFloat(property.price).toLocaleString('de-DE')} €
                  </p>
                  {property.installmentAvailable && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ab {property.minDownPayment}% Anzahlung
                    </p>
                  )}
                </div>
                <Link href={`/immobilien/${property.id}`}>
                  <Button className="bg-gold hover:bg-gold/90">
                    Details ansehen
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Keine Immobilien gefunden
            </h3>
            <p className="text-muted-foreground mb-6">
              Versuchen Sie, Ihre Filtereinstellungen anzupassen.
            </p>
            <Button
              onClick={() => {
                setCityFilter("all");
                setStatusFilter("all");
              }}
            >
              Filter zurücksetzen
            </Button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-gold/10 via-background to-background py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Individuelle Beratung gewünscht?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unsere Experten helfen Ihnen, die perfekte Investitionsmöglichkeit zu finden.
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
