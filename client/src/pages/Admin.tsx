import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { 
  Loader2, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Trash2,
  Building2,
  Plus,
  Edit,
  Package,
  CreditCard,
  Wallet,
  Check,
  X,
  TrendingUp
} from "lucide-react";

type ContactStatus = "new" | "contacted" | "closed";
type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled";
type PropertyStatus = "available" | "reserved" | "sold";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<number | null>(null);
  const [showPropertyDialog, setShowPropertyDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  
  // Services State
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "company_formation",
    isActive: true,
  });

  // Property Form State - MUST be before any conditional returns
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    description: "",
    location: "",
    city: "Tiflis",
    price: "",
    area: "",
    bedrooms: 2,
    bathrooms: 1,
    constructionStatus: "planning" as const,
    completionDate: "",
    mainImage: "",
    images: "",
    videoUrl: "",
    amenities: "",
    expectedReturn: "",
    rentalGuarantee: false,
    installmentAvailable: true,
    minDownPayment: "30",
    maxInstallmentMonths: 36,
  });

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Contact Inquiries
  const { data: inquiries, isLoading: inquiriesLoading, refetch: refetchInquiries } = trpc.contact.list.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const updateStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status erfolgreich aktualisiert");
      refetchInquiries();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteInquiryMutation = trpc.contact.delete.useMutation({
    onSuccess: () => {
      toast.success("Anfrage gelöscht");
      refetchInquiries();
      setSelectedInquiry(null);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Properties
  const { data: properties, isLoading: propertiesLoading, refetch: refetchProperties } = trpc.properties.list.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const createPropertyMutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      toast.success("Immobilie erfolgreich hinzugefügt");
      refetchProperties();
      setShowPropertyDialog(false);
      setEditingProperty(null);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updatePropertyMutation = trpc.properties.update.useMutation({
    onSuccess: () => {
      toast.success("Immobilie erfolgreich aktualisiert");
      refetchProperties();
      setShowPropertyDialog(false);
      setEditingProperty(null);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Bookings
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = trpc.bookings.getAll.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const updateBookingStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Buchungsstatus aktualisiert");
      refetchBookings();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Services
  const { data: services, isLoading: servicesLoading, refetch: refetchServices } = trpc.services.list.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const createServiceMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Dienstleistung erfolgreich hinzugefügt");
      refetchServices();
      setShowServiceDialog(false);
      setEditingService(null);
      setServiceForm({ name: "", description: "", price: "", category: "company_formation", isActive: true });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateServiceMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success("Dienstleistung erfolgreich aktualisiert");
      refetchServices();
      setShowServiceDialog(false);
      setEditingService(null);
      setServiceForm({ name: "", description: "", price: "", category: "company_formation", isActive: true });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteServiceMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Dienstleistung gelöscht");
      refetchServices();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Wallets
  const { data: allWallets, isLoading: walletsLoading, refetch: refetchWallets } = trpc.adminWallet.getAllWallets.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const { data: depositRequests, isLoading: depositsLoading, refetch: refetchDeposits } = trpc.adminWallet.getAllDepositRequests.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const [walletAdjustAmount, setWalletAdjustAmount] = useState("");
  const [walletAdjustReason, setWalletAdjustReason] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [showWalletAdjustDialog, setShowWalletAdjustDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedDepositId, setSelectedDepositId] = useState<number | null>(null);

  const approveDepositMutation = trpc.adminWallet.approveDeposit.useMutation({
    onSuccess: () => {
      toast.success("Einzahlung bestätigt");
      refetchDeposits();
      refetchWallets();
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const rejectDepositMutation = trpc.adminWallet.rejectDeposit.useMutation({
    onSuccess: () => {
      toast.success("Einzahlung abgelehnt");
      refetchDeposits();
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedDepositId(null);
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const manualDepositMutation = trpc.adminWallet.manualDeposit.useMutation({
    onSuccess: () => {
      toast.success("Einzahlung gutgeschrieben");
      refetchWallets();
      setShowWalletAdjustDialog(false);
      setWalletAdjustAmount("");
      setWalletAdjustReason("");
      setSelectedWalletId(null);
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const calculateAllInterestMutation = trpc.adminWallet.calculateAllInterest.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Zinsen berechnet: ${data.credited} von ${data.walletsProcessed} Wallets, Gesamt: ${data.totalAmount.toFixed(2)}€`);
      refetchWallets();
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Use useEffect for redirects to avoid calling setState during render
  useEffect(() => {
    if (loading) return; // Wait for auth check to complete
    
    if (!user) {
      setLocation("/admin/login");
      return;
    }
    
    if (user.role !== "admin") {
      setLocation("/dashboard");
      return;
    }
  }, [user, loading, setLocation]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#C4A052] mx-auto mb-4" />
          <p className="text-gray-600">Authentifizierung wird geprüft...</p>
        </div>
      </div>
    );
  }

  // Don't render admin content if not authenticated or not admin
  if (!user || user.role !== "admin") {
    return null;
  }

  // All hooks are now called above - only helper functions below

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProperty) {
      updatePropertyMutation.mutate({
        id: editingProperty.id,
        data: {
          title: propertyForm.title,
          description: propertyForm.description,
          location: propertyForm.location,
          city: propertyForm.city,
          price: propertyForm.price,
          area: propertyForm.area,
          bedrooms: propertyForm.bedrooms,
          bathrooms: propertyForm.bathrooms,
          constructionStatus: propertyForm.constructionStatus,
          completionDate: propertyForm.completionDate,
          mainImage: propertyForm.mainImage,
          images: propertyForm.images,
          videos: propertyForm.videoUrl ? JSON.stringify([propertyForm.videoUrl]) : undefined,
          features: propertyForm.amenities ? JSON.stringify(propertyForm.amenities.split(',').map(a => a.trim())) : undefined,
          expectedReturn: propertyForm.expectedReturn,
          rentalGuarantee: propertyForm.rentalGuarantee,
          installmentAvailable: propertyForm.installmentAvailable,
          minDownPayment: propertyForm.minDownPayment,
          maxInstallmentMonths: propertyForm.maxInstallmentMonths,
        },
      });
    } else {
      createPropertyMutation.mutate({
        ...propertyForm,
        videos: propertyForm.videoUrl ? JSON.stringify([propertyForm.videoUrl]) : undefined,
        features: propertyForm.amenities ? JSON.stringify(propertyForm.amenities.split(',').map(a => a.trim())) : undefined,
      });
    }
  };

  const openEditProperty = (property: any) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title,
      description: property.description,
      location: property.location,
      city: property.city,
      price: property.price,
      area: property.area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      constructionStatus: property.constructionStatus,
      completionDate: property.completionDate?.split('T')[0] || "",
      mainImage: property.mainImage || "",
      images: property.images || "",
      videoUrl: property.videos ? (JSON.parse(property.videos)[0] || "") : "",
      amenities: property.features ? (Array.isArray(JSON.parse(property.features)) ? JSON.parse(property.features).join(', ') : "") : "",
      expectedReturn: property.expectedReturn || "",
      rentalGuarantee: property.rentalGuarantee || false,
      installmentAvailable: property.installmentAvailable || true,
      minDownPayment: property.minDownPayment || "30",
      maxInstallmentMonths: property.maxInstallmentMonths || 36,
    });
    setShowPropertyDialog(true);
  };

  const resetPropertyForm = () => {
    setPropertyForm({
      title: "",
      description: "",
      location: "",
      city: "Tiflis",
      price: "",
      area: "",
      bedrooms: 2,
      bathrooms: 1,
      constructionStatus: "planning",
      completionDate: "",
      mainImage: "",
      images: "",
      videoUrl: "",
      amenities: "",
      expectedReturn: "",
      rentalGuarantee: false,
      installmentAvailable: true,
      minDownPayment: "30",
      maxInstallmentMonths: 36,
    });
    setEditingProperty(null);
  };

  if (!user && !inquiries) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Admin-Bereich</CardTitle>
            <CardDescription>
              Bitte melden Sie sich an, um auf den Admin-Bereich zuzugreifen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/admin/login">Anmelden</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredInquiries = statusFilter === "all" 
    ? inquiries 
    : inquiries?.filter((inq: any) => inq.status === statusFilter);

  const selectedInquiryData = inquiries?.find((inq: any) => inq.id === selectedInquiry);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <a>
                  <img
                    src="/images/angelus-logo.png"
                    alt="Angelus Management Georgia"
                    className="h-12 w-auto object-contain"
                  />
                </a>
              </Link>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Zur Startseite
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="contacts">Kontaktanfragen</TabsTrigger>
            <TabsTrigger value="properties">Immobilien</TabsTrigger>
            <TabsTrigger value="services">Dienstleistungen</TabsTrigger>
            <TabsTrigger value="bookings">Buchungen</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kontaktanfragen</CardTitle>
                    <CardDescription>
                      Verwalten Sie eingehende Kontaktanfragen
                    </CardDescription>
                  </div>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status filtern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Status</SelectItem>
                      <SelectItem value="new">Neu</SelectItem>
                      <SelectItem value="contacted">Kontaktiert</SelectItem>
                      <SelectItem value="closed">Geschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {inquiriesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gold" />
                  </div>
                ) : filteredInquiries && filteredInquiries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>E-Mail</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInquiries.map((inquiry: any) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="font-medium">{inquiry.name}</TableCell>
                          <TableCell>{inquiry.email}</TableCell>
                          <TableCell>{inquiry.phone || "-"}</TableCell>
                          <TableCell>
                            {new Date(inquiry.createdAt).toLocaleDateString('de-DE')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                inquiry.status === "new"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : inquiry.status === "contacted"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-green-500/10 text-green-500"
                              }
                            >
                              {inquiry.status === "new" ? "Neu" : inquiry.status === "contacted" ? "Kontaktiert" : "Geschlossen"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedInquiry(inquiry.id)}
                                  >
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Anfrage-Details</DialogTitle>
                                    <DialogDescription>
                                      Vollständige Informationen zur Kontaktanfrage
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedInquiryData && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium">Name</Label>
                                        <p className="text-foreground">{selectedInquiryData.name}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">E-Mail</Label>
                                        <p className="text-foreground">{selectedInquiryData.email}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Telefon</Label>
                                        <p className="text-foreground">{selectedInquiryData.phone || "Nicht angegeben"}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Nachricht</Label>
                                        <p className="text-foreground whitespace-pre-wrap">{selectedInquiryData.message}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Status ändern</Label>
                                        <Select
                                          value={selectedInquiryData.status}
                                          onValueChange={(value: ContactStatus) => {
                                            updateStatusMutation.mutate({
                                              id: selectedInquiryData.id,
                                              status: value,
                                            });
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="new">Neu</SelectItem>
                                            <SelectItem value="contacted">Kontaktiert</SelectItem>
                                            <SelectItem value="closed">Geschlossen</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={() => deleteInquiryMutation.mutate({ id: selectedInquiryData.id })}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Anfrage löschen
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Anfragen gefunden
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Immobilienverwaltung</CardTitle>
                    <CardDescription>
                      Immobilien hinzufügen, bearbeiten und verwalten
                    </CardDescription>
                  </div>
                  <Dialog open={showPropertyDialog} onOpenChange={(open) => {
                    setShowPropertyDialog(open);
                    if (!open) resetPropertyForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-gold hover:bg-gold/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Neue Immobilie
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProperty ? "Immobilie bearbeiten" : "Neue Immobilie hinzufügen"}
                        </DialogTitle>
                        <DialogDescription>
                          Füllen Sie alle erforderlichen Felder aus
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePropertySubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label>Titel *</Label>
                            <Input
                              value={propertyForm.title}
                              onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Beschreibung *</Label>
                            <Textarea
                              value={propertyForm.description}
                              onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                              rows={4}
                              required
                            />
                          </div>
                          <div>
                            <Label>Standort *</Label>
                            <Input
                              value={propertyForm.location}
                              onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                              placeholder="z.B. Vake District, Tiflis"
                              required
                            />
                          </div>
                          <div>
                            <Label>Stadt *</Label>
                            <Select
                              value={propertyForm.city}
                              onValueChange={(value) => setPropertyForm({ ...propertyForm, city: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tiflis">Tiflis</SelectItem>
                                <SelectItem value="Batumi">Batumi</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Preis (€) *</Label>
                            <Input
                              type="number"
                              value={propertyForm.price}
                              onChange={(e) => setPropertyForm({ ...propertyForm, price: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Fläche (m²) *</Label>
                            <Input
                              type="number"
                              value={propertyForm.area}
                              onChange={(e) => setPropertyForm({ ...propertyForm, area: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Zimmer *</Label>
                            <Input
                              type="number"
                              value={propertyForm.bedrooms}
                              onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: parseInt(e.target.value) })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Bäder *</Label>
                            <Input
                              type="number"
                              value={propertyForm.bathrooms}
                              onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: parseInt(e.target.value) })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Baufortschritt *</Label>
                            <Select
                              value={propertyForm.constructionStatus}
                              onValueChange={(value: any) => setPropertyForm({ ...propertyForm, constructionStatus: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planning">Planung</SelectItem>
                                <SelectItem value="foundation">Fundament</SelectItem>
                                <SelectItem value="structure">Rohbau</SelectItem>
                                <SelectItem value="finishing">Ausbau</SelectItem>
                                <SelectItem value="completed">Fertiggestellt</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Fertigstellung *</Label>
                            <Input
                              type="date"
                              value={propertyForm.completionDate}
                              onChange={(e) => setPropertyForm({ ...propertyForm, completionDate: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Erwartete Rendite (%) *</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={propertyForm.expectedReturn}
                              onChange={(e) => setPropertyForm({ ...propertyForm, expectedReturn: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Mindestanzahlung (%) *</Label>
                            <Input
                              type="number"
                              value={propertyForm.minDownPayment}
                              onChange={(e) => setPropertyForm({ ...propertyForm, minDownPayment: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Max. Ratenlaufzeit (Monate) *</Label>
                            <Input
                              type="number"
                              value={propertyForm.maxInstallmentMonths}
                              onChange={(e) => setPropertyForm({ ...propertyForm, maxInstallmentMonths: parseInt(e.target.value) })}
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Hauptbild URL *</Label>
                            <Input
                              value={propertyForm.mainImage}
                              onChange={(e) => setPropertyForm({ ...propertyForm, mainImage: e.target.value })}
                              placeholder="https://example.com/hauptbild.jpg oder Google Drive Link"
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">URL zum Hauptbild der Immobilie (Google Drive, Dropbox oder direkter Link)</p>
                          </div>
                          <div className="col-span-2">
                            <Label>Weitere Bilder (URLs, kommagetrennt)</Label>
                            <Textarea
                              value={propertyForm.images}
                              onChange={(e) => setPropertyForm({ ...propertyForm, images: e.target.value })}
                              placeholder="https://example.com/bild1.jpg, https://example.com/bild2.jpg"
                              rows={2}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Mehrere Bild-URLs mit Komma trennen für die Galerie</p>
                          </div>
                          <div className="col-span-2">
                            <Label>Video URL (YouTube/Vimeo)</Label>
                            <Input
                              value={propertyForm.videoUrl}
                              onChange={(e) => setPropertyForm({ ...propertyForm, videoUrl: e.target.value })}
                              placeholder="https://www.youtube.com/watch?v=... oder https://vimeo.com/..."
                            />
                            <p className="text-xs text-muted-foreground mt-1">YouTube oder Vimeo Link zum Immobilien-Video</p>
                          </div>
                          <div className="col-span-2">
                            <Label>Ausstattung (kommagetrennt)</Label>
                            <Textarea
                              value={propertyForm.amenities}
                              onChange={(e) => setPropertyForm({ ...propertyForm, amenities: e.target.value })}
                              placeholder="Pool, Fitness, Concierge, Parkplatz, Meerblick, Balkon"
                              rows={2}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Ausstattungsmerkmale mit Komma trennen</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setShowPropertyDialog(false);
                              resetPropertyForm();
                            }}
                          >
                            Abbrechen
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-gold hover:bg-gold/90"
                            disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
                          >
                            {editingProperty ? "Aktualisieren" : "Hinzufügen"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gold" />
                  </div>
                ) : properties && properties.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titel</TableHead>
                        <TableHead>Stadt</TableHead>
                        <TableHead>Preis</TableHead>
                        <TableHead>Fläche</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property: any) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">{property.title}</TableCell>
                          <TableCell>{property.city}</TableCell>
                          <TableCell>{parseFloat(property.price).toLocaleString('de-DE')} €</TableCell>
                          <TableCell>{property.area} m²</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                property.status === "available"
                                  ? "bg-green-500/10 text-green-500"
                                  : property.status === "reserved"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-red-500/10 text-red-500"
                              }
                            >
                              {property.status === "available" ? "Verfügbar" : property.status === "reserved" ? "Reserviert" : "Verkauft"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditProperty(property)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Bearbeiten
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Noch keine Immobilien vorhanden
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dienstleistungen</CardTitle>
                    <CardDescription>
                      Verwalten Sie Ihre Dienstleistungsangebote
                    </CardDescription>
                  </div>
                  <Dialog open={showServiceDialog} onOpenChange={(open) => {
                    setShowServiceDialog(open);
                    if (!open) {
                      setEditingService(null);
                      setServiceForm({ name: "", description: "", price: "", category: "company_formation", isActive: true });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#C4A052] hover:bg-[#B08D3A]">
                        <Plus className="h-4 w-4 mr-2" />
                        Neue Dienstleistung
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingService ? "Dienstleistung bearbeiten" : "Neue Dienstleistung"}</DialogTitle>
                        <DialogDescription>
                          {editingService ? "Bearbeiten Sie die Dienstleistung" : "Fügen Sie eine neue Dienstleistung hinzu"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (editingService) {
                          updateServiceMutation.mutate({
                            id: editingService.id,
                            data: {
                              name: serviceForm.name,
                              description: serviceForm.description,
                              price: serviceForm.price,
                              isActive: serviceForm.isActive,
                            },
                          });
                        } else {
                          createServiceMutation.mutate({
                            name: serviceForm.name,
                            description: serviceForm.description,
                            price: serviceForm.price,
                            category: serviceForm.category,
                            isActive: serviceForm.isActive,
                          });
                        }
                      }} className="space-y-4">
                        <div>
                          <Label htmlFor="serviceName">Name</Label>
                          <Input
                            id="serviceName"
                            value={serviceForm.name}
                            onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="serviceDescription">Beschreibung</Label>
                          <Textarea
                            id="serviceDescription"
                            value={serviceForm.description}
                            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="servicePrice">Preis (€)</Label>
                          <Input
                            id="servicePrice"
                            type="number"
                            step="0.01"
                            value={serviceForm.price}
                            onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                            required
                          />
                        </div>
                        {!editingService && (
                          <div>
                            <Label htmlFor="serviceCategory">Kategorie</Label>
                            <Select
                              value={serviceForm.category}
                              onValueChange={(value) => setServiceForm({ ...serviceForm, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="company_formation">Firmengründung</SelectItem>
                                <SelectItem value="rental_guarantee">Mietgarantie</SelectItem>
                                <SelectItem value="property_management">Property Management</SelectItem>
                                <SelectItem value="legal_services">Rechtsberatung</SelectItem>
                                <SelectItem value="other">Sonstiges</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="serviceActive"
                            checked={serviceForm.isActive}
                            onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                          />
                          <Label htmlFor="serviceActive">Aktiv</Label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button type="button" variant="outline" onClick={() => setShowServiceDialog(false)}>
                            Abbrechen
                          </Button>
                          <Button type="submit" className="bg-[#C4A052] hover:bg-[#B08D3A]">
                            {editingService ? "Aktualisieren" : "Hinzufügen"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {servicesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gold" />
                  </div>
                ) : services && services.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Beschreibung</TableHead>
                        <TableHead>Preis</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service: any) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{service.description || "-"}</TableCell>
                          <TableCell>{parseFloat(service.price).toLocaleString('de-DE')} €</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {service.category === "company_formation" ? "Firmengründung" :
                               service.category === "rental_guarantee" ? "Mietgarantie" :
                               service.category === "property_management" ? "Property Management" :
                               service.category === "legal_services" ? "Rechtsberatung" : "Sonstiges"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={service.isActive ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                              {service.isActive ? "Aktiv" : "Inaktiv"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingService(service);
                                  setServiceForm({
                                    name: service.name,
                                    description: service.description || "",
                                    price: service.price,
                                    category: service.category,
                                    isActive: service.isActive,
                                  });
                                  setShowServiceDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                  if (confirm("Möchten Sie diese Dienstleistung wirklich löschen?")) {
                                    deleteServiceMutation.mutate({ id: service.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Noch keine Dienstleistungen vorhanden
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buchungsverwaltung</CardTitle>
                <CardDescription>
                  Übersicht aller Immobilienbuchungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gold" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Buchungs-ID</TableHead>
                        <TableHead>Benutzer-ID</TableHead>
                        <TableHead>Immobilien-ID</TableHead>
                        <TableHead>Gesamtbetrag</TableHead>
                        <TableHead>Anzahlung</TableHead>
                        <TableHead>Restbetrag</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking: any) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">#{booking.id}</TableCell>
                          <TableCell>{booking.userId}</TableCell>
                          <TableCell>{booking.propertyId || "-"}</TableCell>
                          <TableCell>{parseFloat(booking.totalAmount).toLocaleString('de-DE')} €</TableCell>
                          <TableCell>{parseFloat(booking.downPayment).toLocaleString('de-DE')} €</TableCell>
                          <TableCell>{parseFloat(booking.remainingAmount).toLocaleString('de-DE')} €</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                booking.status === "pending"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : booking.status === "confirmed"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : booking.status === "active"
                                  ? "bg-green-500/10 text-green-500"
                                  : booking.status === "completed"
                                  ? "bg-gray-500/10 text-gray-500"
                                  : "bg-red-500/10 text-red-500"
                              }
                            >
                              {booking.status === "pending" ? "Ausstehend" : 
                               booking.status === "confirmed" ? "Bestätigt" :
                               booking.status === "active" ? "Aktiv" :
                               booking.status === "completed" ? "Abgeschlossen" : "Storniert"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={booking.status}
                              onValueChange={(value: BookingStatus) => {
                                updateBookingStatusMutation.mutate({
                                  id: booking.id,
                                  status: value,
                                });
                              }}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Ausstehend</SelectItem>
                                <SelectItem value="confirmed">Bestätigt</SelectItem>
                                <SelectItem value="active">Aktiv</SelectItem>
                                <SelectItem value="completed">Abgeschlossen</SelectItem>
                                <SelectItem value="cancelled">Storniert</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Noch keine Buchungen vorhanden
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallets Tab */}
          <TabsContent value="wallets" className="space-y-6">
            {/* Pending Deposits Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-[#C4A052]" />
                      Einzahlungsanfragen
                    </CardTitle>
                    <CardDescription>
                      Offene Einzahlungen prüfen und bestätigen
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => calculateAllInterestMutation.mutate()}
                    disabled={calculateAllInterestMutation.isPending}
                    className="bg-[#C4A052] hover:bg-[#B39142]"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Zinsen berechnen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {depositsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#C4A052]" />
                  </div>
                ) : depositRequests && depositRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Benutzer</TableHead>
                        <TableHead>Betrag</TableHead>
                        <TableHead>Methode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {depositRequests.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell>#{request.id}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">User #{request.userId}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {parseFloat(request.amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {request.method === "bank_transfer" ? "Bank" : 
                               request.method === "crypto_btc" ? "Bitcoin" :
                               request.method === "crypto_eth" ? "Ethereum" :
                               request.method === "crypto_usdt" ? "USDT" : request.method}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              request.status === "completed" ? "bg-green-100 text-green-800" :
                              request.status === "cancelled" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {request.status === "pending" ? "Ausstehend" :
                               request.status === "completed" ? "Abgeschlossen" :
                               request.status === "cancelled" ? "Abgelehnt" : request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(request.createdAt).toLocaleDateString("de-DE")}
                          </TableCell>
                          <TableCell>
                            {request.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => approveDepositMutation.mutate({ requestId: request.id })}
                                  disabled={approveDepositMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedDepositId(request.id);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Einzahlungsanfragen vorhanden
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Wallets Card */}
            <Card>
              <CardHeader>
                <CardTitle>Alle Kunden-Wallets</CardTitle>
                <CardDescription>
                  Übersicht aller Wallet-Guthaben
                </CardDescription>
              </CardHeader>
              <CardContent>
                {walletsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#C4A052]" />
                  </div>
                ) : allWallets && allWallets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wallet ID</TableHead>
                        <TableHead>Benutzer</TableHead>
                        <TableHead>Guthaben</TableHead>
                        <TableHead>Bonus</TableHead>
                        <TableHead>Gesamt eingezahlt</TableHead>
                        <TableHead>7% Bonus</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allWallets.map((wallet: any) => (
                        <TableRow key={wallet.id}>
                          <TableCell>#{wallet.id}</TableCell>
                          <TableCell>User #{wallet.userId}</TableCell>
                          <TableCell className="font-medium">
                            {parseFloat(wallet.balance).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                          </TableCell>
                          <TableCell className="text-amber-600 font-medium">
                            {parseFloat(wallet.bonusBalance).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                          </TableCell>
                          <TableCell>
                            {parseFloat(wallet.totalDeposited).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                          </TableCell>
                          <TableCell>
                            {wallet.qualifiesForInterest ? (
                              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                            ) : (
                              <Badge variant="outline">Nicht qualifiziert</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              wallet.status === "active" ? "bg-green-100 text-green-800" :
                              wallet.status === "frozen" ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }>
                              {wallet.status === "active" ? "Aktiv" :
                               wallet.status === "frozen" ? "Eingefroren" : "Geschlossen"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedWalletId(wallet.id);
                                setShowWalletAdjustDialog(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Einzahlung
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Noch keine Wallets vorhanden
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reject Deposit Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Einzahlung ablehnen</DialogTitle>
                  <DialogDescription>
                    Geben Sie einen Grund für die Ablehnung an.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Grund</Label>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Grund für die Ablehnung..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                      Abbrechen
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (selectedDepositId && rejectReason) {
                          rejectDepositMutation.mutate({
                            requestId: selectedDepositId,
                            reason: rejectReason,
                          });
                        }
                      }}
                      disabled={!rejectReason || rejectDepositMutation.isPending}
                    >
                      Ablehnen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Manual Deposit Dialog */}
            <Dialog open={showWalletAdjustDialog} onOpenChange={setShowWalletAdjustDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manuelle Einzahlung</DialogTitle>
                  <DialogDescription>
                    Guthaben manuell zum Wallet hinzufügen.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Betrag (€)</Label>
                    <Input
                      type="number"
                      value={walletAdjustAmount}
                      onChange={(e) => setWalletAdjustAmount(e.target.value)}
                      placeholder="1000"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={walletAdjustReason}
                      onChange={(e) => setWalletAdjustReason(e.target.value)}
                      placeholder="Grund für die Einzahlung..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowWalletAdjustDialog(false)}>
                      Abbrechen
                    </Button>
                    <Button
                      onClick={() => {
                        const wallet = allWallets?.find((w: any) => w.id === selectedWalletId);
                        if (wallet && walletAdjustAmount) {
                          manualDepositMutation.mutate({
                            userId: wallet.userId,
                            amount: parseFloat(walletAdjustAmount),
                            method: "bank_transfer",
                            description: walletAdjustReason || "Manuelle Einzahlung durch Admin",
                          });
                        }
                      }}
                      disabled={!walletAdjustAmount || manualDepositMutation.isPending}
                      className="bg-[#C4A052] hover:bg-[#B39142]"
                    >
                      Einzahlen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
