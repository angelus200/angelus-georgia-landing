import { useState, useMemo } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Bed, Bath, Maximize, TrendingUp, Shield, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Fallback mock data if database is empty
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
    mainImage: "/images/modern-apartment.jpg",
    images: JSON.stringify(["/images/modern-apartment.jpg"]),
    expectedReturn: "8.5",
    rentalGuarantee: true,
    installmentAvailable: true,
    minDownPayment: "30",
    maxInstallmentMonths: 36,
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
    mainImage: "/images/batumi-coast.jpg",
    images: JSON.stringify(["/images/batumi-coast.jpg"]),
    expectedReturn: "10.2",
    rentalGuarantee: true,
    installmentAvailable: true,
    minDownPayment: "25",
    maxInstallmentMonths: 36,
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
    mainImage: "/images/luxury-building.jpg",
    images: JSON.stringify(["/images/luxury-building.jpg"]),
    expectedReturn: "7.8",
    rentalGuarantee: false,
    installmentAvailable: true,
    minDownPayment: "35",
    maxInstallmentMonths: 36,
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

  // Fetch properties from database
  const { data: dbProperties, isLoading } = trpc.properties.list.useQuery();

  // Use database properties if available, otherwise use mock data
  const properties = useMemo(() => {
    if (dbProperties && dbProperties.length > 0) {
      return dbProperties;
    }
    return mockProperties;
  }, [dbProperties]);

  let filteredProperties = [...properties];

  // Apply filters
  if (cityFilter !== "all") {
    filteredProperties = filteredProperties.filter(p => p.city === cityFilter);
  }
  if (statusFilter !== "all") {
    filteredProperties = filteredProperties.filter(p => p.constructionStatus === statusFilter);
  }

  // Apply sorting
  filteredProperties.sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-desc":
        return parseFloat(b.price) - parseFloat(a.price);
      case "return-desc":
        return parseFloat(b.expectedReturn || "0") - parseFloat(a.expectedReturn || "0");
      default:
        return 0;
    }
  });

  // Get unique cities for filter
  const cities = Array.from(new Set(properties.map((p: any) => p.city))) as string[];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#C4A052]/10 via-[#FAF8F5] to-[#FAF8F5] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Immobilien in Georgien
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Entdecken Sie sorgfältig ausgewählte Immobilienprojekte mit attraktiven Renditen und flexiblen Ratenzahlungsoptionen.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="w-48">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Stadt</label>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Städte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Städte</SelectItem>
                {cities.map((city: string) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Baufortschritt</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                {Object.entries(constructionStatusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Sortierung</label>
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

        {/* Results count */}
        <p className="text-gray-600 mb-6">
          {isLoading ? "Lade Immobilien..." : `${filteredProperties.length} Immobilien gefunden`}
        </p>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
              <div className="relative h-48 bg-gray-100">
                <img
                  src={property.mainImage || "/images/modern-apartment.jpg"}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {property.rentalGuarantee && (
                    <Badge className="bg-[#C4A052] text-white">
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
                {property.constructionStatus && (
                  <Badge className={`absolute top-3 right-3 ${constructionStatusColors[property.constructionStatus] || "bg-gray-500/10 text-gray-500"}`}>
                    {constructionStatusLabels[property.constructionStatus] || property.constructionStatus}
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{property.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-[#C4A052]" />
                  {property.location}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-2">
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {property.description}
                </p>

                <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4 text-gray-400" />
                    <span>{property.bedrooms} Zimmer</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4 text-gray-400" />
                    <span>{property.bathrooms} Bad</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize className="h-4 w-4 text-gray-400" />
                    <span>{property.area} m²</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-500">Erwartete Rendite</span>
                    <p className="font-semibold text-[#C4A052]">{property.expectedReturn}% p.a.</p>
                  </div>
                  {property.completionDate && (
                    <div className="text-right">
                      <span className="text-gray-500">Fertigstellung</span>
                      <p className="font-semibold">
                        {new Date(property.completionDate).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-gray-100">
                <div className="w-full flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Preis</p>
                    <p className="text-xl font-bold text-gray-900">
                      {parseFloat(property.price).toLocaleString('de-DE')} €
                    </p>
                    {property.minDownPayment && (
                      <p className="text-xs text-gray-500">ab {property.minDownPayment}% Anzahlung</p>
                    )}
                  </div>
                  <Link href={`/immobilien/${property.id}`}>
                    <Button className="bg-[#C4A052] hover:bg-[#B39142]">
                      Details ansehen
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Keine Immobilien gefunden
            </h3>
            <p className="text-gray-600">
              Versuchen Sie, Ihre Filterkriterien anzupassen.
            </p>
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-br from-[#C4A052]/10 via-[#FAF8F5] to-[#FAF8F5] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Individuelle Beratung gewünscht?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Unsere Experten helfen Ihnen, die perfekte Investitionsmöglichkeit zu finden.
          </p>
          <Link href="/#contact">
            <Button size="lg" className="bg-[#C4A052] hover:bg-[#B39142]">
              Jetzt Kontakt aufnehmen
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
