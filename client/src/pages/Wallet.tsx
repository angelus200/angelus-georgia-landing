import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  CreditCard, 
  Building2, 
  Bitcoin, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Percent,
  Gift,
  Info,
  Copy,
  ExternalLink
} from "lucide-react";

export default function Wallet() {
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<string>("");
  const [depositNotes, setDepositNotes] = useState("");
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);

  const { data: user } = trpc.auth.me.useQuery();
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = trpc.wallet.get.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: transactions, isLoading: transactionsLoading } = trpc.wallet.getTransactions.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: depositRequests } = trpc.wallet.getDepositRequests.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: interestHistory } = trpc.wallet.getInterestHistory.useQuery(undefined, {
    enabled: !!user,
  });

  const createDepositMutation = trpc.wallet.createDepositRequest.useMutation({
    onSuccess: () => {
      toast.success("Einzahlungsanfrage erstellt", {
        description: "Bitte folgen Sie den Anweisungen zur Zahlung.",
      });
      setIsDepositDialogOpen(false);
      setDepositAmount("");
      setDepositMethod("");
      setDepositNotes("");
      refetchWallet();
    },
    onError: (error) => {
      toast.error("Fehler", {
        description: error.message,
      });
    },
  });

  const handleCreateDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error("Mindesteinzahlung: 100€");
      return;
    }
    if (!depositMethod) {
      toast.error("Bitte wählen Sie eine Einzahlungsmethode");
      return;
    }

    createDepositMutation.mutate({
      amount,
      method: depositMethod as any,
      notes: depositNotes || undefined,
    });
  };

  const formatCurrency = (value: string | number | null | undefined) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num === null || num === undefined || isNaN(num)) return "0,00 €";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "purchase":
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "interest_credit":
        return <Percent className="h-4 w-4 text-amber-500" />;
      case "bonus_used":
        return <Gift className="h-4 w-4 text-purple-500" />;
      default:
        return <WalletIcon className="h-4 w-4" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Einzahlung";
      case "withdrawal":
        return "Auszahlung";
      case "purchase":
        return "Kauf";
      case "interest_credit":
        return "Zinsgutschrift";
      case "bonus_used":
        return "Bonus verwendet";
      case "refund":
        return "Rückerstattung";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Abgeschlossen</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">In Bearbeitung</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Fehlgeschlagen</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Storniert</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const balance = parseFloat(wallet?.balance || "0");
  const bonusBalance = parseFloat(wallet?.bonusBalance || "0");
  const totalBalance = balance + bonusBalance;
  const qualifiesForInterest = wallet?.qualifiesForInterest || false;

  // Bank account details (would come from backend in production)
  const bankDetails = {
    bankName: "Bank of Georgia",
    accountName: "Angelus Management LLC",
    iban: "GE29TB7777777777777777",
    swift: "TBCBGE22",
  };

  // Crypto wallet addresses (would come from backend in production)
  const cryptoAddresses = {
    btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    eth: "0x742d35Cc6634C0532925a3b844Bc9e7595f1E1E3",
    usdt: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Anmeldung erforderlich</CardTitle>
              <CardDescription>
                Bitte melden Sie sich an, um Ihr Wallet zu sehen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  Jetzt anmelden
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        {/* Footer */}
        <footer className="bg-background py-12 border-t border-border">
          <div className="container">
            <div className="text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Angelus Management Georgia. Alle Rechte vorbehalten.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <Header />
      
      <main className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Mein Wallet</h1>
          <p className="text-stone-600 mt-2">
            Verwalten Sie Ihr Guthaben für Immobilienkäufe und Dienstleistungen
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Total Balance */}
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-100">Gesamtguthaben</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {walletLoading ? "..." : formatCurrency(totalBalance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-amber-100">
                <WalletIcon className="h-5 w-5" />
                <span>Verfügbar für Einkäufe</span>
              </div>
            </CardContent>
          </Card>

          {/* Main Balance */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Hauptguthaben</CardDescription>
              <CardTitle className="text-2xl font-bold text-stone-900">
                {walletLoading ? "..." : formatCurrency(balance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-stone-500">
                <CreditCard className="h-5 w-5" />
                <span>Auszahlbar</span>
              </div>
            </CardContent>
          </Card>

          {/* Bonus Balance */}
          <Card className={qualifiesForInterest ? "border-amber-200 bg-amber-50" : ""}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                Bonus-Guthaben
                {qualifiesForInterest && (
                  <Badge className="bg-amber-100 text-amber-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    7% p.a.
                  </Badge>
                )}
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-amber-600">
                {walletLoading ? "..." : formatCurrency(bonusBalance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-stone-500">
                <Gift className="h-5 w-5" />
                <span>Nur für Einkäufe verwendbar</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interest Info Banner */}
        {!qualifiesForInterest && (
          <Card className="mb-8 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Percent className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900">
                    7% jährliche Verzinsung als Bonus freischalten!
                  </h3>
                  <p className="text-stone-600 mt-1">
                    Bei einer Ersteinzahlung von mindestens <strong>10.000 €</strong> erhalten Sie 
                    7% jährliche Verzinsung auf Ihr Guthaben. Die Zinsen werden als Bonus-Guthaben 
                    gutgeschrieben und können für alle Einkäufe verwendet werden.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Einzahlen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Guthaben einzahlen</DialogTitle>
                <DialogDescription>
                  Wählen Sie eine Einzahlungsmethode und den Betrag
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Betrag (EUR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="100"
                    step="100"
                    placeholder="z.B. 10000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                  <p className="text-sm text-stone-500">
                    Mindesteinzahlung: 100 € | Für 7% Bonus: mind. 10.000 €
                  </p>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Einzahlungsmethode</Label>
                  <Select value={depositMethod} onValueChange={setDepositMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Methode wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Banküberweisung (SEPA)
                        </div>
                      </SelectItem>
                      <SelectItem value="crypto_btc">
                        <div className="flex items-center gap-2">
                          <Bitcoin className="h-4 w-4" />
                          Bitcoin (BTC)
                        </div>
                      </SelectItem>
                      <SelectItem value="crypto_eth">
                        <div className="flex items-center gap-2">
                          <Bitcoin className="h-4 w-4" />
                          Ethereum (ETH)
                        </div>
                      </SelectItem>
                      <SelectItem value="crypto_usdt">
                        <div className="flex items-center gap-2">
                          <Bitcoin className="h-4 w-4" />
                          USDT (TRC-20)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Details */}
                {depositMethod === "bank_transfer" && (
                  <Card className="bg-stone-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Bankverbindung</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Bank:</span>
                        <span className="font-medium">{bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Empfänger:</span>
                        <span className="font-medium">{bankDetails.accountName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">IBAN:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{bankDetails.iban}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText(bankDetails.iban);
                              toast.success("IBAN kopiert");
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">SWIFT/BIC:</span>
                        <span className="font-mono font-medium">{bankDetails.swift}</span>
                      </div>
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-amber-800 text-xs">
                          <strong>Wichtig:</strong> Geben Sie im Verwendungszweck Ihre E-Mail-Adresse an, 
                          damit wir die Zahlung zuordnen können.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {depositMethod === "crypto_btc" && (
                  <Card className="bg-stone-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Bitcoin (BTC) Adresse</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 p-3 bg-white rounded border font-mono text-sm break-all">
                        {cryptoAddresses.btc}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(cryptoAddresses.btc);
                            toast.success("Adresse kopiert");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-stone-500 mt-2">
                        Senden Sie nur BTC an diese Adresse. Andere Währungen gehen verloren.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {depositMethod === "crypto_eth" && (
                  <Card className="bg-stone-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Ethereum (ETH) Adresse</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 p-3 bg-white rounded border font-mono text-sm break-all">
                        {cryptoAddresses.eth}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(cryptoAddresses.eth);
                            toast.success("Adresse kopiert");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-stone-500 mt-2">
                        Senden Sie nur ETH an diese Adresse. ERC-20 Token werden ebenfalls akzeptiert.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {depositMethod === "crypto_usdt" && (
                  <Card className="bg-stone-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">USDT (TRC-20) Adresse</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 p-3 bg-white rounded border font-mono text-sm break-all">
                        {cryptoAddresses.usdt}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(cryptoAddresses.usdt);
                            toast.success("Adresse kopiert");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-stone-500 mt-2">
                        Nur USDT auf dem TRC-20 Netzwerk (TRON). Andere Netzwerke werden nicht unterstützt.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Anmerkungen (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="z.B. Transaktions-ID bei Krypto"
                    value={depositNotes}
                    onChange={(e) => setDepositNotes(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={handleCreateDeposit}
                  disabled={createDepositMutation.isPending}
                >
                  {createDepositMutation.isPending ? "Wird erstellt..." : "Einzahlungsanfrage erstellen"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Link href="/immobilien">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Immobilien ansehen
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transaktionen</TabsTrigger>
            <TabsTrigger value="deposits">Einzahlungen</TabsTrigger>
            {qualifiesForInterest && (
              <TabsTrigger value="interest">Zinsen</TabsTrigger>
            )}
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaktionshistorie</CardTitle>
                <CardDescription>Alle Bewegungen auf Ihrem Wallet</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8 text-stone-500">Laden...</div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-full">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">
                              {getTransactionLabel(tx.type)}
                            </p>
                            <p className="text-sm text-stone-500">
                              {tx.description || "-"}
                            </p>
                            <p className="text-xs text-stone-400">
                              {formatDate(tx.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              tx.type === "deposit" || tx.type === "interest_credit" || tx.type === "refund"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {tx.type === "deposit" || tx.type === "interest_credit" || tx.type === "refund"
                              ? "+"
                              : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-stone-500">
                    <WalletIcon className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                    <p>Noch keine Transaktionen</p>
                    <p className="text-sm">Tätigen Sie Ihre erste Einzahlung</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle>Einzahlungsanfragen</CardTitle>
                <CardDescription>Status Ihrer Einzahlungen</CardDescription>
              </CardHeader>
              <CardContent>
                {depositRequests && depositRequests.length > 0 ? (
                  <div className="space-y-4">
                    {depositRequests.map((req: any) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-full">
                            {req.method === "bank_transfer" ? (
                              <Building2 className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Bitcoin className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">
                              {req.method === "bank_transfer"
                                ? "Banküberweisung"
                                : req.cryptoCurrency || "Krypto"}
                            </p>
                            <p className="text-sm text-stone-500">
                              Anfrage #{req.id}
                            </p>
                            <p className="text-xs text-stone-400">
                              {formatDate(req.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-stone-900">
                            {formatCurrency(req.amount)}
                          </p>
                          {getStatusBadge(req.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-stone-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                    <p>Keine Einzahlungsanfragen</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interest Tab */}
          {qualifiesForInterest && (
            <TabsContent value="interest">
              <Card>
                <CardHeader>
                  <CardTitle>Zinsgutschriften</CardTitle>
                  <CardDescription>
                    Ihre 7% jährliche Verzinsung als Bonus-Guthaben
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {interestHistory && interestHistory.length > 0 ? (
                    <div className="space-y-4">
                      {interestHistory.map((calc: any) => (
                        <div
                          key={calc.id}
                          className="flex items-center justify-between p-4 bg-amber-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-full">
                              <Percent className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                              <p className="font-medium text-stone-900">
                                Zinsgutschrift
                              </p>
                              <p className="text-sm text-stone-500">
                                {calc.daysInPeriod} Tage auf {formatCurrency(calc.principalAmount)}
                              </p>
                              <p className="text-xs text-stone-400">
                                {formatDate(calc.periodEnd)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              +{formatCurrency(calc.interestAmount)}
                            </p>
                            <Badge className="bg-green-100 text-green-800">
                              Gutgeschrieben
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-stone-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                      <p>Noch keine Zinsgutschriften</p>
                      <p className="text-sm">Zinsen werden täglich berechnet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Wichtige Informationen
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-stone max-w-none">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-stone-900">Bonus-Programm</h4>
                <p className="text-sm text-stone-600">
                  Bei einer Ersteinzahlung von mindestens 10.000 € erhalten Sie 7% jährliche 
                  Verzinsung. Die Zinsen werden täglich berechnet und als Bonus-Guthaben 
                  gutgeschrieben. Das Bonus-Guthaben kann für alle Einkäufe verwendet werden, 
                  ist aber nicht auszahlbar.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900">Einzahlungen</h4>
                <p className="text-sm text-stone-600">
                  Banküberweisungen werden innerhalb von 1-3 Werktagen gutgeschrieben. 
                  Krypto-Einzahlungen werden nach Bestätigung auf der Blockchain 
                  (ca. 10-60 Minuten) automatisch verarbeitet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Angelus Management Georgia. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
