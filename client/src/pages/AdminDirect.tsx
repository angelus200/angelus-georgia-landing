import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";

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
