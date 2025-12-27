import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Home,
  ShoppingBag,
  Eye,
  Bitcoin,
  Building,
  Wallet,
  CreditCard,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function MyOrders() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: orders, isLoading: ordersLoading } = trpc.orders.getMyOrders.useQuery(undefined, {
    enabled: !!user,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      toast.error("Bitte melden Sie sich an");
      setLocation("/login?redirect=/meine-bestellungen");
    }
  }, [user, userLoading, setLocation]);

  const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Ausstehend", color: "bg-gray-100 text-gray-800", icon: Clock },
    awaiting_payment: { label: "Warte auf Zahlung", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    payment_received: { label: "Zahlung erhalten", color: "bg-green-100 text-green-800", icon: CheckCircle },
    processing: { label: "In Bearbeitung", color: "bg-blue-100 text-blue-800", icon: Package },
    completed: { label: "Abgeschlossen", color: "bg-green-200 text-green-900", icon: CheckCircle },
    cancelled: { label: "Storniert", color: "bg-red-100 text-red-800", icon: XCircle },
    refunded: { label: "Erstattet", color: "bg-purple-100 text-purple-800", icon: XCircle },
  };

  const paymentMethodLabels: Record<string, { name: string; icon: any }> = {
    crypto_btc: { name: "Bitcoin", icon: Bitcoin },
    crypto_eth: { name: "Ethereum", icon: Wallet },
    crypto_usdt: { name: "USDT", icon: Wallet },
    bank_transfer: { name: "Banküberweisung", icon: Building },
    card: { name: "Kreditkarte", icon: CreditCard },
  };

  if (userLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#C4A052] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5 text-[#C4A052]" />
              <span className="font-semibold text-gray-900">Angelus Management</span>
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <ShoppingBag className="w-5 h-5 text-[#C4A052]" />
              <span className="font-medium">Meine Bestellungen</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meine Bestellungen</h1>
          <p className="text-gray-600">
            Übersicht über alle Ihre Bestellungen
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Keine Bestellungen
              </h2>
              <p className="text-gray-600 mb-6">
                Sie haben noch keine Bestellungen aufgegeben.
              </p>
              <Link href="/immobilien">
                <Button className="bg-[#C4A052] hover:bg-[#B39142]">
                  Immobilien entdecken
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const statusInfo = statusLabels[order.status] || statusLabels.pending;
              const StatusIcon = statusInfo.icon;
              const paymentInfo = paymentMethodLabels[order.paymentMethod || ""] || { name: "Unbekannt", icon: Package };
              const PaymentIcon = paymentInfo.icon;

              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 font-mono">
                            {order.orderNumber}
                          </h3>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <PaymentIcon className="w-4 h-4" />
                            {paymentInfo.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#C4A052]">
                            {parseFloat(order.totalAmount).toLocaleString("de-DE")} €
                          </p>
                        </div>
                        <Link href={`/bestellung/${order.orderNumber}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link href="/dashboard">
            <Button variant="outline">
              Zum Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
