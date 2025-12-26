import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Building2,
  Package,
  Home,
} from "lucide-react";

// Generate or get session ID for anonymous carts
function getSessionId(): string {
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
}

export default function Cart() {
  const [, setLocation] = useLocation();
  const [sessionId] = useState(getSessionId);
  const utils = trpc.useUtils();

  const { data: user } = trpc.auth.me.useQuery();
  const { data: cartData, isLoading } = trpc.cart.get.useQuery({ sessionId });
  
  const removeItemMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Artikel entfernt");
    },
    onError: (error) => toast.error(error.message),
  });

  const clearCartMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Warenkorb geleert");
    },
    onError: (error) => toast.error(error.message),
  });

  const items = cartData?.items || [];
  const totalAmount = items.reduce((sum: number, item: any) => {
    return sum + parseFloat(item.unitPrice) * item.quantity;
  }, 0);

  const itemTypeLabels: Record<string, { label: string; icon: any }> = {
    property: { label: "Immobilie", icon: Building2 },
    service: { label: "Dienstleistung", icon: Package },
    package: { label: "Paket", icon: Package },
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error("Bitte melden Sie sich an, um fortzufahren");
      setLocation("/login?redirect=/warenkorb");
      return;
    }
    setLocation("/checkout");
  };

  if (isLoading) {
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
              <ShoppingCart className="w-5 h-5 text-[#C4A052]" />
              <span className="font-medium">Warenkorb</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ihr Warenkorb</h1>
          <p className="text-gray-600">
            {items.length === 0
              ? "Ihr Warenkorb ist leer"
              : `${items.length} Artikel im Warenkorb`}
          </p>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Ihr Warenkorb ist leer
              </h2>
              <p className="text-gray-600 mb-6">
                Entdecken Sie unsere Immobilien und Dienstleistungen
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/immobilien">
                  <Button className="bg-[#C4A052] hover:bg-[#B39142]">
                    <Building2 className="w-4 h-4 mr-2" />
                    Immobilien ansehen
                  </Button>
                </Link>
                <Link href="/service-pakete">
                  <Button variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    Dienstleistungen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any) => {
                const typeInfo = itemTypeLabels[item.itemType] || { label: item.itemType, icon: Package };
                const Icon = typeInfo.icon;
                const options = item.options ? JSON.parse(item.options) : {};

                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="p-4 bg-[#C4A052]/10 rounded-lg">
                          <Icon className="w-8 h-8 text-[#C4A052]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge variant="outline" className="mb-2">
                                {typeInfo.label}
                              </Badge>
                              <h3 className="font-semibold text-gray-900">
                                {options.name || `${typeInfo.label} #${item.propertyId || item.serviceId || item.packageId}`}
                              </h3>
                              {options.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {options.description}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeItemMutation.mutate({ cartItemId: item.id })}
                              disabled={removeItemMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Menge:</span>
                              <span className="font-medium">{item.quantity}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#C4A052]">
                                {(parseFloat(item.unitPrice) * item.quantity).toLocaleString("de-DE")} €
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm text-gray-500">
                                  {parseFloat(item.unitPrice).toLocaleString("de-DE")} € pro Stück
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="flex justify-between items-center pt-4">
                <Link href="/immobilien">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Weiter einkaufen
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    if (confirm("Warenkorb wirklich leeren?")) {
                      clearCartMutation.mutate({ sessionId });
                    }
                  }}
                  disabled={clearCartMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Warenkorb leeren
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Zusammenfassung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {items.map((item: any) => {
                      const options = item.options ? JSON.parse(item.options) : {};
                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 truncate max-w-[60%]">
                            {options.name || `Artikel #${item.id}`}
                          </span>
                          <span className="font-medium">
                            {(parseFloat(item.unitPrice) * item.quantity).toLocaleString("de-DE")} €
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Gesamtsumme</span>
                      <span className="text-[#C4A052]">
                        {totalAmount.toLocaleString("de-DE")} €
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      inkl. aller Gebühren
                    </p>
                  </div>

                  <Button
                    className="w-full bg-[#C4A052] hover:bg-[#B39142] py-6 text-lg"
                    onClick={handleProceedToCheckout}
                  >
                    Zur Kasse
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  {!user && (
                    <p className="text-sm text-center text-gray-500">
                      Sie müssen angemeldet sein, um fortzufahren
                    </p>
                  )}

                  <div className="text-center text-sm text-gray-500 pt-4 border-t">
                    <p>Sichere Zahlung mit</p>
                    <div className="flex justify-center gap-4 mt-2">
                      <span className="font-medium">Bitcoin</span>
                      <span className="font-medium">Ethereum</span>
                      <span className="font-medium">USDT</span>
                      <span className="font-medium">Bank</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
