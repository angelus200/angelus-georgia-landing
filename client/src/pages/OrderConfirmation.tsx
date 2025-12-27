import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle,
  Copy,
  ArrowRight,
  Home,
  Package,
  Bitcoin,
  Building,
  Wallet,
  Clock,
  Mail,
  Phone,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function OrderConfirmation() {
  const params = useParams<{ orderNumber: string }>();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: orderData, isLoading, error } = trpc.orders.getByNumber.useQuery(
    { orderNumber: params.orderNumber || "" },
    { enabled: !!params.orderNumber }
  );

  const { data: cryptoWallets } = trpc.payment.getCryptoWallets.useQuery();
  const { data: bankAccounts } = trpc.payment.getBankAccounts.useQuery();

  const order = orderData?.order;
  const items = orderData?.items || [];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} kopiert`);
    setTimeout(() => setCopied(null), 2000);
  };

  const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Ausstehend", color: "bg-gray-100 text-gray-800", icon: Clock },
    awaiting_payment: { label: "Warte auf Zahlung", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    payment_received: { label: "Zahlung erhalten", color: "bg-green-100 text-green-800", icon: CheckCircle },
    processing: { label: "In Bearbeitung", color: "bg-blue-100 text-blue-800", icon: Package },
    completed: { label: "Abgeschlossen", color: "bg-green-200 text-green-900", icon: CheckCircle },
    cancelled: { label: "Storniert", color: "bg-red-100 text-red-800", icon: Clock },
  };

  const paymentMethodLabels: Record<string, { name: string; icon: any }> = {
    crypto_btc: { name: "Bitcoin (BTC)", icon: Bitcoin },
    crypto_eth: { name: "Ethereum (ETH)", icon: Wallet },
    crypto_usdt: { name: "USDT (Tether)", icon: Wallet },
    bank_transfer: { name: "Banküberweisung", icon: Building },
  };

  // Get relevant wallet based on payment method
  const getRelevantWallet = () => {
    if (!order || !cryptoWallets) return null;
    
    const currencyMap: Record<string, string> = {
      crypto_btc: "BTC",
      crypto_eth: "ETH",
      crypto_usdt: "USDT_ERC20",
    };
    
    const currency = currencyMap[order.paymentMethod || ""];
    if (!currency) return null;
    
    return cryptoWallets.find((w: any) => w.currency === currency || w.currency.startsWith(currency.split("_")[0]));
  };

  const relevantWallet = getRelevantWallet();
  const primaryBankAccount = bankAccounts?.find((a: any) => a.isPrimary) || bankAccounts?.[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#C4A052] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bestellung nicht gefunden</h2>
            <p className="text-gray-600 mb-6">
              Die angeforderte Bestellung konnte nicht gefunden werden.
            </p>
            <Link href="/">
              <Button className="bg-[#C4A052] hover:bg-[#B39142]">
                Zur Startseite
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusLabels[order.status] || statusLabels.pending;
  const StatusIcon = statusInfo.icon;
  const paymentInfo = paymentMethodLabels[order.paymentMethod || ""] || { name: "Unbekannt", icon: Package };
  const PaymentIcon = paymentInfo.icon;

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
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vielen Dank für Ihre Bestellung!
          </h1>
          <p className="text-gray-600">
            Ihre Bestellung wurde erfolgreich aufgenommen. Bitte führen Sie die Zahlung durch.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Bestelldetails</span>
                <Badge className={statusInfo.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Bestellnummer</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">{order.orderNumber}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(order.orderNumber, "Bestellnummer")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Datum</span>
                <span>{new Date(order.createdAt).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Zahlungsmethode</span>
                <div className="flex items-center gap-2">
                  <PaymentIcon className="w-4 h-4 text-[#C4A052]" />
                  <span>{paymentInfo.name}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Gesamtsumme</span>
                <span className="text-[#C4A052]">
                  {parseFloat(order.totalAmount).toLocaleString("de-DE")} €
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaymentIcon className="w-5 h-5 text-[#C4A052]" />
                Zahlungsanweisungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.paymentMethod?.startsWith("crypto_") && relevantWallet && (
                <>
                  <p className="text-sm text-gray-600">
                    Bitte überweisen Sie den Betrag an folgende Wallet-Adresse:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Wallet-Adresse ({relevantWallet.currency})</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono break-all flex-1">
                        {relevantWallet.address}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(relevantWallet.address, "Wallet-Adresse")}
                      >
                        {copied === "Wallet-Adresse" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Wichtig:</strong> Bitte geben Sie Ihre Bestellnummer ({order.orderNumber}) als Referenz an.
                    </p>
                  </div>
                </>
              )}

              {order.paymentMethod === "bank_transfer" && primaryBankAccount && (
                <>
                  <p className="text-sm text-gray-600">
                    Bitte überweisen Sie den Betrag an folgendes Bankkonto:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Bank</p>
                      <p className="font-medium">{primaryBankAccount.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kontoinhaber</p>
                      <p className="font-medium">{primaryBankAccount.accountName}</p>
                    </div>
                    {primaryBankAccount.iban && (
                      <div>
                        <p className="text-xs text-gray-500">IBAN</p>
                        <div className="flex items-center gap-2">
                          <code className="font-mono">{primaryBankAccount.iban}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(primaryBankAccount.iban || "", "IBAN")}
                          >
                            {copied === "IBAN" ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {primaryBankAccount.swift && (
                      <div>
                        <p className="text-xs text-gray-500">SWIFT/BIC</p>
                        <code className="font-mono">{primaryBankAccount.swift}</code>
                      </div>
                    )}
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Verwendungszweck:</strong> {order.orderNumber}
                    </p>
                  </div>
                </>
              )}

              {!relevantWallet && !primaryBankAccount && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Unser Team wird sich in Kürze mit den Zahlungsdetails bei Ihnen melden.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Bestellte Artikel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center pb-4 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.itemName}</p>
                    {item.itemDescription && (
                      <p className="text-sm text-gray-500">{item.itemDescription}</p>
                    )}
                    <p className="text-sm text-gray-500">Menge: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-[#C4A052]">
                    {parseFloat(item.totalPrice).toLocaleString("de-DE")} €
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Fragen zu Ihrer Bestellung?</h3>
              <p className="text-gray-600 mb-4">
                Unser Team steht Ihnen gerne zur Verfügung.
              </p>
              <div className="flex justify-center gap-6">
                <a href="mailto:info@angelus-management.ge" className="flex items-center gap-2 text-[#C4A052] hover:underline">
                  <Mail className="w-4 h-4" />
                  info@angelus-management.ge
                </a>
                <a href="tel:+995555123456" className="flex items-center gap-2 text-[#C4A052] hover:underline">
                  <Phone className="w-4 h-4" />
                  +995 555 123 456
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/meine-bestellungen">
            <Button variant="outline">
              Meine Bestellungen
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-[#C4A052] hover:bg-[#B39142]">
              Zur Startseite
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
