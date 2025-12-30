import { useState, useMemo } from "react";
import { useRoute, Link, useLocation } from "wouter";
import Header from "@/components/Header";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
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
  Calculator,
  ShoppingCart,
  Play,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { SocialShare } from "@/components/SocialShare";

// Mock data for fallback
const mockProperties: Record<number, any> = {
  1: {
    id: 1,
    title: "Luxus-Apartment im Herzen von Tiflis",
    description: "Moderne 3-Zimmer-Wohnung mit Panoramablick über die Altstadt. Diese exklusive Immobilie befindet sich in einem der begehrtesten Viertel von Tiflis und bietet höchsten Wohnkomfort.",
    longDescription: "Die Wohnung verfügt über bodentiefe Fenster, eine hochwertige Ausstattung und Zugang zu allen Annehmlichkeiten des modernen Stadtlebens. Perfekt für Investoren, die eine sichere Rendite suchen.",
    location: "Vake District",
    city: "Tiflis",
    price: "125000",
    pricePerSqm: "1316",
    area: "95",
    bedrooms: 3,
    bathrooms: 2,
    constructionStatus: "structure",
    completionDate: "2025-12-01",
    mainImage: "/images/modern-apartment.jpg",
    images: JSON.stringify(["/images/modern-apartment.jpg", "/images/tbilisi-skyline.jpg"]),
    expectedReturn: "8.5",
    rentalGuarantee: true,
    installmentAvailable: true,
    minDownPayment: "30",
    maxInstallmentMonths: 36,
    status: "available",
    features: JSON.stringify([
      "Panoramablick über die Altstadt",
      "Hochwertige Ausstattung",
      "Bodentiefe Fenster",
      "Balkon mit Stadtblick",
      "Tiefgaragenstellplatz",
      "Aufzug",
      "24/7 Concierge-Service",
      "Fitnessstudio im Gebäude"
    ])
  },
  2: {
    id: 2,
    title: "Strandnahes Investment in Batumi",
    description: "Exklusive 2-Zimmer-Wohnung nur 200m vom Schwarzen Meer. Ideal für Ferienvermietung mit hoher Rendite.",
    longDescription: "Batumi entwickelt sich rasant zum beliebten Urlaubsziel am Schwarzen Meer. Diese Wohnung bietet eine hervorragende Investitionsmöglichkeit mit garantierter Mietrendite.",
    location: "New Boulevard",
    city: "Batumi",
    price: "89000",
    pricePerSqm: "1309",
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
    status: "available",
    features: JSON.stringify([
      "200m zum Strand",
      "Meerblick",
      "Moderne Ausstattung",
      "Balkon",
      "Pool im Gebäude",
      "Rezeption"
    ])
  },
  3: {
    id: 3,
    title: "Premium Tower mit Meerblick",
    description: "4-Zimmer-Penthouse in hochwertigem Neubau-Projekt. Exklusives Wohnen auf höchstem Niveau.",
    longDescription: "Dieses Penthouse bietet unvergleichlichen Luxus mit atemberaubendem Panoramablick. Hochwertige Materialien und modernste Technik.",
    location: "Saburtalo",
    city: "Tiflis",
    price: "185000",
    pricePerSqm: "1370",
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
    status: "available",
    features: JSON.stringify([
      "Penthouse-Etage",
      "Dachterrasse",
      "Smart Home System",
      "Fußbodenheizung",
      "Einbauküche",
      "2 Tiefgaragenplätze"
    ])
  }
};

// Generate or get session ID for anonymous carts
function getSessionId(): string {
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
}

const constructionStatusLabels: Record<string, string> = {
  planning: "Planung",
  foundation: "Fundament",
  structure: "Rohbau",
  finishing: "Ausbau",
  completed: "Fertiggestellt"
};

export default function PropertyDetail() {
  const [, params] = useRoute("/immobilien/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [installmentMonths, setInstallmentMonths] = useState(24);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [sessionId] = useState(getSessionId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const propertyId = params?.id ? parseInt(params.id) : null;
  const utils = trpc.useUtils();

  // Fetch property data from database
  const { data: dbProperty, isLoading: propertyLoading } = trpc.properties.getById.useQuery(
    { id: propertyId! },
    { enabled: !!propertyId }
  );

  // Use database property if available, otherwise use mock data
  const property = useMemo(() => {
    if (dbProperty) return dbProperty;
    if (propertyId && mockProperties[propertyId]) return mockProperties[propertyId];
    return null;
  }, [dbProperty, propertyId]);

  // Fetch available services
  const { data: services } = trpc.services.list.useQuery();

  // Fetch property media
  const { data: propertyMedia } = trpc.propertyMedia.getByProperty.useQuery(
    { propertyId: propertyId! },
    { enabled: !!propertyId }
  );

  // Cart mutation
  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Zum Warenkorb hinzugefügt!");
    },
    onError: (error) => toast.error(error.message),
  });

  // Parse images from property
  const images = property?.images ? 
    (typeof property.images === 'string' ? JSON.parse(property.images) : property.images) : 
    [];
  
  // Combine with property media
  const allMedia = [
    ...(property?.mainImage ? [{ type: 'image', url: property.mainImage }] : []),
    ...images.map((url: string) => ({ type: 'image', url })),
    ...(propertyMedia || []),
  ];

  // Calculate payment details
  const totalPrice = property ? parseFloat(property.price) : 0;
  const minDownPayment = property?.minDownPayment ? parseFloat(property.minDownPayment) : 30;
  const maxInstallment = property?.maxInstallmentMonths || 36;
  const downPayment = (totalPrice * downPaymentPercent) / 100;
  const remainingAmount = totalPrice - downPayment;
  const monthlyPayment = installmentMonths > 0 ? remainingAmount / installmentMonths : 0;

  // Calculate total with services
  const selectedServicesTotal = services
    ?.filter((s: any) => selectedServices.includes(s.id))
    .reduce((sum: number, s: any) => sum + parseFloat(s.price), 0) || 0;
  const grandTotal = totalPrice + selectedServicesTotal;

  // Filter relevant services (company formation, rental guarantee)
  const relevantServices = services?.filter((s: any) => 
    s.category === 'company_formation' || 
    s.category === 'rental_guarantee' ||
    s.category === 'property_management'
  ) || [];

  const handleAddToCart = async () => {
    if (!property) return;

    try {
      // Add property to cart
      await addToCartMutation.mutateAsync({
        sessionId,
        itemType: "property",
        propertyId: property.id,
        quantity: 1,
        unitPrice: property.price,
        options: JSON.stringify({
          name: property.title,
          description: property.location,
          downPaymentPercent,
          installmentMonths,
        }),
      });

      // Add selected services to cart
      for (const serviceId of selectedServices) {
        const service = services?.find((s: any) => s.id === serviceId);
        if (service) {
          await addToCartMutation.mutateAsync({
            sessionId,
            itemType: "service",
            serviceId: service.id,
            quantity: 1,
            unitPrice: service.price,
            options: JSON.stringify({
              name: service.name,
              description: service.description,
              linkedPropertyId: property.id,
            }),
          });
        }
      }

      setLocation("/warenkorb");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const toggleService = (serviceId: number) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#C4A052] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Immobilie nicht gefunden</h2>
            <p className="text-gray-600 mb-6">
              Die angeforderte Immobilie konnte nicht gefunden werden.
            </p>
            <Link href="/immobilien">
              <Button className="bg-[#C4A052] hover:bg-[#B39142]">
                Zurück zur Übersicht
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse features
  const features = property.features ? 
    (typeof property.features === 'string' ? JSON.parse(property.features) : property.features) : 
    [];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />

      {/* Image Gallery */}
      <section className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden bg-gray-100">
            {allMedia.length > 0 ? (
              <>
                {allMedia[currentImageIndex]?.type === 'video' ? (
                  <video
                    src={allMedia[currentImageIndex].url}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={allMedia[currentImageIndex]?.url || property.mainImage || '/images/modern-apartment.jpg'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-24 h-24 text-gray-300" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            {allMedia.slice(1, 5).map((media: any, idx: number) => (
              <div 
                key={idx} 
                className="relative h-60 rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setCurrentImageIndex(idx + 1)}
              >
                {media.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt={`${property.title} ${idx + 2}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                {property.constructionStatus && (
                  <Badge className="bg-blue-500/10 text-blue-500">
                    {constructionStatusLabels[property.constructionStatus] || property.constructionStatus}
                  </Badge>
                )}
                {property.completionDate && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Fertigstellung: {new Date(property.completionDate).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <p className="text-lg text-gray-600 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#C4A052]" />
                    {property.location}, {property.city}
                  </p>
                </div>
                <SocialShare
                  url={typeof window !== 'undefined' ? window.location.href : `https://georgien-property.agency/property/${property.id}`}
                  title={property.title}
                  description={`${property.location}, ${property.city} - €${parseInt(property.price).toLocaleString('de-DE')} - ${property.area}m²`}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-6 border-y border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">Zimmer</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Bed className="h-5 w-5 text-[#C4A052]" />
                  {property.bedrooms || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Bäder</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Bath className="h-5 w-5 text-[#C4A052]" />
                  {property.bathrooms || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Fläche</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-[#C4A052]" />
                  {property.area} m²
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Rendite</p>
                <p className="text-2xl font-bold text-[#C4A052] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {property.expectedReturn || '-'}%
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Beschreibung</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
              {property.longDescription && (
                <p className="text-gray-600 leading-relaxed mt-4 whitespace-pre-line">
                  {property.longDescription}
                </p>
              )}
            </div>

            {features.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ausstattung</h2>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#C4A052] flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Services */}
            {relevantServices.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Zusatzleistungen</h2>
                <p className="text-gray-600 mb-4">
                  Wählen Sie optionale Zusatzleistungen für Ihre Investition:
                </p>
                <div className="space-y-3">
                  {relevantServices.map((service: any) => (
                    <Card 
                      key={service.id} 
                      className={`cursor-pointer transition-all ${
                        selectedServices.includes(service.id) 
                          ? 'border-[#C4A052] bg-[#C4A052]/5' 
                          : 'hover:border-[#C4A052]/50'
                      }`}
                      onClick={() => toggleService(service.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedServices.includes(service.id)}
                            onCheckedChange={() => toggleService(service.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                              <span className="font-bold text-[#C4A052]">
                                {parseFloat(service.price).toLocaleString('de-DE')} €
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {totalPrice.toLocaleString('de-DE')} €
                </CardTitle>
                <CardDescription>
                  {property.pricePerSqm && (
                    <span>{parseFloat(property.pricePerSqm).toLocaleString('de-DE')} €/m²</span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {property.installmentAvailable && (
                  <>
                    <div className="p-4 bg-[#C4A052]/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-5 w-5 text-[#C4A052]" />
                        <h3 className="font-semibold text-gray-900">Ratenzahlungsrechner</h3>
                      </div>
                      <p className="text-sm text-gray-600">
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
                          min={minDownPayment}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Mindestens {minDownPayment}%
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
                          max={maxInstallment}
                          step={6}
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Bis zu {maxInstallment} Monate
                        </p>
                      </div>

                      <div className="p-4 bg-gray-100 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Anzahlung</span>
                          <span className="font-semibold">{downPayment.toLocaleString('de-DE')} €</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Restbetrag</span>
                          <span className="font-semibold">{remainingAmount.toLocaleString('de-DE')} €</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                          <span>Monatliche Rate</span>
                          <span className="text-[#C4A052]">{monthlyPayment.toLocaleString('de-DE')} €</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Selected Services Summary */}
                {selectedServices.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg space-y-2">
                    <h4 className="font-semibold text-green-800">Ausgewählte Zusatzleistungen</h4>
                    {services?.filter((s: any) => selectedServices.includes(s.id)).map((service: any) => (
                      <div key={service.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{service.name}</span>
                        <span className="font-medium">{parseFloat(service.price).toLocaleString('de-DE')} €</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t border-green-200">
                      <span>Gesamtsumme</span>
                      <span className="text-[#C4A052]">{grandTotal.toLocaleString('de-DE')} €</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-[#C4A052] hover:bg-[#B39142] text-white py-6 text-lg"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Wird hinzugefügt...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      In den Warenkorb
                    </>
                  )}
                </Button>

                {/* Direkter Kaufen-Button mit Vorvertrag */}
                <Link href={`/purchase/${property.id}`}>
                  <Button
                    className="w-full mt-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-6 text-lg shadow-lg"
                    variant="default"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Jetzt kaufen (Vorvertrag)
                  </Button>
                </Link>
                <p className="text-xs text-center text-gray-500 mt-1">
                  Direkter Kauf mit digitalem Vorvertrag nach georgischem Recht
                </p>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Ihre Vorteile:</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {property.rentalGuarantee && (
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#C4A052]" />
                        Mietgarantie inklusive
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C4A052]" />
                      Transparente Due Diligence
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C4A052]" />
                      Professionelles Management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#C4A052]" />
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
      <section className="bg-gradient-to-br from-[#C4A052]/10 via-[#FAF8F5] to-[#FAF8F5] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Haben Sie Fragen zu dieser Immobilie?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Unsere Experten beraten Sie gerne persönlich und beantworten alle Ihre Fragen.
          </p>
          <a href="https://calendly.com/t-gross-lce/besprechung" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-[#C4A052] hover:bg-[#B39142]">
              📅 Beratungstermin buchen
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
