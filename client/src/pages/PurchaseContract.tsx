import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SignaturePad, SignatureDisplay } from "@/components/SignaturePad";
import { generateContractHtml, formatCurrency, formatDate, type ContractData } from "@/lib/contractTemplate";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wallet, 
  Download,
  ArrowLeft,
  ArrowRight,
  Building2,
  User,
  CreditCard,
  PenTool,
  Info
} from "lucide-react";
import { toast } from "sonner";

type Step = "info" | "terms" | "sign" | "payment" | "complete";

export default function PurchaseContract() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState("");
  const [contractId, setContractId] = useState<number | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState({
    georgianLaw: false,
    withdrawal: false,
    dataProcessing: false,
  });

  // Form data
  const [formData, setFormData] = useState({
    buyerFirstName: "",
    buyerLastName: "",
    buyerEmail: "",
    buyerPhone: "",
    buyerAddress: "",
    buyerIdType: "" as "passport" | "id_card" | "drivers_license" | "",
    buyerIdNumber: "",
    buyerDateOfBirth: "",
    buyerNationality: "",
    downPaymentPercent: 40,
    paymentPlan: "installment" as "full" | "installment",
    installmentMonths: 24,
    specialConditions: "",
  });

  // Fetch property
  const { data: property, isLoading: propertyLoading } = trpc.properties.getById.useQuery(
    { id: parseInt(propertyId || "0") },
    { enabled: !!propertyId }
  );

  // Fetch wallet
  const { data: wallet } = trpc.wallet.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch existing contract if any
  const { data: existingContract, refetch: refetchContract } = trpc.contracts.getById.useQuery(
    { id: contractId || 0 },
    { enabled: !!contractId }
  );

  // Mutations
  const createContractMutation = trpc.contracts.create.useMutation();
  const signContractMutation = trpc.contracts.sign.useMutation();
  const payDownPaymentMutation = trpc.contracts.payDownPayment.useMutation();
  const requestWithdrawalMutation = trpc.contracts.requestWithdrawal.useMutation();

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        buyerFirstName: (user as any).firstName || "",
        buyerLastName: (user as any).lastName || "",
        buyerEmail: user.email || "",
        buyerPhone: (user as any).phone || "",
        buyerAddress: [
          (user as any).street,
          (user as any).postalCode,
          (user as any).city,
          (user as any).country
        ].filter(Boolean).join(", "),
        buyerIdType: (user as any).idDocumentType || "",
        buyerIdNumber: (user as any).idDocumentNumber || "",
        buyerDateOfBirth: (user as any).dateOfBirth ? new Date((user as any).dateOfBirth).toISOString().split("T")[0] : "",
      }));
    }
  }, [user]);

  // Set minimum down payment from property
  useEffect(() => {
    if (property?.minDownPayment) {
      const minPercent = parseFloat(property.minDownPayment);
      if (formData.downPaymentPercent < minPercent) {
        setFormData(prev => ({ ...prev, downPaymentPercent: minPercent }));
      }
    }
  }, [property]);

  if (authLoading || propertyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A052]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
            <CardDescription>
              Bitte melden Sie sich an, um einen Kaufvertrag abzuschließen.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/login")} className="w-full bg-[#C4A052] hover:bg-[#B39142]">
              Zur Anmeldung
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Immobilie nicht gefunden</CardTitle>
            <CardDescription>
              Die angeforderte Immobilie existiert nicht oder ist nicht mehr verfügbar.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/properties")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu Immobilien
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const purchasePrice = parseFloat(property.price);
  const downPaymentAmount = (purchasePrice * formData.downPaymentPercent) / 100;
  const remainingAmount = purchasePrice - downPaymentAmount;
  const monthlyInstallment = formData.paymentPlan === "installment" && formData.installmentMonths > 0
    ? remainingAmount / formData.installmentMonths
    : 0;
  const interestRate = property.installmentInterestRate ? parseFloat(property.installmentInterestRate) : 0;

  const walletBalance = wallet ? parseFloat(wallet.balance) + parseFloat(wallet.bonusBalance) : 0;
  const hasEnoughBalance = walletBalance >= downPaymentAmount;

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: "Persönliche Daten", icon: <User className="h-4 w-4" /> },
    { id: "terms", label: "Vertragsbedingungen", icon: <FileText className="h-4 w-4" /> },
    { id: "sign", label: "Unterschrift", icon: <PenTool className="h-4 w-4" /> },
    { id: "payment", label: "Anzahlung", icon: <Wallet className="h-4 w-4" /> },
    { id: "complete", label: "Abschluss", icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleCreateContract = async () => {
    if (!formData.buyerIdType) {
      toast.error("Bitte wählen Sie einen Ausweistyp");
      return;
    }

    try {
      const result = await createContractMutation.mutateAsync({
        propertyId: parseInt(propertyId!),
        buyerFirstName: formData.buyerFirstName,
        buyerLastName: formData.buyerLastName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone || undefined,
        buyerAddress: formData.buyerAddress || undefined,
        buyerIdType: formData.buyerIdType,
        buyerIdNumber: formData.buyerIdNumber || undefined,
        buyerDateOfBirth: formData.buyerDateOfBirth || undefined,
        buyerNationality: formData.buyerNationality || undefined,
        downPaymentPercent: formData.downPaymentPercent,
        paymentPlan: formData.paymentPlan,
        installmentMonths: formData.paymentPlan === "installment" ? formData.installmentMonths : undefined,
        specialConditions: formData.specialConditions || undefined,
      });

      setContractId(result.contractId);
      setCurrentStep("sign");
      toast.success("Vertrag erstellt");
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Erstellen des Vertrags");
    }
  };

  const handleSignContract = async (signature: string) => {
    if (!contractId) return;

    try {
      await signContractMutation.mutateAsync({
        contractId,
        signature,
      });

      setShowSignatureDialog(false);
      await refetchContract();
      setCurrentStep("payment");
      toast.success("Vertrag unterschrieben");
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Unterschreiben");
    }
  };

  const handlePayDownPayment = async () => {
    if (!contractId) return;

    try {
      await payDownPaymentMutation.mutateAsync({ contractId });
      await refetchContract();
      setCurrentStep("complete");
      toast.success("Anzahlung erfolgreich");
    } catch (error: any) {
      toast.error(error.message || "Fehler bei der Zahlung");
    }
  };

  const handleWithdrawal = async () => {
    if (!contractId || !withdrawalReason.trim()) return;

    try {
      await requestWithdrawalMutation.mutateAsync({
        contractId,
        reason: withdrawalReason,
      });

      setShowWithdrawalDialog(false);
      toast.success("Widerruf erfolgreich eingereicht");
      navigate("/dashboard/contracts");
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Widerruf");
    }
  };

  const allTermsAccepted = acceptedTerms.georgianLaw && acceptedTerms.withdrawal && acceptedTerms.dataProcessing;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(`/properties/${propertyId}`)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Immobilie
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Immobilienkauf - Vorvertrag</h1>
          <p className="text-muted-foreground mt-1">
            {property.title} • {property.location}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStepIndex
                      ? "bg-[#C4A052] border-[#C4A052] text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      index < currentStepIndex ? "bg-[#C4A052]" : "bg-gray-200"
                    }`}
                    style={{ width: "60px" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step.id} className="text-xs text-muted-foreground text-center" style={{ width: "80px" }}>
                {step.label}
              </span>
            ))}
          </div>
        </div>

        {/* Property Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#C4A052]" />
              <CardTitle className="text-lg">Immobilienübersicht</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Kaufpreis</p>
                <p className="font-semibold text-lg">{formatCurrency(purchasePrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Anzahlung ({formData.downPaymentPercent}%)</p>
                <p className="font-semibold text-lg">{formatCurrency(downPaymentAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Restbetrag</p>
                <p className="font-semibold text-lg">{formatCurrency(remainingAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fläche</p>
                <p className="font-semibold text-lg">{parseFloat(property.area).toFixed(0)} m²</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === "info" && (
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Daten</CardTitle>
              <CardDescription>
                Bitte überprüfen und ergänzen Sie Ihre persönlichen Daten für den Kaufvertrag.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    value={formData.buyerFirstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyerFirstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    value={formData.buyerLastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyerLastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.buyerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyerEmail: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.buyerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyerPhone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Vollständige Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.buyerAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerAddress: e.target.value }))}
                  placeholder="Straße, PLZ, Stadt, Land"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idType">Ausweistyp *</Label>
                  <Select
                    value={formData.buyerIdType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, buyerIdType: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Reisepass</SelectItem>
                      <SelectItem value="id_card">Personalausweis</SelectItem>
                      <SelectItem value="drivers_license">Führerschein</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">Ausweisnummer</Label>
                  <Input
                    id="idNumber"
                    value={formData.buyerIdNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyerIdNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Staatsangehörigkeit</Label>
                  <Input
                    id="nationality"
                    value={formData.buyerNationality}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyerNationality: e.target.value }))}
                    placeholder="z.B. Deutsch"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Geburtsdatum</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.buyerDateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerDateOfBirth: e.target.value }))}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={() => setCurrentStep("terms")}
                disabled={!formData.buyerFirstName || !formData.buyerLastName || !formData.buyerEmail}
                className="bg-[#C4A052] hover:bg-[#B39142]"
              >
                Weiter
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === "terms" && (
          <Card>
            <CardHeader>
              <CardTitle>Vertragsbedingungen</CardTitle>
              <CardDescription>
                Bitte lesen und akzeptieren Sie die Vertragsbedingungen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Options */}
              <div className="space-y-4">
                <h3 className="font-semibold">Zahlungsoptionen</h3>
                
                <div className="space-y-2">
                  <Label>Anzahlung (Minimum: {property.minDownPayment || 10}%)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min={parseFloat(property.minDownPayment || "10")}
                      max={100}
                      value={formData.downPaymentPercent}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        downPaymentPercent: Math.max(
                          parseFloat(property.minDownPayment || "10"),
                          Math.min(100, parseInt(e.target.value) || 0)
                        )
                      }))}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">% = {formatCurrency(downPaymentAmount)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Zahlungsplan für Restbetrag</Label>
                  <Select
                    value={formData.paymentPlan}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentPlan: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Vollzahlung bei Fertigstellung</SelectItem>
                      <SelectItem value="installment">Ratenzahlung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.paymentPlan === "installment" && (
                  <div className="space-y-2">
                    <Label>Laufzeit (Monate)</Label>
                    <Select
                      value={formData.installmentMonths.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, installmentMonths: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 Monate</SelectItem>
                        <SelectItem value="24">24 Monate</SelectItem>
                        <SelectItem value="36">36 Monate</SelectItem>
                        <SelectItem value="48">48 Monate</SelectItem>
                        <SelectItem value="60">60 Monate</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Monatliche Rate: {formatCurrency(monthlyInstallment)}
                      {interestRate > 0 && ` (Zinssatz: ${interestRate}% p.a.)`}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Special Conditions */}
              <div className="space-y-2">
                <Label>Besondere Vereinbarungen (optional)</Label>
                <Textarea
                  value={formData.specialConditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialConditions: e.target.value }))}
                  placeholder="Hier können Sie besondere Wünsche oder Vereinbarungen eintragen..."
                  rows={3}
                />
              </div>

              <Separator />

              {/* Legal Terms */}
              <div className="space-y-4">
                <h3 className="font-semibold">Rechtliche Hinweise</h3>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Wichtiger Hinweis</AlertTitle>
                  <AlertDescription>
                    Dieser Vorvertrag ist nach georgischem Recht rechtlich bindend. 
                    Deutsches Recht findet keine Anwendung.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="georgianLaw"
                      checked={acceptedTerms.georgianLaw}
                      onCheckedChange={(checked) => 
                        setAcceptedTerms(prev => ({ ...prev, georgianLaw: checked as boolean }))
                      }
                    />
                    <label htmlFor="georgianLaw" className="text-sm leading-relaxed cursor-pointer">
                      Ich verstehe und akzeptiere, dass dieser Vertrag ausschließlich nach <strong>georgischem Recht</strong> geschlossen wird. 
                      Die Anwendung deutschen Rechts oder des Rechts anderer Staaten ist ausdrücklich ausgeschlossen.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="withdrawal"
                      checked={acceptedTerms.withdrawal}
                      onCheckedChange={(checked) => 
                        setAcceptedTerms(prev => ({ ...prev, withdrawal: checked as boolean }))
                      }
                    />
                    <label htmlFor="withdrawal" className="text-sm leading-relaxed cursor-pointer">
                      Ich wurde über mein <strong>14-tägiges Widerrufsrecht</strong> informiert. 
                      Ich kann diesen Vertrag innerhalb von 14 Kalendertagen nach Unterzeichnung ohne Angabe von Gründen widerrufen.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="dataProcessing"
                      checked={acceptedTerms.dataProcessing}
                      onCheckedChange={(checked) => 
                        setAcceptedTerms(prev => ({ ...prev, dataProcessing: checked as boolean }))
                      }
                    />
                    <label htmlFor="dataProcessing" className="text-sm leading-relaxed cursor-pointer">
                      Ich stimme der Verarbeitung meiner personenbezogenen Daten zum Zweck der Vertragsabwicklung zu.
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("info")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <Button
                onClick={handleCreateContract}
                disabled={!allTermsAccepted || createContractMutation.isPending}
                className="bg-[#C4A052] hover:bg-[#B39142]"
              >
                {createContractMutation.isPending ? "Wird erstellt..." : "Vertrag erstellen"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === "sign" && (
          <Card>
            <CardHeader>
              <CardTitle>Digitale Unterschrift</CardTitle>
              <CardDescription>
                Bitte unterschreiben Sie den Vorvertrag digital.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {existingContract?.buyerSignature ? (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Vertrag unterschrieben</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Sie haben den Vertrag am {existingContract.buyerSignedAt && formatDate(existingContract.buyerSignedAt.toString())} unterschrieben.
                    </AlertDescription>
                  </Alert>
                  <SignatureDisplay
                    signature={existingContract.buyerSignature}
                    label="Ihre Unterschrift"
                    date={existingContract.buyerSignedAt || undefined}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <PenTool className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Klicken Sie auf den Button unten, um den Vertrag digital zu unterschreiben.
                  </p>
                  <Button
                    onClick={() => setShowSignatureDialog(true)}
                    className="bg-[#C4A052] hover:bg-[#B39142]"
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Jetzt unterschreiben
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("terms")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              {existingContract?.buyerSignature && (
                <Button
                  onClick={() => setCurrentStep("payment")}
                  className="bg-[#C4A052] hover:bg-[#B39142]"
                >
                  Weiter zur Zahlung
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        {currentStep === "payment" && (
          <Card>
            <CardHeader>
              <CardTitle>Anzahlung</CardTitle>
              <CardDescription>
                Bezahlen Sie die Anzahlung aus Ihrem Wallet-Guthaben.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {existingContract?.status === "active" ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Anzahlung erhalten</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Ihre Anzahlung wurde erfolgreich verarbeitet. Der Vertrag ist jetzt aktiv.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Anzahlung</span>
                      <span className="text-2xl font-bold">{formatCurrency(downPaymentAmount)}</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Ihr Wallet-Guthaben</span>
                      <span className={`font-semibold ${hasEnoughBalance ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(walletBalance)}
                      </span>
                    </div>
                  </div>

                  {!hasEnoughBalance && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Nicht genügend Guthaben</AlertTitle>
                      <AlertDescription>
                        Bitte laden Sie Ihr Wallet auf, um die Anzahlung zu bezahlen.
                        <Button
                          variant="link"
                          className="p-0 h-auto text-red-600 underline ml-1"
                          onClick={() => navigate("/dashboard/wallet")}
                        >
                          Wallet aufladen
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Widerrufsrecht</AlertTitle>
                    <AlertDescription>
                      Nach Zahlung der Anzahlung haben Sie noch <strong>14 Tage</strong> Zeit, 
                      den Vertrag zu widerrufen. Die Anzahlung wird in diesem Fall vollständig zurückerstattet.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("sign")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              {existingContract?.status === "active" ? (
                <Button
                  onClick={() => setCurrentStep("complete")}
                  className="bg-[#C4A052] hover:bg-[#B39142]"
                >
                  Weiter
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handlePayDownPayment}
                  disabled={!hasEnoughBalance || payDownPaymentMutation.isPending}
                  className="bg-[#C4A052] hover:bg-[#B39142]"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {payDownPaymentMutation.isPending ? "Wird verarbeitet..." : `${formatCurrency(downPaymentAmount)} bezahlen`}
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        {currentStep === "complete" && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Herzlichen Glückwunsch!</CardTitle>
              <CardDescription className="text-lg">
                Ihr Vorvertrag wurde erfolgreich abgeschlossen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vertragsnummer</span>
                  <span className="font-mono font-semibold">{existingContract?.contractNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Widerrufsfrist bis</span>
                  <span className="font-semibold">
                    {existingContract?.withdrawalDeadline && formatDate(existingContract.withdrawalDeadline.toString())}
                  </span>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Nächste Schritte</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Sie erhalten eine Bestätigungs-E-Mail mit dem Vertrag als PDF</li>
                    <li>Der Vertrag ist in Ihrem Dashboard verfügbar</li>
                    <li>Nach Fertigstellung der Immobilie wird der Notarvertrag erstellt</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                {existingContract?.contractPdfUrl && (
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={existingContract.contractPdfUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Vertrag herunterladen
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowWithdrawalDialog(true)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Widerruf einreichen
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => navigate("/dashboard/contracts")}
                className="bg-[#C4A052] hover:bg-[#B39142]"
              >
                Zu meinen Verträgen
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Signature Dialog */}
        <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Vertrag unterschreiben</DialogTitle>
              <DialogDescription>
                Mit Ihrer Unterschrift bestätigen Sie, dass Sie den Vorvertrag gelesen haben und alle Bedingungen akzeptieren.
              </DialogDescription>
            </DialogHeader>
            <SignaturePad
              onSave={handleSignContract}
              onCancel={() => setShowSignatureDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Withdrawal Dialog */}
        <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Widerruf einreichen</DialogTitle>
              <DialogDescription>
                Sind Sie sicher, dass Sie den Vertrag widerrufen möchten? Die Anzahlung wird vollständig zurückerstattet.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Grund für den Widerruf</Label>
                <Textarea
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  placeholder="Bitte geben Sie einen Grund an..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWithdrawalDialog(false)}>
                Abbrechen
              </Button>
              <Button
                variant="destructive"
                onClick={handleWithdrawal}
                disabled={!withdrawalReason.trim() || requestWithdrawalMutation.isPending}
              >
                {requestWithdrawalMutation.isPending ? "Wird eingereicht..." : "Widerruf bestätigen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
