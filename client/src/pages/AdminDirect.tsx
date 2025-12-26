import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import Admin from "./Admin";

// Geheimer Token für Direktzugang - NUR FÜR AUTORISIERTE PERSONEN
const SECRET_TOKEN = "2668814910efd2c52b1633d6ef0e6f569b5e3a7dd535884a8c674a936abe3d5a";

export default function AdminDirect() {
  const params = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prüfen ob der Token korrekt ist
    if (params.token === SECRET_TOKEN) {
      // Token ist korrekt - Zugang gewähren
      setIsAuthorized(true);
      // Session-Flag im localStorage setzen für zukünftige Besuche
      localStorage.setItem("admin_direct_access", "true");
      localStorage.setItem("admin_direct_token", params.token);
    } else {
      // Ungültiger Token - zur Login-Seite weiterleiten
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

  // Direkter Zugang zum Admin-Dashboard ohne Authentifizierungsprüfung
  return <AdminDirectDashboard />;
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

  // Daten laden
  useEffect(() => {
    const loadData = async () => {
      try {
        // Kontakte laden
        const contactsRes = await fetch("/api/trpc/contacts.list?input={}");
        if (contactsRes.ok) {
          const data = await contactsRes.json();
          // TRPC gibt result.data.json zurück
          const contactsData = data.result?.data?.json || data.result?.data || [];
          setContacts(Array.isArray(contactsData) ? contactsData : []);
        }
        
        // Immobilien laden
        const propertiesRes = await fetch("/api/trpc/properties.list?input={}");
        if (propertiesRes.ok) {
          const data = await propertiesRes.json();
          const propertiesData = data.result?.data?.json || data.result?.data || [];
          setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        }
        
        // Buchungen laden
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
    
    loadData();
  }, []);

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
            Kontaktanfragen
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "properties" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Immobilien
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "bookings" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Buchungen
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
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              contact.status === "new" ? "bg-blue-100 text-blue-800" :
                              contact.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {contact.status === "new" ? "Neu" :
                               contact.status === "in_progress" ? "In Bearbeitung" : "Abgeschlossen"}
                            </span>
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
                  </div>
                  
                  {properties.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Keine Immobilien gefunden</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {properties.map((property: any) => (
                        <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {property.imageUrl && (
                            <img 
                              src={property.imageUrl} 
                              alt={property.title}
                              className="w-full h-40 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900">{property.title}</h3>
                            <p className="text-sm text-gray-600">{property.location}</p>
                            <p className="mt-2 text-lg font-semibold text-[#C4A052]">
                              {property.price?.toLocaleString("de-DE")} €
                            </p>
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
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {booking.status === "pending" ? "Ausstehend" :
                               booking.status === "confirmed" ? "Bestätigt" : "Storniert"}
                            </span>
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
    </div>
  );
}
