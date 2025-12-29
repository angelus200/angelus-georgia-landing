import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Bitcoin,
  Building,
  CreditCard,
  Copy,
  CheckCircle,
  Home,
  Wallet,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function getSessionId(): string {
  return localStorage.getItem("cart_session_id") || "";
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [sessionId] = useState(getSessionId);
  const [paymentMethod, setPaymentMethod] = useState<string>("crypto_btc");
  const [billingAddress, setBillingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: cartData, isLoading: cartLoading } = trpc.cart.get.useQuery({ sessionId });
  const { data: cryptoWallets } = trpc.payment.getCryptoWallets.useQuery();
  const { data: bankAccounts } = trpc.payment.getBankAccounts.useQuery();

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      // Clear cart after successful order
      localStorage.removeItem("cart_session_id");
      toast.success("Bestellung erfolgreich erstellt!");
      setLocation(`/bestellung/${data.orderNumber}`);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const items = cartData?.items || [];
  const totalAmount = items.reduce((sum: number, item: any) => {
    return sum + parseFloat(item.unitPrice) * item.quantity;
  }, 0);

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      toast.error("Bitte melden Sie sich an");
      setLocation("/login?redirect=/checkout");
    }
  }, [user, userLoading, setLocation]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      toast.error("Ihr Warenkorb ist leer");
      setLocation("/warenkorb");
    }
  }, [cartLoading, items, setLocation]);

  const handleSubmitOrder = async () => {
    if (!paymentMethod) {
      toast.error("Bitte wählen Sie eine Zahlungsmethode");
      return;
    }

    setIsSubmitting(true);

    const orderItems = items.map((item: any) => {
      const options = item.options ? JSON.parse(item.options) : {};
      return {
        itemType: item.itemType as "property" | "service" | "package",
        propertyId: item.propertyId || undefined,
        serviceId: item.serviceId || undefined,
        packageId: item.packageId || undefined,
        itemName: options.name || `${item.itemType} #${item.propertyId || item.serviceId || item.packageId}`,
        itemDescription: options.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        options: item.options,
      };
    });

    createOrderMutation.mutate({
      items: orderItems,
      totalAmount: totalAmount.toString(),
      paymentMethod: paymentMethod as any,
      billingAddress: billingAddress || undefined,
      notes: notes || undefined,
    });
  };

  // Wallet data for payment
  const { data: walletData } = trpc.wallet.get.useQuery(undefined, {
    enabled: !!user,
  });

  const walletBalance = parseFloat(walletData?.balance || "0");
  const walletBonusBalance = parseFloat(walletData?.bonusBalance || "0");
  const totalWalletBalance = walletBalance + walletBonusBalance;
  const canPayWithWallet = totalWalletBalance >= totalAmount;

  const paymentMethods = [
    { 
      id: "wallet", 
      name: "Wallet-Guthaben", 
      icon: Wallet, 
      description: canPayWithWallet 
        ? `Verfügbar: ${totalWalletBalance.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}` 
        : `Nicht genug Guthaben (${totalWalletBalance.toLocaleString("de-DE", { style: "currency", currency: "EUR" })})`,
      disabled: !canPayWithWallet
    },
    { id: "crypto_btc", name: "Bitcoin (BTC)", icon: Bitcoin, description: "Zahlung mit Bitcoin" },
    { id: "crypto_eth", name: "Ethereum (ETH)", icon: Wallet, description: "Zahlung mit Ethereum" },
    { id: "crypto_usdt", name: "USDT (Tether)", icon: Wallet, description: "Zahlung mit USDT Stablecoin" },
    { id: "bank_transfer", name: "Banküberweisung", icon: Building, description: "Klassische Banküberweisung" },
  ];

  if (userLoading || cartLoading) {
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
              <CreditCard className="w-5 h-5 text-[#C4A052]" />
              <span className="font-medium">Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/warenkorb" className="text-[#C4A052] hover:underline flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Warenkorb
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Schließen Sie Ihre Bestellung ab</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C4A052]" />
                  Zahlungsmethode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="grid gap-4">
                    {paymentMethods.map((method: any) => {
                      const Icon = method.icon;
                      const isDisabled = method.disabled || false;
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${
                            isDisabled 
                              ? "opacity-50 cursor-not-allowed bg-gray-50"
                              : "cursor-pointer"
                          } ${
                            paymentMethod === method.id && !isDisabled
                              ? "border-[#C4A052] bg-[#C4A052]/5"
                              : "border-gray-200 hover:border-[#C4A052]/50"
                          }`}
                        >
                          <RadioGroupItem value={method.id} disabled={isDisabled} />
                          <div className={`p-2 rounded-lg ${isDisabled ? "bg-gray-200" : "bg-[#C4A052]/10"}`}>
                            <Icon className={`w-6 h-6 ${isDisabled ? "text-gray-400" : "text-[#C4A052]"}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isDisabled ? "text-gray-500" : "text-gray-900"}`}>
                              {method.name}
                              {method.id === "wallet" && walletBonusBalance > 0 && (
                                <Badge className="ml-2 bg-amber-100 text-amber-800 text-xs">
                                  inkl. {walletBonusBalance.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} Bonus
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                          {method.id === "wallet" && !canPayWithWallet && (
                            <Link href="/wallet">
                              <Button variant="outline" size="sm" className="border-[#C4A052] text-[#C4A052]">
                                Aufladen
                              </Button>
                            </Link>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>

                {/* Show payment details based on selected method */}
                {paymentMethod.startsWith("crypto_") && cryptoWallets && cryptoWallets.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Nach Abschluss der Bestellung erhalten Sie die Wallet-Adresse für die Zahlung.
                    </p>
                  </div>
                )}

                {paymentMethod === "bank_transfer" && bankAccounts && bankAccounts.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Nach Abschluss der Bestellung erhalten Sie die Bankverbindung für die Überweisung.
                    </p>
                  </div>
                )}

                {paymentMethod === "wallet" && canPayWithWallet && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Wallet-Zahlung:</strong> Der Betrag von {totalAmount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} wird sofort von Ihrem Wallet abgebucht.
                      {walletBonusBalance > 0 && (
                        <span className="block mt-1">
                          Bonus-Guthaben wird zuerst verwendet (bis zu {Math.min(walletBonusBalance, totalAmount).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}).
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Rechnungsadresse (optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Vollständige Rechnungsadresse eingeben..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Anmerkungen (optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Besondere Wünsche oder Anmerkungen zur Bestellung..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Bestellübersicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item: any) => {
                    const options = item.options ? JSON.parse(item.options) : {};
                    return (
                      <div key={item.id} className="flex justify-between text-sm pb-2 border-b">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {options.name || `Artikel #${item.id}`}
                          </p>
                          <p className="text-gray-500">Menge: {item.quantity}</p>
                        </div>
                        <span className="font-medium whitespace-nowrap ml-2">
                          {(parseFloat(item.unitPrice) * item.quantity).toLocaleString("de-DE")} €
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Gesamtsumme</span>
                    <span className="text-[#C4A052]">
                      {totalAmount.toLocaleString("de-DE")} €
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#C4A052] hover:bg-[#B39142] py-6 text-lg"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || !paymentMethod}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Wird verarbeitet...
                    </>
                  ) : (
                    <>
                      Bestellung abschließen
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 pt-4">
                  Mit dem Abschluss der Bestellung akzeptieren Sie unsere{" "}
                  <Link href="/agb" className="text-[#C4A052] hover:underline">
                    AGB
                  </Link>{" "}
                  und{" "}
                  <Link href="/datenschutz" className="text-[#C4A052] hover:underline">
                    Datenschutzerklärung
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
