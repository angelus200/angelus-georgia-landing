import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Package, CreditCard, FileText, LogOut, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function InvestorDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Real backend queries
  const { data: bookings, isLoading: bookingsLoading } = trpc.bookings.getMyBookings.useQuery();
  const { data: payments, isLoading: paymentsLoading } = trpc.payments.getMyPayments.useQuery();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
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
            <div className="flex items-center gap-4">
              <Link href="/profil">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gold" />
                  <span className="font-medium">{user.name || user.email}</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Investor Dashboard</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Immobilieninvestitionen und Service-Pakete
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktive Investments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {bookings?.filter((b: any) => b.status === "active").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Offene Zahlungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {payments?.filter((p: any) => p.status === "pending").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gesamtinvestition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">
                {bookings?.reduce((sum: number, b: any) => sum + parseFloat(b.totalAmount), 0).toLocaleString('de-DE')} €
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nächste Zahlung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {payments?.find((p: any) => p.status === "pending")
                  ? new Date(payments.find((p: any) => p.status === "pending")!.dueDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
                  : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="properties">Immobilien</TabsTrigger>
            <TabsTrigger value="packages">Service-Pakete</TabsTrigger>
            <TabsTrigger value="payments">Zahlungen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Willkommen zurück, {user.name?.split(' ')[0] || 'Investor'}!</CardTitle>
                <CardDescription>
                  Hier ist eine Übersicht Ihrer aktuellen Investments und anstehenden Aktivitäten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <p className="text-muted-foreground">Lade Daten...</p>
                ) : bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gold/10 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-gold" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              Buchung #{booking.id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Status: {booking.status === "active" ? "Aktiv" : booking.status === "pending" ? "Ausstehend" : "Abgeschlossen"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {parseFloat(booking.totalAmount).toLocaleString('de-DE')} €
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Noch offen: {parseFloat(booking.remainingAmount).toLocaleString('de-DE')} €
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Noch keine Investments
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Entdecken Sie unsere Immobilienangebote und starten Sie Ihr erstes Investment.
                    </p>
                    <Link href="/immobilien">
                      <Button>
                        <Building2 className="h-4 w-4 mr-2" />
                        Immobilien entdecken
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/immobilien">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Building2 className="h-8 w-8 text-gold mb-2" />
                    <CardTitle className="text-lg">Immobilien durchsuchen</CardTitle>
                    <CardDescription>
                      Entdecken Sie verfügbare Immobilien in Georgien
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/pakete">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Package className="h-8 w-8 text-gold mb-2" />
                    <CardTitle className="text-lg">Service-Pakete</CardTitle>
                    <CardDescription>
                      Firmengründung, Verwaltung und mehr
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <FileText className="h-8 w-8 text-gold mb-2" />
                  <CardTitle className="text-lg">Dokumente</CardTitle>
                  <CardDescription>
                    Verträge, Rechnungen und Berichte
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Meine Immobilien</CardTitle>
                <CardDescription>
                  Übersicht aller Immobilieninvestments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Noch keine Immobilien gekauft
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <CardTitle>Meine Service-Pakete</CardTitle>
                <CardDescription>
                  Gebuchte Dienstleistungen und Pakete
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Noch keine Service-Pakete gebucht
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Zahlungsübersicht</CardTitle>
                <CardDescription>
                  Alle Zahlungen und Ratenpläne
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <p className="text-muted-foreground">Lade Zahlungen...</p>
                ) : payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                            payment.status === "paid" ? "bg-green-500/10" :
                            payment.status === "overdue" ? "bg-red-500/10" :
                            "bg-yellow-500/10"
                          }`}>
                            <CreditCard className={`h-6 w-6 ${
                              payment.status === "paid" ? "text-green-500" :
                              payment.status === "overdue" ? "text-red-500" :
                              "text-yellow-500"
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {parseFloat(payment.amount).toLocaleString('de-DE')} €
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Fällig: {new Date(payment.dueDate).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>
                        <div>
                          {payment.status === "paid" ? (
                            <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                              Bezahlt
                            </span>
                          ) : payment.status === "overdue" ? (
                            <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium">
                              Überfällig
                            </span>
                          ) : (
                            <Button size="sm">Jetzt bezahlen</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Keine Zahlungen vorhanden
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
