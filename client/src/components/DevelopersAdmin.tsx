import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, Plus, Pencil, Trash2, Search, Percent, CreditCard, FileText, X } from "lucide-react";

interface Developer {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  defaultMarginPercent: string | null;
  fixedMarginAmount: string | null;
  marginType: "percentage" | "fixed" | "both" | null;
  defaultDownPaymentPercent: string | null;
  allowInstallments: boolean | null;
  maxInstallmentMonths: number | null;
  defaultInterestRate: string | null;
  minInterestRate: string | null;
  maxInterestRate: string | null;
  defaultContractLanguage: "de" | "en" | "ka" | null;
  specialContractClauses: string | null;
  warrantyMonths: number | null;
  defaultServices: number[] | null;
  commissionRate: string | null;
  internalNotes: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const emptyDeveloper: Partial<Developer> = {
  name: "",
  code: "",
  description: "",
  logoUrl: "",
  website: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  city: "",
  country: "Georgien",
  defaultMarginPercent: "15.00",
  fixedMarginAmount: "",
  marginType: "percentage",
  defaultDownPaymentPercent: "30.00",
  allowInstallments: true,
  maxInstallmentMonths: 36,
  defaultInterestRate: "6.00",
  minInterestRate: "4.00",
  maxInterestRate: "12.00",
  defaultContractLanguage: "de",
  specialContractClauses: "",
  warrantyMonths: 24,
  defaultServices: [],
  commissionRate: "",
  internalNotes: "",
  isActive: true,
};

export function DevelopersAdmin() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Partial<Developer> | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "payment" | "contract">("basic");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDevelopers();
  }, []);

  const loadDevelopers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/trpc/developers.getAll");
      const data = await res.json();
      if (data.result?.data?.json) {
        setDevelopers(data.result.data.json);
      }
    } catch (error) {
      console.error("Failed to load developers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDeveloper({ ...emptyDeveloper });
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleEdit = (developer: Developer) => {
    setEditingDeveloper({ ...developer });
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingDeveloper?.name) {
      alert("Name ist erforderlich");
      return;
    }

    setIsSaving(true);
    try {
      const endpoint = editingDeveloper.id 
        ? "/api/trpc/developers.update"
        : "/api/trpc/developers.create";

      // Clean up empty strings - convert to undefined so they're not sent
      const cleanedData = Object.fromEntries(
        Object.entries(editingDeveloper).map(([key, value]) => {
          // Keep non-string values as-is
          if (typeof value !== 'string') return [key, value];
          // Convert empty strings to undefined
          if (value === '') return [key, undefined];
          return [key, value];
        }).filter(([_, value]) => value !== undefined)
      );

      console.log("Saving developer:", cleanedData);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: cleanedData }),
      });

      const data = await res.json();
      console.log("Response:", data);
      
      if (data.result?.data?.json?.success) {
        alert(editingDeveloper.id ? "Bauträger aktualisiert" : "Bauträger erstellt");
        setShowModal(false);
        loadDevelopers();
      } else if (data.error) {
        const errorMsg = data.error?.message || JSON.stringify(data.error);
        console.error("API Error:", errorMsg);
        throw new Error(errorMsg);
      } else {
        throw new Error("Unbekannter Fehler beim Speichern");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Save error:", errorMsg);
      alert(`Fehler beim Speichern: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bauträger wirklich deaktivieren?")) return;

    try {
      const res = await fetch("/api/trpc/developers.delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { id } }),
      });

      const data = await res.json();
      if (data.result?.data?.json?.success) {
        alert("Bauträger deaktiviert");
        loadDevelopers();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Fehler beim Löschen");
    }
  };

  const filteredDevelopers = developers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.code && d.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.city && d.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const updateField = (field: string, value: any) => {
    setEditingDeveloper(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-600" />
            Bauträger-Vorlagen
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Verwalten Sie Bauträger mit Standardeinstellungen für Marge und Zahlungsbedingungen
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4 mr-2" />
          Neuer Bauträger
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Suchen nach Name, Code oder Stadt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-800">{developers.length}</div>
            <div className="text-sm text-amber-600">Gesamt</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-800">
              {developers.filter(d => d.isActive).length}
            </div>
            <div className="text-sm text-green-600">Aktiv</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-800">
              {developers.filter(d => d.allowInstallments).length}
            </div>
            <div className="text-sm text-blue-600">Mit Ratenzahlung</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-800">
              {developers.length > 0 
                ? (developers.reduce((sum, d) => sum + parseFloat(d.defaultMarginPercent || "0"), 0) / developers.length).toFixed(1)
                : "0"}%
            </div>
            <div className="text-sm text-purple-600">Ø Marge</div>
          </CardContent>
        </Card>
      </div>

      {/* Developer List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Laden...</div>
      ) : filteredDevelopers.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {searchTerm ? "Keine Bauträger gefunden" : "Noch keine Bauträger angelegt"}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreate} variant="outline" className="mt-4">
              Ersten Bauträger anlegen
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDevelopers.map((developer) => (
            <Card key={developer.id} className={`transition-all hover:shadow-md ${!developer.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {developer.logoUrl ? (
                      <img 
                        src={developer.logoUrl} 
                        alt={developer.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-amber-600" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{developer.name}</h3>
                        {developer.code && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {developer.code}
                          </span>
                        )}
                        {!developer.isActive && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                            Inaktiv
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {developer.city && `${developer.city}, `}{developer.country || "Georgien"}
                      </div>
                      {developer.contactEmail && (
                        <div className="text-sm text-gray-500">{developer.contactEmail}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Pricing Info */}
                    <div className="flex items-center gap-1 text-sm">
                      <Percent className="w-4 h-4 text-amber-600" />
                      <span className="font-medium">{developer.defaultMarginPercent || "15"}%</span>
                      <span className="text-gray-500">Marge</span>
                    </div>

                    {/* Payment Info */}
                    <div className="flex items-center gap-1 text-sm">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{developer.defaultDownPaymentPercent || "30"}%</span>
                      <span className="text-gray-500">Anzahlung</span>
                    </div>

                    {developer.allowInstallments && (
                      <div className="flex items-center gap-1 text-sm">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-gray-500">
                          bis {developer.maxInstallmentMonths || 36} Mon.
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(developer)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(developer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              {editingDeveloper?.id ? "Bauträger bearbeiten" : "Neuer Bauträger"}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 border-b pb-2">
            {[
              { id: "basic", label: "Grunddaten", icon: Building2 },
              { id: "pricing", label: "Preise & Marge", icon: Percent },
              { id: "payment", label: "Zahlungen", icon: CreditCard },
              { id: "contract", label: "Vertrag", icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-amber-100 text-amber-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4 py-4">
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={editingDeveloper?.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="z.B. Archi Group"
                    />
                  </div>
                  <div>
                    <Label>Kurzcode</Label>
                    <Input
                      value={editingDeveloper?.code || ""}
                      onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                      placeholder="z.B. ARCHI"
                      maxLength={50}
                    />
                  </div>
                </div>

                <div>
                  <Label>Beschreibung</Label>
                  <Textarea
                    value={editingDeveloper?.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Kurze Beschreibung des Bauträgers..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Logo URL</Label>
                    <Input
                      value={editingDeveloper?.logoUrl || ""}
                      onChange={(e) => updateField("logoUrl", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={editingDeveloper?.website || ""}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Kontaktdaten</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ansprechpartner</Label>
                      <Input
                        value={editingDeveloper?.contactPerson || ""}
                        onChange={(e) => updateField("contactPerson", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>E-Mail</Label>
                      <Input
                        type="email"
                        value={editingDeveloper?.contactEmail || ""}
                        onChange={(e) => updateField("contactEmail", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Telefon</Label>
                      <Input
                        value={editingDeveloper?.contactPhone || ""}
                        onChange={(e) => updateField("contactPhone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Stadt</Label>
                      <Input
                        value={editingDeveloper?.city || ""}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="z.B. Tiflis"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Adresse</Label>
                    <Textarea
                      value={editingDeveloper?.address || ""}
                      onChange={(e) => updateField("address", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Switch
                    checked={editingDeveloper?.isActive ?? true}
                    onCheckedChange={(checked) => updateField("isActive", checked)}
                  />
                  <Label>Aktiv</Label>
                </div>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-4">
                <div>
                  <Label>Margentyp</Label>
                  <Select
                    value={editingDeveloper?.marginType || "percentage"}
                    onValueChange={(value) => updateField("marginType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Prozentual</SelectItem>
                      <SelectItem value="fixed">Festbetrag</SelectItem>
                      <SelectItem value="both">Beides (Prozent + Festbetrag)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Standard-Marge (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingDeveloper?.defaultMarginPercent || "15.00"}
                      onChange={(e) => updateField("defaultMarginPercent", e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Wird auf den Einkaufspreis aufgeschlagen
                    </p>
                  </div>
                  <div>
                    <Label>Festbetrag-Marge (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingDeveloper?.fixedMarginAmount || ""}
                      onChange={(e) => updateField("fixedMarginAmount", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <Label>Provision (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingDeveloper?.commissionRate || ""}
                    onChange={(e) => updateField("commissionRate", e.target.value)}
                    placeholder="z.B. 3.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ihre Provision bei Verkauf
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">Beispielrechnung</h4>
                  <p className="text-sm text-amber-700">
                    Einkaufspreis: 100.000 € → Verkaufspreis: {" "}
                    {(100000 * (1 + parseFloat(editingDeveloper?.defaultMarginPercent || "15") / 100) + parseFloat(editingDeveloper?.fixedMarginAmount || "0")).toLocaleString("de-DE")} €
                  </p>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-4">
                <div>
                  <Label>Mindest-Anzahlung (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingDeveloper?.defaultDownPaymentPercent || "30.00"}
                    onChange={(e) => updateField("defaultDownPaymentPercent", e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingDeveloper?.allowInstallments ?? true}
                    onCheckedChange={(checked) => updateField("allowInstallments", checked)}
                  />
                  <Label>Ratenzahlung erlauben</Label>
                </div>

                {editingDeveloper?.allowInstallments && (
                  <>
                    <div>
                      <Label>Max. Laufzeit (Monate)</Label>
                      <Input
                        type="number"
                        value={editingDeveloper?.maxInstallmentMonths || 36}
                        onChange={(e) => updateField("maxInstallmentMonths", parseInt(e.target.value))}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Standard-Zinssatz (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingDeveloper?.defaultInterestRate || "6.00"}
                          onChange={(e) => updateField("defaultInterestRate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Min. Zinssatz (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingDeveloper?.minInterestRate || "4.00"}
                          onChange={(e) => updateField("minInterestRate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Max. Zinssatz (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingDeveloper?.maxInterestRate || "12.00"}
                          onChange={(e) => updateField("maxInterestRate", e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "contract" && (
              <div className="space-y-4">
                <div>
                  <Label>Vertragssprache</Label>
                  <Select
                    value={editingDeveloper?.defaultContractLanguage || "de"}
                    onValueChange={(value) => updateField("defaultContractLanguage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">Englisch</SelectItem>
                      <SelectItem value="ka">Georgisch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Garantiezeit (Monate)</Label>
                  <Input
                    type="number"
                    value={editingDeveloper?.warrantyMonths || 24}
                    onChange={(e) => updateField("warrantyMonths", parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Spezielle Vertragsklauseln</Label>
                  <Textarea
                    value={editingDeveloper?.specialContractClauses || ""}
                    onChange={(e) => updateField("specialContractClauses", e.target.value)}
                    placeholder="Zusätzliche Klauseln für Verträge mit diesem Bauträger..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Interne Notizen</Label>
                  <Textarea
                    value={editingDeveloper?.internalNotes || ""}
                    onChange={(e) => updateField("internalNotes", e.target.value)}
                    placeholder="Nur für interne Zwecke sichtbar..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSaving ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
