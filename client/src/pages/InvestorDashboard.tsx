import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Package, CreditCard, FileText, LogOut, User, Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function InvestorDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Real backend queries
  const { data: bookings, isLoading: bookingsLoading } = trpc.bookings.getMyBookings.useQuery();
  const { data: payments, isLoading: paymentsLoading } = trpc.payments.getMyPayments.useQuery();
  const { data: walletData, isLoading: walletLoading } = trpc.wallet.get.useQuery();

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
              <LanguageSwitcher />
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

        {/* Wallet Overview Card */}
        <Card className="mb-8 bg-gradient-to-r from-[#C4A052]/10 to-[#C4A052]/5 border-[#C4A052]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#C4A052]/20 rounded-full">
                  <Wallet className="h-8 w-8 text-[#C4A052]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ihr Wallet-Guthaben</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-foreground">
                      {walletLoading ? "..." : parseFloat(walletData?.balance || "0").toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </span>
                    {walletData?.bonusBalance && parseFloat(walletData.bonusBalance) > 0 && (
                      <span className="text-lg text-[#C4A052] font-medium">
                        + {parseFloat(walletData.bonusBalance).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} Bonus
                      </span>
                    )}
                  </div>
                  {walletData?.qualifiesForInterest && (
                    <p className="text-xs text-green-600 mt-1">✓ 7% jährliche Verzinsung aktiv</p>
                  )}
                </div>
              </div>
              <Link href="/wallet">
                <Button className="bg-[#C4A052] hover:bg-[#B39142] text-white">
                  Zum Wallet
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="properties">Immobilien</TabsTrigger>
            <TabsTrigger value="contracts">Verträge</TabsTrigger>
            <TabsTrigger value="packages">Service-Pakete</TabsTrigger>
            <TabsTrigger value="payments">Zahlungen</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
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

          <TabsContent value="contracts">
            <ContractsSection userId={user.id} />
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

          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#C4A052]" />
                  Mein Wallet
                </CardTitle>
                <CardDescription>
                  Verwalten Sie Ihr Guthaben und sehen Sie Ihre Transaktionen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {walletLoading ? (
                  <p className="text-muted-foreground">Lade Wallet-Daten...</p>
                ) : (
                  <div className="space-y-6">
                    {/* Balance Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Verfügbares Guthaben</p>
                        <p className="text-2xl font-bold text-foreground">
                          {parseFloat(walletData?.balance || "0").toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                      <div className="p-4 bg-[#C4A052]/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Bonus-Guthaben (7% Zinsen)</p>
                        <p className="text-2xl font-bold text-[#C4A052]">
                          {parseFloat(walletData?.bonusBalance || "0").toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Gesamt eingezahlt</p>
                        <p className="text-2xl font-bold text-foreground">
                          {parseFloat(walletData?.totalDeposited || "0").toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>

                    {/* Interest Info */}
                    {walletData?.qualifiesForInterest ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-medium">✓ Sie erhalten 7% jährliche Verzinsung auf Ihr Guthaben</p>
                        <p className="text-sm text-green-600 mt-1">Die Zinsen werden täglich berechnet und als Bonus-Guthaben gutgeschrieben.</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-800 font-medium">Tipp: Zahlen Sie mindestens 10.000€ ein und erhalten Sie 7% jährliche Verzinsung!</p>
                        <p className="text-sm text-amber-600 mt-1">Die Zinsen werden als Bonus-Guthaben gutgeschrieben, das Sie für Einkäufe verwenden können.</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-center">
                      <Link href="/wallet">
                        <Button className="bg-[#C4A052] hover:bg-[#B39142] text-white">
                          Zur Wallet-Übersicht & Einzahlung
                        </Button>
                      </Link>
                    </div>
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

// Contracts Section Component
function ContractsSection({ userId }: { userId: number }) {
  const { data: contracts, isLoading } = trpc.contracts.myContracts.useQuery();

  const statusLabels: Record<string, string> = {
    draft: "Entwurf",
    pending_payment: "Warte auf Zahlung",
    active: "Aktiv",
    completed: "Abgeschlossen",
    withdrawal: "Widerrufen",
    cancelled: "Storniert",
    converted: "Umgewandelt",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    pending_payment: "bg-orange-100 text-orange-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    withdrawal: "bg-red-100 text-red-800",
    cancelled: "bg-red-100 text-red-800",
    converted: "bg-purple-100 text-purple-800",
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("de-DE");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A052] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verträge werden geladen...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meine Kaufverträge</CardTitle>
          <CardDescription>
            Übersicht aller Ihrer Immobilien-Kaufverträge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Sie haben noch keine Kaufverträge abgeschlossen
            </p>
            <Link href="/immobilien">
              <Button className="bg-[#C4A052] hover:bg-[#B39142]">
                <Building2 className="h-4 w-4 mr-2" />
                Immobilien entdecken
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meine Kaufverträge</CardTitle>
        <CardDescription>
          Übersicht aller Ihrer Immobilien-Kaufverträge ({contracts.length} Vertrag{contracts.length !== 1 ? "äge" : ""})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contracts.map((contract: any) => (
            <div
              key={contract.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-[#C4A052]/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-gray-500">
                      {contract.contractNumber}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[contract.status] || "bg-gray-100"}`}>
                      {statusLabels[contract.status] || contract.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {contract.propertyTitle}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {contract.propertyLocation}, {contract.propertyCity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#C4A052]">
                    {formatCurrency(contract.purchasePrice)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Anzahlung: {formatCurrency(contract.downPaymentAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>
                    <strong>Erstellt:</strong> {formatDate(contract.createdAt)}
                  </span>
                  {contract.paymentPlan === "installment" && (
                    <span>
                      <strong>Ratenzahlung:</strong> {contract.installmentMonths} Monate
                    </span>
                  )}
                  {contract.withdrawalDeadline && contract.status === "active" && (
                    <span className="text-orange-600">
                      <strong>Widerruf bis:</strong> {formatDate(contract.withdrawalDeadline)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {contract.contractPdfUrl && (
                    <a
                      href={contract.contractPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#C4A052] bg-[#C4A052]/10 rounded-md hover:bg-[#C4A052]/20 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      PDF herunterladen
                    </a>
                  )}
                </div>
              </div>

              {/* Withdrawal Info */}
              {contract.status === "withdrawal" && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Widerrufen am:</strong> {formatDate(contract.withdrawalRequestedAt)}
                  </p>
                  {contract.withdrawalReason && (
                    <p className="text-sm text-red-600 mt-1">
                      Grund: {contract.withdrawalReason}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Info for pending_payment */}
              {contract.status === "pending_payment" && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-700">
                    <strong>Anzahlung ausstehend:</strong> {formatCurrency(contract.downPaymentAmount)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Bitte zahlen Sie die Anzahlung über Ihr Wallet ein, um den Vertrag zu aktivieren.
                  </p>
                  <Link href="/wallet">
                    <Button size="sm" className="mt-2 bg-orange-500 hover:bg-orange-600">
                      <Wallet className="h-4 w-4 mr-1" />
                      Zur Wallet
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
