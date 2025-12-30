import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SignatureDisplay } from "@/components/SignaturePad";
import { formatCurrency, formatDate } from "@/lib/contractTemplate";
import {
  FileText,
  Download,
  Eye,
  Check,
  X,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Building2,
  User,
  Wallet,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

type ContractStatus = "draft" | "pending_payment" | "active" | "completed" | "cancelled" | "converted" | "withdrawal";

const statusLabels: Record<ContractStatus, string> = {
  draft: "Entwurf",
  pending_payment: "Warte auf Zahlung",
  active: "Aktiv",
  completed: "Abgeschlossen",
  withdrawal: "Widerrufen",
  cancelled: "Storniert",
  converted: "Umgewandelt",
};

const statusColors: Record<ContractStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending_payment: "bg-orange-100 text-orange-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  withdrawal: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
  converted: "bg-purple-100 text-purple-800",
};

export function ContractsAdminTab() {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<ContractStatus>("active");
  const [statusNote, setStatusNote] = useState("");

  // Fetch all contracts (admin)
  const { data: contracts, isLoading, refetch } = trpc.contracts.getAllAdmin.useQuery();

  // Mutations
  const updateStatusMutation = trpc.contracts.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Vertragsstatus aktualisiert");
      refetch();
      setShowStatusDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren");
    },
  });

  const generatePdfMutation = trpc.contracts.generatePdf.useMutation({
    onSuccess: (data) => {
      toast.success("PDF wurde generiert");
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler bei der PDF-Generierung");
    },
  });

  // Filter contracts
  const filteredContracts = contracts?.filter((contract: any) => {
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    const matchesSearch = searchTerm === "" || 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.buyerFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.buyerLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  // Statistics
  const stats = {
    total: contracts?.length || 0,
    active: contracts?.filter((c: any) => c.status === "active").length || 0,
    pendingPayment: contracts?.filter((c: any) => c.status === "pending_payment").length || 0,
    withdrawn: contracts?.filter((c: any) => c.status === "withdrawn").length || 0,
    totalValue: contracts?.reduce((sum: number, c: any) => 
      c.status === "active" || c.status === "completed" 
        ? sum + parseFloat(c.purchasePrice) 
        : sum, 0) || 0,
  };

  const handleUpdateStatus = () => {
    if (!selectedContract) return;
    updateStatusMutation.mutate({
      contractId: selectedContract.id,
      status: newStatus,
      reason: statusNote || undefined,
    });
  };

  const handleGeneratePdf = (contractId: number) => {
    generatePdfMutation.mutate({ contractId });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C4A052]" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Aktiv</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingPayment}</p>
                <p className="text-xs text-muted-foreground">Warte auf Zahlung</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.withdrawn}</p>
                <p className="text-xs text-muted-foreground">Widerrufen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#C4A052]" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-muted-foreground">Gesamtwert</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#C4A052]" />
                Kaufverträge verwalten
              </CardTitle>
              <CardDescription>
                Übersicht aller Immobilien-Vorverträge
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Vertragsnummer, Name oder Immobilie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="pending_payment">Warte auf Zahlung</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="withdrawal">Widerrufen</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
                <SelectItem value="converted">Umgewandelt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-[#C4A052]" />
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Verträge gefunden
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vertragsnr.</TableHead>
                    <TableHead>Käufer</TableHead>
                    <TableHead>Immobilie</TableHead>
                    <TableHead>Kaufpreis</TableHead>
                    <TableHead>Anzahlung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract: any) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-sm">
                        {contract.contractNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {contract.buyerFirstName} {contract.buyerLastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contract.buyerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">{contract.propertyTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {contract.propertyLocation}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(parseFloat(contract.purchasePrice))}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{formatCurrency(parseFloat(contract.downPaymentAmount))}</p>
                          <p className="text-xs text-muted-foreground">
                            ({contract.downPaymentPercent}%)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[contract.status as ContractStatus]}>
                          {statusLabels[contract.status as ContractStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(contract.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGeneratePdf(contract.id)}
                            disabled={generatePdfMutation.isPending}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract);
                              setNewStatus(contract.status);
                              setStatusNote("");
                              setShowStatusDialog(true);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vertragsdetails</DialogTitle>
            <DialogDescription>
              Vertrag {selectedContract?.contractNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContract && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedContract.status as ContractStatus]}>
                    {statusLabels[selectedContract.status as ContractStatus]}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Erstellt am</p>
                  <p className="font-medium">{formatDate(selectedContract.createdAt)}</p>
                </div>
              </div>

              {/* Buyer Info */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Käuferinformationen
                </h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedContract.buyerFirstName} {selectedContract.buyerLastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-Mail</p>
                    <p className="font-medium">{selectedContract.buyerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{selectedContract.buyerPhone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ausweis</p>
                    <p className="font-medium">
                      {selectedContract.buyerIdType}: {selectedContract.buyerIdNumber || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Info */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Immobilie
                </h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Titel</p>
                    <p className="font-medium">{selectedContract.propertyTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Standort</p>
                    <p className="font-medium">{selectedContract.propertyLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fläche</p>
                    <p className="font-medium">{selectedContract.propertyArea} m²</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Zahlungsinformationen
                </h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Kaufpreis</p>
                    <p className="font-medium text-lg">
                      {formatCurrency(parseFloat(selectedContract.purchasePrice))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Anzahlung</p>
                    <p className="font-medium text-lg">
                      {formatCurrency(parseFloat(selectedContract.downPaymentAmount))}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({selectedContract.downPaymentPercent}%)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Restbetrag</p>
                    <p className="font-medium">
                      {formatCurrency(parseFloat(selectedContract.remainingAmount))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Zahlungsplan</p>
                    <p className="font-medium">
                      {selectedContract.paymentPlan === "installment" 
                        ? `Ratenzahlung (${selectedContract.installmentMonths} Monate)`
                        : "Vollzahlung"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Signature */}
              {selectedContract.buyerSignature && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Unterschrift
                  </h4>
                  <SignatureDisplay
                    signature={selectedContract.buyerSignature}
                    label="Käufer-Unterschrift"
                    date={selectedContract.buyerSignedAt}
                  />
                </div>
              )}

              {/* Withdrawal Info */}
              {selectedContract.status === "withdrawn" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Widerruf
                  </h4>
                  <p className="text-sm text-red-700 mt-2">
                    {selectedContract.withdrawalReason || "Kein Grund angegeben"}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Widerrufen am: {selectedContract.withdrawnAt && formatDate(selectedContract.withdrawnAt)}
                  </p>
                </div>
              )}

              {/* PDF Download */}
              {selectedContract.contractPdfUrl && (
                <div className="flex justify-end">
                  <Button asChild>
                    <a href={selectedContract.contractPdfUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Vertrag als PDF herunterladen
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vertragsstatus ändern</DialogTitle>
            <DialogDescription>
              Ändern Sie den Status des Vertrags {selectedContract?.contractNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Neuer Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ContractStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="pending_signature">Warte auf Unterschrift</SelectItem>
                  <SelectItem value="pending_payment">Warte auf Zahlung</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="withdrawn">Widerrufen</SelectItem>
                  <SelectItem value="cancelled">Storniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Notiz (optional)</Label>
              <Textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Grund für die Statusänderung..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
              className="bg-[#C4A052] hover:bg-[#B39142]"
            >
              {updateStatusMutation.isPending ? "Wird gespeichert..." : "Status aktualisieren"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
