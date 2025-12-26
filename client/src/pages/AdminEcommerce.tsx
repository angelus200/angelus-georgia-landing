import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Building2,
  Package,
  CreditCard,
  Wallet,
  Building,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Bitcoin,
  Banknote,
} from "lucide-react";

// Services Management Tab
function ServicesTab() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: services, isLoading } = trpc.services.list.useQuery();
  const createMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      utils.services.list.invalidate();
      setIsOpen(false);
      toast.success("Dienstleistung erstellt");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      utils.services.list.invalidate();
      setEditingService(null);
      toast.success("Dienstleistung aktualisiert");
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      utils.services.list.invalidate();
      toast.success("Dienstleistung gelöscht");
    },
    onError: (error) => toast.error(error.message),
  });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    longDescription: "",
    category: "company_formation" as const,
    price: "",
    priceType: "fixed" as const,
    percentageRate: "",
    durationMonths: "",
    includedItems: "",
    requirements: "",
    processingTimeDays: "",
    icon: "",
    isStandalone: true,
    isAddon: true,
    sortOrder: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      isActive: true,
    });
  };

  const categoryLabels: Record<string, string> = {
    company_formation: "Firmengründung",
    rental_guarantee: "Mietgarantie",
    property_management: "Property Management",
    legal: "Rechtsberatung",
    tax: "Steuerberatung",
    other: "Sonstiges",
  };

  const priceTypeLabels: Record<string, string> = {
    fixed: "Einmalig",
    monthly: "Monatlich",
    yearly: "Jährlich",
    percentage: "Prozentual",
    custom: "Individuell",
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-[#C4A052] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Dienstleistungen</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#C4A052] hover:bg-[#B39142]">
              <Plus className="w-4 h-4 mr-2" />
              Neue Dienstleistung
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neue Dienstleistung erstellen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Firmengründung LLC"
                    required
                  />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="z.B. firmengruendung-llc"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Kategorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company_formation">Firmengründung</SelectItem>
                    <SelectItem value="rental_guarantee">Mietgarantie</SelectItem>
                    <SelectItem value="property_management">Property Management</SelectItem>
                    <SelectItem value="legal">Rechtsberatung</SelectItem>
                    <SelectItem value="tax">Steuerberatung</SelectItem>
                    <SelectItem value="other">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Kurzbeschreibung *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kurze Beschreibung der Dienstleistung..."
                  required
                />
              </div>

              <div>
                <Label>Ausführliche Beschreibung</Label>
                <Textarea
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  placeholder="Detaillierte Beschreibung..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Preis (€) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="z.B. 1500"
                    required
                  />
                </div>
                <div>
                  <Label>Preistyp</Label>
                  <Select
                    value={formData.priceType}
                    onValueChange={(value: any) => setFormData({ ...formData, priceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Einmalig</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="yearly">Jährlich</SelectItem>
                      <SelectItem value="percentage">Prozentual</SelectItem>
                      <SelectItem value="custom">Individuell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bearbeitungszeit (Tage)</Label>
                  <Input
                    type="number"
                    value={formData.processingTimeDays}
                    onChange={(e) => setFormData({ ...formData, processingTimeDays: e.target.value })}
                    placeholder="z.B. 14"
                  />
                </div>
              </div>

              <div>
                <Label>Enthaltene Leistungen (eine pro Zeile)</Label>
                <Textarea
                  value={formData.includedItems}
                  onChange={(e) => setFormData({ ...formData, includedItems: e.target.value })}
                  placeholder="Registrierung beim Handelsregister&#10;Notarielle Beglaubigung&#10;Steuerliche Anmeldung"
                  rows={4}
                />
              </div>

              <div>
                <Label>Voraussetzungen</Label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Benötigte Dokumente und Voraussetzungen..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" className="bg-[#C4A052] hover:bg-[#B39142]" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Wird erstellt..." : "Erstellen"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services?.map((service: any) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <Badge variant="outline">{categoryLabels[service.category] || service.category}</Badge>
                    <Badge className="bg-[#C4A052]/10 text-[#C4A052]">
                      {priceTypeLabels[service.priceType] || service.priceType}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <p className="text-lg font-bold text-[#C4A052]">
                    {parseFloat(service.price).toLocaleString("de-DE")} €
                    {service.priceType === "monthly" && " /Monat"}
                    {service.priceType === "yearly" && " /Jahr"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingService(service)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm("Dienstleistung wirklich löschen?")) {
                        deleteMutation.mutate({ id: service.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {services?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Noch keine Dienstleistungen angelegt.
          </div>
        )}
      </div>
    </div>
  );
}

// Orders Management Tab
function OrdersTab() {
  const { data: orders, isLoading } = trpc.orders.getAll.useQuery();
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.getAll.invalidate();
      toast.success("Status aktualisiert");
    },
    onError: (error) => toast.error(error.message),
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Ausstehend", color: "bg-gray-100 text-gray-800" },
    awaiting_payment: { label: "Warte auf Zahlung", color: "bg-yellow-100 text-yellow-800" },
    payment_received: { label: "Zahlung erhalten", color: "bg-green-100 text-green-800" },
    processing: { label: "In Bearbeitung", color: "bg-blue-100 text-blue-800" },
    completed: { label: "Abgeschlossen", color: "bg-green-200 text-green-900" },
    cancelled: { label: "Storniert", color: "bg-red-100 text-red-800" },
    refunded: { label: "Erstattet", color: "bg-purple-100 text-purple-800" },
  };

  const paymentMethodLabels: Record<string, string> = {
    crypto_btc: "Bitcoin",
    crypto_eth: "Ethereum",
    crypto_usdt: "USDT",
    bank_transfer: "Banküberweisung",
    card: "Kreditkarte",
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-[#C4A052] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Bestellungen</h2>

      <div className="space-y-4">
        {orders?.map((order: any) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                    <Badge className={statusLabels[order.status]?.color || "bg-gray-100"}>
                      {statusLabels[order.status]?.label || order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Erstellt: {new Date(order.createdAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#C4A052]">
                    {parseFloat(order.totalAmount).toLocaleString("de-DE")} €
                  </p>
                  <p className="text-sm text-gray-500">
                    {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Select
                  value={order.status}
                  onValueChange={(value: any) => {
                    updateStatusMutation.mutate({ id: order.id, status: value });
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="awaiting_payment">Warte auf Zahlung</SelectItem>
                    <SelectItem value="payment_received">Zahlung erhalten</SelectItem>
                    <SelectItem value="processing">In Bearbeitung</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="cancelled">Storniert</SelectItem>
                    <SelectItem value="refunded">Erstattet</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {orders?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Noch keine Bestellungen vorhanden.
          </div>
        )}
      </div>
    </div>
  );
}

// Crypto Wallets Tab
function CryptoWalletsTab() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: wallets, isLoading } = trpc.payment.getCryptoWallets.useQuery();
  const createMutation = trpc.payment.createCryptoWallet.useMutation({
    onSuccess: () => {
      utils.payment.getCryptoWallets.invalidate();
      setIsOpen(false);
      toast.success("Wallet hinzugefügt");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateMutation = trpc.payment.updateCryptoWallet.useMutation({
    onSuccess: () => {
      utils.payment.getCryptoWallets.invalidate();
      toast.success("Wallet aktualisiert");
    },
    onError: (error) => toast.error(error.message),
  });

  const [formData, setFormData] = useState({
    currency: "BTC" as const,
    address: "",
    label: "",
  });

  const currencyLabels: Record<string, { name: string; icon: any }> = {
    BTC: { name: "Bitcoin", icon: Bitcoin },
    ETH: { name: "Ethereum", icon: Wallet },
    USDT_ERC20: { name: "USDT (ERC20)", icon: Wallet },
    USDT_TRC20: { name: "USDT (TRC20)", icon: Wallet },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-[#C4A052] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Krypto-Wallets</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#C4A052] hover:bg-[#B39142]">
              <Plus className="w-4 h-4 mr-2" />
              Neues Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Krypto-Wallet hinzufügen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Währung *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: any) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT_ERC20">USDT (ERC20)</SelectItem>
                    <SelectItem value="USDT_TRC20">USDT (TRC20)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Wallet-Adresse *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Wallet-Adresse eingeben..."
                  required
                />
              </div>

              <div>
                <Label>Bezeichnung</Label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="z.B. Haupt-Wallet"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" className="bg-[#C4A052] hover:bg-[#B39142]" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Wird hinzugefügt..." : "Hinzufügen"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {wallets?.map((wallet: any) => {
          const currencyInfo = currencyLabels[wallet.currency] || { name: wallet.currency, icon: Wallet };
          const Icon = currencyInfo.icon;
          return (
            <Card key={wallet.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#C4A052]/10 rounded-lg">
                    <Icon className="w-6 h-6 text-[#C4A052]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{currencyInfo.name}</h3>
                      {wallet.label && (
                        <Badge variant="outline">{wallet.label}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-mono truncate">{wallet.address}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(wallet.address);
                      toast.success("Adresse kopiert");
                    }}
                  >
                    Kopieren
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {wallets?.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            Noch keine Krypto-Wallets konfiguriert.
          </div>
        )}
      </div>
    </div>
  );
}

// Bank Accounts Tab
function BankAccountsTab() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: accounts, isLoading } = trpc.payment.getBankAccounts.useQuery();
  const createMutation = trpc.payment.createBankAccount.useMutation({
    onSuccess: () => {
      utils.payment.getBankAccounts.invalidate();
      setIsOpen(false);
      toast.success("Bankkonto hinzugefügt");
    },
    onError: (error) => toast.error(error.message),
  });

  const [formData, setFormData] = useState({
    bankName: "",
    accountHolder: "",
    iban: "",
    bic: "",
    currency: "EUR",
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-[#C4A052] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Bankkonten</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#C4A052] hover:bg-[#B39142]">
              <Plus className="w-4 h-4 mr-2" />
              Neues Bankkonto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neues Bankkonto hinzufügen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bankname *</Label>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="z.B. Bank of Georgia"
                    required
                  />
                </div>
                <div>
                  <Label>Kontoinhaber *</Label>
                  <Input
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                    placeholder="Name des Kontoinhabers"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>IBAN</Label>
                <Input
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  placeholder="z.B. GE29NB0000000101904917"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SWIFT/BIC</Label>
                  <Input
                    value={formData.bic}
                    onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                    placeholder="z.B. BAGAGE22"
                  />
                </div>
                <div>
                  <Label>Währung</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GEL">GEL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" className="bg-[#C4A052] hover:bg-[#B39142]" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Wird hinzugefügt..." : "Hinzufügen"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {accounts?.map((account: any) => (
          <Card key={account.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#C4A052]/10 rounded-lg">
                  <Building className="w-6 h-6 text-[#C4A052]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{account.bankName}</h3>
                    {account.isPrimary && (
                      <Badge className="bg-[#C4A052] text-white">Primär</Badge>
                    )}
                    <Badge variant="outline">{account.currency}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{account.accountName}</p>
                  {account.iban && (
                    <p className="text-sm text-gray-500 font-mono mt-1">IBAN: {account.iban}</p>
                  )}
                  {account.swift && (
                    <p className="text-sm text-gray-500 font-mono">SWIFT: {account.swift}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {accounts?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Noch keine Bankkonten konfiguriert.
          </div>
        )}
      </div>
    </div>
  );
}

// Main Admin E-Commerce Component
export default function AdminEcommerce() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">E-Commerce Verwaltung</h1>
          <p className="text-gray-600 mt-2">Verwalten Sie Dienstleistungen, Bestellungen und Zahlungsmethoden</p>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="services" className="data-[state=active]:bg-[#C4A052] data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Dienstleistungen
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#C4A052] data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Bestellungen
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-[#C4A052] data-[state=active]:text-white">
              <Bitcoin className="w-4 h-4 mr-2" />
              Krypto-Wallets
            </TabsTrigger>
            <TabsTrigger value="bank" className="data-[state=active]:bg-[#C4A052] data-[state=active]:text-white">
              <Building className="w-4 h-4 mr-2" />
              Bankkonten
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <Card>
              <CardContent className="p-6">
                <ServicesTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardContent className="p-6">
                <OrdersTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crypto">
            <Card>
              <CardContent className="p-6">
                <CryptoWalletsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank">
            <Card>
              <CardContent className="p-6">
                <BankAccountsTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
