import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";

// Geheimer Token für Direktzugang - NUR FÜR AUTORISIERTE PERSONEN
const SECRET_TOKEN = "2668814910efd2c52b1633d6ef0e6f569b5e3a7dd535884a8c674a936abe3d5a";

export default function AdminDirect() {
  const params = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.token === SECRET_TOKEN) {
      setIsAuthorized(true);
      localStorage.setItem("admin_direct_access", "true");
      localStorage.setItem("admin_direct_token", params.token);
    } else {
      setLocation("/admin/login");
    }
    setIsLoading(false);
  }, [params.token, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C4A052] mx-auto mb-4"></div>
          <p className="text-gray-600">Zugang wird überprüft...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <AdminDirectDashboard />;
}

// Property Form Modal
function PropertyFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  property 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: any) => void; 
  property?: any;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    imageUrl: "",
    status: "available",
    propertyType: "apartment",
    features: "",
    yearBuilt: "",
    expectedReturn: "",
  });

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        location: property.location || "",
        price: property.price?.toString() || "",
        size: property.size?.toString() || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        imageUrl: property.imageUrl || "",
        status: property.status || "available",
        propertyType: property.propertyType || "apartment",
        features: property.features || "",
        yearBuilt: property.yearBuilt?.toString() || "",
        expectedReturn: property.expectedReturn?.toString() || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        location: "",
        price: "",
        size: "",
        bedrooms: "",
        bathrooms: "",
        imageUrl: "",
        status: "available",
        propertyType: "apartment",
        features: "",
        yearBuilt: "",
        expectedReturn: "",
      });
    }
  }, [property, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price) || 0,
      size: parseFloat(formData.size) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      yearBuilt: parseInt(formData.yearBuilt) || null,
      expectedReturn: parseFloat(formData.expectedReturn) || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {property ? "Immobilie bearbeiten" : "Neue Immobilie erstellen"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="z.B. Luxus-Apartment in Batumi"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                placeholder="Detaillierte Beschreibung der Immobilie..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standort *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="z.B. Batumi, Georgien"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preis (€) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="z.B. 150000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Größe (m²)</label>
              <input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="z.B. 85"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schlafzimmer</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="z.B. 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badezimmer</label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="z.B. 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Baujahr</label>
              <input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="z.B. 2023"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Erwartete Rendite (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.expectedReturn}
                onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="z.B. 8.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Immobilientyp</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="apartment">Apartment</option>
                <option value="house">Haus</option>
                <option value="commercial">Gewerbe</option>
                <option value="land">Grundstück</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="available">Verfügbar</option>
                <option value="reserved">Reserviert</option>
                <option value="sold">Verkauft</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bild-URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (kommagetrennt)</label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="z.B. Meerblick, Balkon, Klimaanlage"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#C4A052] rounded-md hover:bg-[#B08D3A]"
            >
              {property ? "Speichern" : "Erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Separates Admin-Dashboard ohne Auth-Check
function AdminDirectDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("contacts");
  const [contacts, setContacts] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Daten laden
  const loadData = async () => {
    try {
      const contactsRes = await fetch("/api/trpc/contacts.list?input={}");
      if (contactsRes.ok) {
        const data = await contactsRes.json();
        const contactsData = data.result?.data?.json || data.result?.data || [];
        setContacts(Array.isArray(contactsData) ? contactsData : []);
      }
      
      const propertiesRes = await fetch("/api/trpc/properties.list?input={}");
      if (propertiesRes.ok) {
        const data = await propertiesRes.json();
        const propertiesData = data.result?.data?.json || data.result?.data || [];
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      }
      
      const bookingsRes = await fetch("/api/trpc/bookings.list?input={}");
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        const bookingsData = data.result?.data?.json || data.result?.data || [];
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Property erstellen/bearbeiten
  const handleSaveProperty = async (propertyData: any) => {
    setIsSaving(true);
    try {
      const endpoint = editingProperty 
        ? "/api/trpc/properties.update" 
        : "/api/trpc/properties.create";
      
      const body = editingProperty 
        ? { id: editingProperty.id, ...propertyData }
        : propertyData;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await loadData();
        setShowPropertyModal(false);
        setEditingProperty(null);
        alert(editingProperty ? "Immobilie aktualisiert!" : "Immobilie erstellt!");
      } else {
        alert("Fehler beim Speichern");
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  // Property löschen
  const handleDeleteProperty = async (id: number) => {
    if (!confirm("Möchten Sie diese Immobilie wirklich löschen?")) return;
    
    try {
      const res = await fetch("/api/trpc/properties.delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        await loadData();
        alert("Immobilie gelöscht!");
      } else {
        alert("Fehler beim Löschen");
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Löschen");
    }
  };

  // Kontakt-Status ändern
  const handleUpdateContactStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/trpc/contacts.updateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Fehler beim Aktualisieren");
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  // Buchung-Status ändern
  const handleUpdateBookingStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/trpc/bookings.updateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Fehler beim Aktualisieren");
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  const filteredContacts = statusFilter === "all" 
    ? contacts 
    : contacts.filter(c => c.status === statusFilter);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Direktzugang aktiv</span>
            <button 
              onClick={() => setLocation("/")}
              className="text-sm text-[#C4A052] hover:underline"
            >
              Zur Startseite
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "contacts" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Kontaktanfragen ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "properties" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Immobilien ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "bookings" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Buchungen ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("ecommerce")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "ecommerce" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            E-Commerce
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "orders" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Bestellungen
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A052] mx-auto mb-4"></div>
              <p className="text-gray-600">Daten werden geladen...</p>
            </div>
          ) : (
            <>
              {/* Kontaktanfragen Tab */}
              {activeTab === "contacts" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Kontaktanfragen</h2>
                      <p className="text-sm text-gray-600">Verwalten Sie eingehende Kontaktanfragen</p>
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">Alle Status</option>
                      <option value="new">Neu</option>
                      <option value="in_progress">In Bearbeitung</option>
                      <option value="completed">Abgeschlossen</option>
                    </select>
                  </div>
                  
                  {filteredContacts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Keine Anfragen gefunden</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredContacts.map((contact: any) => (
                        <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{contact.name}</h3>
                              <p className="text-sm text-gray-600">{contact.email}</p>
                              {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                            </div>
                            <select
                              value={contact.status}
                              onChange={(e) => handleUpdateContactStatus(contact.id, e.target.value)}
                              className={`px-2 py-1 text-xs rounded-md border ${
                                contact.status === "new" ? "bg-blue-50 border-blue-200 text-blue-800" :
                                contact.status === "in_progress" ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
                                "bg-green-50 border-green-200 text-green-800"
                              }`}
                            >
                              <option value="new">Neu</option>
                              <option value="in_progress">In Bearbeitung</option>
                              <option value="completed">Abgeschlossen</option>
                            </select>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{contact.message}</p>
                          <p className="mt-2 text-xs text-gray-400">
                            {new Date(contact.createdAt).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Immobilien Tab */}
              {activeTab === "properties" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Immobilien</h2>
                      <p className="text-sm text-gray-600">Verwalten Sie Ihre Immobilienangebote</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProperty(null);
                        setShowPropertyModal(true);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#C4A052] rounded-md hover:bg-[#B08D3A]"
                    >
                      + Neue Immobilie
                    </button>
                  </div>
                  
                  {properties.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">Keine Immobilien gefunden</p>
                      <button
                        onClick={() => {
                          setEditingProperty(null);
                          setShowPropertyModal(true);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#C4A052] rounded-md hover:bg-[#B08D3A]"
                      >
                        Erste Immobilie erstellen
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {properties.map((property: any) => (
                        <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {property.imageUrl ? (
                            <img 
                              src={property.imageUrl} 
                              alt={property.title}
                              className="w-full h-40 object-cover"
                            />
                          ) : (
                            <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                              Kein Bild
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-gray-900">{property.title}</h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                property.status === "available" ? "bg-green-100 text-green-800" :
                                property.status === "reserved" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {property.status === "available" ? "Verfügbar" :
                                 property.status === "reserved" ? "Reserviert" : "Verkauft"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{property.location}</p>
                            <p className="mt-2 text-lg font-semibold text-[#C4A052]">
                              {property.price?.toLocaleString("de-DE")} €
                            </p>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => {
                                  setEditingProperty(property);
                                  setShowPropertyModal(true);
                                }}
                                className="flex-1 px-3 py-1.5 text-xs font-medium text-[#C4A052] border border-[#C4A052] rounded hover:bg-[#C4A052]/10"
                              >
                                Bearbeiten
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(property.id)}
                                className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50"
                              >
                                Löschen
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Buchungen Tab */}
              {activeTab === "bookings" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Buchungen</h2>
                      <p className="text-sm text-gray-600">Verwalten Sie Service-Buchungen</p>
                    </div>
                  </div>
                  
                  {bookings.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Keine Buchungen gefunden</p>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking: any) => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{booking.serviceName}</h3>
                              <p className="text-sm text-gray-600">{booking.customerName}</p>
                              <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                            </div>
                            <select
                              value={booking.status}
                              onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                              className={`px-2 py-1 text-xs rounded-md border ${
                                booking.status === "pending" ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
                                booking.status === "confirmed" ? "bg-green-50 border-green-200 text-green-800" :
                                "bg-red-50 border-red-200 text-red-800"
                              }`}
                            >
                              <option value="pending">Ausstehend</option>
                              <option value="confirmed">Bestätigt</option>
                              <option value="cancelled">Storniert</option>
                            </select>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">
                            {new Date(booking.createdAt).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* E-Commerce Tab */}
              {activeTab === "ecommerce" && (
                <ECommerceTab />
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <OrdersTab />
              )}
            </>
          )}
        </div>
      </main>

      {/* Property Modal */}
      <PropertyFormModal
        isOpen={showPropertyModal}
        onClose={() => {
          setShowPropertyModal(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        property={editingProperty}
      />
    </div>
  );
}


// E-Commerce Tab Component
function ECommerceTab() {
  const [services, setServices] = useState<any[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("services");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const loadData = async () => {
    try {
      const servicesRes = await fetch("/api/trpc/services.list?input={}");
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.result?.data?.json || data.result?.data || []);
      }

      const walletsRes = await fetch("/api/trpc/payment.getCryptoWallets?input={}");
      if (walletsRes.ok) {
        const data = await walletsRes.json();
        setCryptoWallets(data.result?.data?.json || data.result?.data || []);
      }

      const banksRes = await fetch("/api/trpc/payment.getBankAccounts?input={}");
      if (banksRes.ok) {
        const data = await banksRes.json();
        setBankAccounts(data.result?.data?.json || data.result?.data || []);
      }
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveService = async (data: any) => {
    try {
      const endpoint = editingItem ? "/api/trpc/services.update" : "/api/trpc/services.create";
      const body = editingItem ? { json: { id: editingItem.id, data } } : { json: data };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await loadData();
        setShowServiceModal(false);
        setEditingItem(null);
      } else {
        const err = await res.json();
        console.error("API Fehler:", err);
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  const handleSaveWallet = async (data: any) => {
    try {
      const endpoint = editingItem ? "/api/trpc/payment.updateCryptoWallet" : "/api/trpc/payment.createCryptoWallet";
      const body = editingItem ? { json: { id: editingItem.id, data } } : { json: data };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await loadData();
        setShowWalletModal(false);
        setEditingItem(null);
      } else {
        const err = await res.json();
        console.error("API Fehler:", err);
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  const handleSaveBank = async (data: any) => {
    try {
      const endpoint = editingItem ? "/api/trpc/payment.updateBankAccount" : "/api/trpc/payment.createBankAccount";
      const body = editingItem ? { json: { id: editingItem.id, data } } : { json: data };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await loadData();
        setShowBankModal(false);
        setEditingItem(null);
      } else {
        const err = await res.json();
        console.error("API Fehler:", err);
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Dienstleistung wirklich löschen?")) return;
    try {
      await fetch("/api/trpc/services.delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await loadData();
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A052] mx-auto mb-4"></div>
        <p className="text-gray-600">Daten werden geladen...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">E-Commerce Verwaltung</h2>
          <p className="text-sm text-gray-600">Verwalten Sie Dienstleistungen, Krypto-Wallets und Bankkonten</p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab("services")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === "services" 
              ? "border-[#C4A052] text-[#C4A052]" 
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Dienstleistungen ({services.length})
        </button>
        <button
          onClick={() => setActiveSubTab("wallets")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === "wallets" 
              ? "border-[#C4A052] text-[#C4A052]" 
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Krypto-Wallets ({cryptoWallets.length})
        </button>
        <button
          onClick={() => setActiveSubTab("banks")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === "banks" 
              ? "border-[#C4A052] text-[#C4A052]" 
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Bankkonten ({bankAccounts.length})
        </button>
      </div>

      {/* Services */}
      {activeSubTab === "services" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingItem(null); setShowServiceModal(true); }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C4A052] rounded-md hover:bg-[#B08D3A]"
            >
              + Neue Dienstleistung
            </button>
          </div>
          {services.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Keine Dienstleistungen angelegt</p>
          ) : (
            <div className="space-y-4">
              {services.map((service: any) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <p className="text-sm font-semibold text-[#C4A052] mt-1">
                        {parseFloat(service.price).toLocaleString("de-DE")} €
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 rounded">
                        {service.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingItem(service); setShowServiceModal(true); }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Crypto Wallets */}
      {activeSubTab === "wallets" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingItem(null); setShowWalletModal(true); }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C4A052] rounded-md hover:bg-[#B08D3A]"
            >
              + Neues Wallet
            </button>
          </div>
          {cryptoWallets.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Keine Krypto-Wallets angelegt</p>
          ) : (
            <div className="space-y-4">
              {cryptoWallets.map((wallet: any) => (
                <div key={wallet.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{wallet.currency}</h3>
                      <p className="text-sm text-gray-600 font-mono break-all">{wallet.address}</p>
                      {wallet.label && <p className="text-sm text-gray-500 mt-1">{wallet.label}</p>}
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        wallet.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {wallet.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </div>
                    <button
                      onClick={() => { setEditingItem(wallet); setShowWalletModal(true); }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bank Accounts */}
      {activeSubTab === "banks" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingItem(null); setShowBankModal(true); }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C4A052] rounded-md hover:bg-[#B08D3A]"
            >
              + Neues Bankkonto
            </button>
          </div>
          {bankAccounts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Keine Bankkonten angelegt</p>
          ) : (
            <div className="space-y-4">
              {bankAccounts.map((bank: any) => (
                <div key={bank.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{bank.bankName}</h3>
                      <p className="text-sm text-gray-600">IBAN: {bank.iban}</p>
                      <p className="text-sm text-gray-600">BIC: {bank.bic}</p>
                      <p className="text-sm text-gray-600">Inhaber: {bank.accountHolder}</p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        bank.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {bank.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </div>
                    <button
                      onClick={() => { setEditingItem(bank); setShowBankModal(true); }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <ServiceFormModal
          isOpen={showServiceModal}
          onClose={() => { setShowServiceModal(false); setEditingItem(null); }}
          onSave={handleSaveService}
          service={editingItem}
        />
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <WalletFormModal
          isOpen={showWalletModal}
          onClose={() => { setShowWalletModal(false); setEditingItem(null); }}
          onSave={handleSaveWallet}
          wallet={editingItem}
        />
      )}

      {/* Bank Modal */}
      {showBankModal && (
        <BankFormModal
          isOpen={showBankModal}
          onClose={() => { setShowBankModal(false); setEditingItem(null); }}
          onSave={handleSaveBank}
          bank={editingItem}
        />
      )}
    </div>
  );
}

// Service Form Modal
function ServiceFormModal({ isOpen, onClose, onSave, service }: any) {
  const [formData, setFormData] = useState({
    name: service?.name || "",
    description: service?.description || "",
    price: service?.price || "",
    category: service?.category || "company_formation",
    isActive: service?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {service ? "Dienstleistung bearbeiten" : "Neue Dienstleistung"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preis (€)</label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="company_formation">Firmengründung</option>
              <option value="rental_guarantee">Mietgarantie</option>
              <option value="property_management">Property Management</option>
              <option value="legal_services">Rechtsberatung</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Aktiv</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md">
              Abbrechen
            </button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-[#C4A052] rounded-md">
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Wallet Form Modal
function WalletFormModal({ isOpen, onClose, onSave, wallet }: any) {
  const [formData, setFormData] = useState({
    currency: wallet?.currency || "BTC",
    address: wallet?.address || "",
    label: wallet?.label || "",
    isActive: wallet?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {wallet ? "Wallet bearbeiten" : "Neues Wallet"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Währung</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">USDT (Tether)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wallet-Adresse</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bezeichnung (optional)</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="walletActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="walletActive" className="text-sm text-gray-700">Aktiv</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md">
              Abbrechen
            </button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-[#C4A052] rounded-md">
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Bank Form Modal
function BankFormModal({ isOpen, onClose, onSave, bank }: any) {
  const [formData, setFormData] = useState({
    bankName: bank?.bankName || "",
    accountHolder: bank?.accountHolder || "",
    iban: bank?.iban || "",
    bic: bank?.bic || "",
    currency: bank?.currency || "EUR",
    isActive: bank?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {bank ? "Bankkonto bearbeiten" : "Neues Bankkonto"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bankname</label>
            <input
              type="text"
              required
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kontoinhaber</label>
            <input
              type="text"
              required
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
            <input
              type="text"
              required
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BIC/SWIFT</label>
            <input
              type="text"
              required
              value={formData.bic}
              onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Währung</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">US-Dollar (USD)</option>
              <option value="GEL">Georgischer Lari (GEL)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bankActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="bankActive" className="text-sm text-gray-700">Aktiv</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md">
              Abbrechen
            </button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-[#C4A052] rounded-md">
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Orders Tab Component
function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/trpc/orders.list?input={}");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.result?.data?.json || data.result?.data || []);
      }
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await fetch("/api/trpc/orders.updateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await loadOrders();
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A052] mx-auto mb-4"></div>
        <p className="text-gray-600">Bestellungen werden geladen...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Bestellungen</h2>
          <p className="text-sm text-gray-600">Verwalten Sie alle Kundenbestellungen</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">Alle Status</option>
          <option value="pending">Ausstehend</option>
          <option value="confirmed">Bestätigt</option>
          <option value="paid">Bezahlt</option>
          <option value="completed">Abgeschlossen</option>
          <option value="cancelled">Storniert</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Keine Bestellungen gefunden</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Bestellung #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {order.customerEmail || "Gast-Bestellung"}
                  </p>
                  <p className="text-lg font-semibold text-[#C4A052] mt-1">
                    {parseFloat(order.totalAmount).toLocaleString("de-DE")} €
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Zahlungsmethode: {order.paymentMethod === "bank_transfer" ? "Banküberweisung" : order.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className={`px-2 py-1 text-xs rounded-md border ${
                      order.status === "pending" ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
                      order.status === "confirmed" ? "bg-blue-50 border-blue-200 text-blue-800" :
                      order.status === "paid" ? "bg-green-50 border-green-200 text-green-800" :
                      order.status === "completed" ? "bg-green-100 border-green-300 text-green-900" :
                      "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    <option value="pending">Ausstehend</option>
                    <option value="confirmed">Bestätigt</option>
                    <option value="paid">Bezahlt</option>
                    <option value="completed">Abgeschlossen</option>
                    <option value="cancelled">Storniert</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(order.createdAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
