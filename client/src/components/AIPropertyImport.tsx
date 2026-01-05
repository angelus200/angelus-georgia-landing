import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { DropboxImportTab } from "./DropboxImportTab";
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  Check, 
  X, 
  Eye, 
  Edit, 
  Trash2,
  Building2,
  MapPin,
  Euro,
  Calendar,
  Home,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  FileUp,
  Cloud
} from "lucide-react";

interface ExtractedData {
  title?: string;
  description?: string;
  longDescription?: string;
  location?: string;
  city?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  propertyType?: string;
  constructionStatus?: string;
  completionDate?: string;
  originalPrice?: number;
  pricePerSqm?: number;
  features?: string[];
  amenities?: string[];
  developerName?: string;
  expectedReturn?: number;
  rentalGuarantee?: boolean;
  rentalGuaranteePercent?: number;
  confidence?: number;
}

interface PropertyDraft {
  id: number;
  status: string;
  developerName?: string | null;
  title?: string | null;
  description?: string | null;
  location?: string | null;
  city?: string | null;
  originalPrice?: string | null;
  sellingPrice?: string | null;
  area?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertyType?: string | null;
  constructionStatus?: string | null;
  mainImage?: string | null;
  images?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function AIPropertyImport() {
  const [activeTab, setActiveTab] = useState("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [developerName, setDeveloperName] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [editingDraft, setEditingDraft] = useState<PropertyDraft | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: drafts, isLoading: draftsLoading } = trpc.propertyDrafts.getAll.useQuery();
  
  const createDraftMutation = trpc.propertyDrafts.create.useMutation({
    onSuccess: () => {
      utils.propertyDrafts.getAll.invalidate();
      toast.success("Entwurf erfolgreich erstellt");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const updateDraftMutation = trpc.propertyDrafts.update.useMutation({
    onSuccess: () => {
      utils.propertyDrafts.getAll.invalidate();
      toast.success("Entwurf aktualisiert");
      setShowEditDialog(false);
      setEditingDraft(null);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const deleteDraftMutation = trpc.propertyDrafts.delete.useMutation({
    onSuccess: () => {
      utils.propertyDrafts.getAll.invalidate();
      toast.success("Entwurf gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const submitForReviewMutation = trpc.propertyDrafts.submitForReview.useMutation({
    onSuccess: () => {
      utils.propertyDrafts.getAll.invalidate();
      toast.success("Zur Prüfung eingereicht");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const approveMutation = trpc.propertyDrafts.approve.useMutation({
    onSuccess: (result) => {
      utils.propertyDrafts.getAll.invalidate();
      if (result.success) {
        toast.success(`Immobilie erstellt (ID: ${result.propertyId})`);
      } else {
        toast.error(result.error || "Fehler bei der Genehmigung");
      }
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const rejectMutation = trpc.propertyDrafts.reject.useMutation({
    onSuccess: () => {
      utils.propertyDrafts.getAll.invalidate();
      toast.success("Entwurf abgelehnt");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const analyzeDocumentMutation = trpc.propertyDrafts.analyzeDocument.useMutation();
  const analyzeImagesMutation = trpc.propertyDrafts.analyzeImages.useMutation();

  const resetForm = () => {
    setUploadedFiles([]);
    setUploadedImages([]);
    setDeveloperName("");
    setAdditionalContext("");
    setExtractedData(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const readFileAsText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      
      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
      } else {
        // For PDFs and other binary files, we'll send the base64 content
        reader.readAsDataURL(file);
      }
    });
  };

  const uploadImageToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.url;
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0 && uploadedImages.length === 0) {
      toast.error("Bitte laden Sie mindestens ein Dokument oder Bild hoch");
      return;
    }

    setIsAnalyzing(true);
    let combinedData: ExtractedData = {};

    try {
      // Analyze documents
      for (const file of uploadedFiles) {
        const content = await readFileAsText(file);
        const docType = file.type.includes('pdf') ? 'pdf' : 
                       file.type.includes('word') ? 'word' : 'text';
        
        const result = await analyzeDocumentMutation.mutateAsync({
          documentContent: content,
          documentType: docType,
          additionalContext: `Bauträger: ${developerName}\n${additionalContext}`,
        });

        if (result.success && result.data) {
          combinedData = { ...combinedData, ...result.data };
        }
      }

      // Analyze images if any
      if (uploadedImages.length > 0) {
        const imageUrls: string[] = [];
        for (const img of uploadedImages) {
          try {
            const url = await uploadImageToS3(img);
            imageUrls.push(url);
          } catch (e) {
            console.error('Failed to upload image:', e);
          }
        }

        if (imageUrls.length > 0) {
          const imageResult = await analyzeImagesMutation.mutateAsync({
            imageUrls,
            additionalContext: `Bauträger: ${developerName}\n${additionalContext}`,
          });

          if (imageResult.success && imageResult.data) {
            // Merge image analysis data
            if (imageResult.data.features) {
              combinedData.features = [
                ...(combinedData.features || []),
                ...imageResult.data.features
              ];
            }
            if (imageResult.data.amenities) {
              combinedData.amenities = [
                ...(combinedData.amenities || []),
                ...imageResult.data.amenities
              ];
            }
            if (!combinedData.constructionStatus && imageResult.data.constructionStatus) {
              combinedData.constructionStatus = imageResult.data.constructionStatus;
            }
          }
        }
      }

      combinedData.developerName = developerName;
      setExtractedData(combinedData);
      toast.success("Analyse abgeschlossen");
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Fehler bei der Analyse");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!extractedData) {
      toast.error("Bitte führen Sie zuerst eine Analyse durch");
      return;
    }

    // Upload images to S3 and get URLs
    const imageUrls: string[] = [];
    let mainImageUrl = "";

    for (let i = 0; i < uploadedImages.length; i++) {
      try {
        const url = await uploadImageToS3(uploadedImages[i]);
        if (i === 0) {
          mainImageUrl = url;
        }
        imageUrls.push(url);
      } catch (e) {
        console.error('Failed to upload image:', e);
      }
    }

    createDraftMutation.mutate({
      developerName: extractedData.developerName,
      title: extractedData.title,
      description: extractedData.description,
      longDescription: extractedData.longDescription,
      location: extractedData.location,
      city: extractedData.city,
      originalPrice: extractedData.originalPrice?.toString(),
      area: extractedData.area?.toString(),
      bedrooms: extractedData.bedrooms,
      bathrooms: extractedData.bathrooms,
      propertyType: extractedData.propertyType as any,
      constructionStatus: extractedData.constructionStatus as any,
      completionDate: extractedData.completionDate,
      mainImage: mainImageUrl,
      images: JSON.stringify(imageUrls),
      features: JSON.stringify(extractedData.features || []),
      amenities: JSON.stringify(extractedData.amenities || []),
      expectedReturn: extractedData.expectedReturn?.toString(),
      rentalGuarantee: extractedData.rentalGuarantee,
      rentalGuaranteePercent: extractedData.rentalGuaranteePercent?.toString(),
      extractedData: JSON.stringify(extractedData),
      status: "draft",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Verarbeitung</Badge>;
      case "draft":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Edit className="w-3 h-3 mr-1" />Entwurf</Badge>;
      case "pending_review":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Zur Prüfung</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Genehmigt</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Abgelehnt</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (value: string | number | undefined) => {
    if (!value) return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(num);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            KI-Import
          </TabsTrigger>
          <TabsTrigger value="dropbox" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Dropbox
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Entwürfe ({drafts?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Upload & Analysis Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C4A052]" />
                KI-gestützte Immobilien-Erfassung
              </CardTitle>
              <CardDescription>
                Laden Sie Bauträger-Unterlagen hoch und lassen Sie die KI automatisch alle relevanten Daten extrahieren
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Developer Name */}
              <div className="space-y-2">
                <Label htmlFor="developerName">Bauträger / Entwickler</Label>
                <Input
                  id="developerName"
                  placeholder="z.B. ABC Development GmbH"
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                />
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <Label>Dokumente hochladen (PDF, Word, Text)</Label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#C4A052] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Klicken oder Dateien hierher ziehen
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOCX, TXT unterstützt
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadedFiles.map((file, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {file.name}
                        <button onClick={() => removeFile(index)} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Bilder hochladen</Label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#C4A052] transition-colors"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Immobilienbilder hochladen
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WebP unterstützt
                  </p>
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Context */}
              <div className="space-y-2">
                <Label htmlFor="context">Zusätzlicher Kontext (optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Weitere Informationen zur Immobilie..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (uploadedFiles.length === 0 && uploadedImages.length === 0)}
                className="w-full bg-[#C4A052] hover:bg-[#B39142]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analysiere mit KI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Mit KI analysieren
                  </>
                )}
              </Button>

              {/* Extracted Data Preview */}
              {extractedData && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      Extrahierte Daten
                      {extractedData.confidence && (
                        <Badge variant="secondary" className="ml-2">
                          {Math.round(extractedData.confidence * 100)}% Konfidenz
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Titel:</strong> {extractedData.title || "-"}
                      </div>
                      <div>
                        <strong>Bauträger:</strong> {extractedData.developerName || "-"}
                      </div>
                      <div>
                        <strong>Standort:</strong> {extractedData.location || "-"}, {extractedData.city || "-"}
                      </div>
                      <div>
                        <strong>Preis:</strong> {formatCurrency(extractedData.originalPrice)}
                      </div>
                      <div>
                        <strong>Fläche:</strong> {extractedData.area ? `${extractedData.area} m²` : "-"}
                      </div>
                      <div>
                        <strong>Zimmer:</strong> {extractedData.bedrooms || "-"} Schlafzimmer, {extractedData.bathrooms || "-"} Bäder
                      </div>
                      <div>
                        <strong>Typ:</strong> {extractedData.propertyType || "-"}
                      </div>
                      <div>
                        <strong>Baustatus:</strong> {extractedData.constructionStatus || "-"}
                      </div>
                      {extractedData.features && extractedData.features.length > 0 && (
                        <div className="col-span-2">
                          <strong>Ausstattung:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {extractedData.features.map((f, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={handleCreateDraft}
                        disabled={createDraftMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {createDraftMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Als Entwurf speichern
                      </Button>
                      <Button variant="outline" onClick={resetForm}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Zurücksetzen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dropbox Import Tab */}
        <TabsContent value="dropbox" className="space-y-6">
          <DropboxImportTab />
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-4">
          {draftsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#C4A052]" />
              <p className="mt-2 text-gray-500">Lade Entwürfe...</p>
            </div>
          ) : drafts && drafts.length > 0 ? (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <Card key={draft.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(draft.status)}
                          <span className="text-sm text-gray-500">
                            #{draft.id}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">
                          {draft.title || "Unbenannte Immobilie"}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          {draft.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {draft.location}, {draft.city}
                            </span>
                          )}
                          {draft.originalPrice && (
                            <span className="flex items-center gap-1">
                              <Euro className="w-4 h-4" />
                              {formatCurrency(draft.originalPrice)}
                            </span>
                          )}
                          {draft.area && (
                            <span className="flex items-center gap-1">
                              <Home className="w-4 h-4" />
                              {draft.area} m²
                            </span>
                          )}
                        </div>
                        {draft.developerName && (
                          <p className="text-sm text-gray-500 mt-1">
                            Bauträger: {draft.developerName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {draft.status === "draft" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingDraft(draft);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-orange-500 hover:bg-orange-600"
                              onClick={() => submitForReviewMutation.mutate({ id: draft.id })}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Zur Prüfung
                            </Button>
                          </>
                        )}
                        {draft.status === "pending_review" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveMutation.mutate({ id: draft.id, reviewedBy: 1 })}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Genehmigen
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt("Ablehnungsgrund:");
                                if (reason) {
                                  rejectMutation.mutate({ id: draft.id, reviewedBy: 1, reason });
                                }
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Ablehnen
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            if (confirm("Entwurf wirklich löschen?")) {
                              deleteDraftMutation.mutate({ id: draft.id });
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
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Noch keine Entwürfe vorhanden</p>
                <p className="text-sm text-gray-400 mt-1">
                  Laden Sie Dokumente hoch und lassen Sie die KI Immobiliendaten extrahieren
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Draft Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Entwurf bearbeiten</DialogTitle>
            <DialogDescription>
              Passen Sie die extrahierten Daten an und legen Sie Verkaufspreise fest
            </DialogDescription>
          </DialogHeader>
          {editingDraft && (
            <DraftEditForm
              draft={editingDraft}
              onSave={(data) => {
                updateDraftMutation.mutate({ id: editingDraft.id, ...data });
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setEditingDraft(null);
              }}
              isSaving={updateDraftMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Draft Edit Form Component
function DraftEditForm({
  draft,
  onSave,
  onCancel,
  isSaving
}: {
  draft: PropertyDraft;
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    title: draft.title || "",
    description: draft.description || "",
    location: draft.location || "",
    city: draft.city || "",
    originalPrice: draft.originalPrice || "",
    sellingPrice: draft.sellingPrice || "",
    area: draft.area || "",
    bedrooms: draft.bedrooms || 0,
    bathrooms: draft.bathrooms || 0,
    propertyType: draft.propertyType || "apartment",
    constructionStatus: draft.constructionStatus || "planning",
    minDownPayment: "30",
    maxInstallmentMonths: 36,
    installmentInterestRate: "6",
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      maxInstallmentMonths: Number(formData.maxInstallmentMonths),
    });
  };

  // Calculate price per sqm
  const pricePerSqm = formData.sellingPrice && formData.area
    ? (parseFloat(formData.sellingPrice) / parseFloat(formData.area)).toFixed(2)
    : "";

  // Calculate margin
  const margin = formData.originalPrice && formData.sellingPrice
    ? ((parseFloat(formData.sellingPrice) - parseFloat(formData.originalPrice)) / parseFloat(formData.originalPrice) * 100).toFixed(1)
    : "";

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Titel</Label>
          <Input
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Immobilientitel"
          />
        </div>
        <div className="col-span-2">
          <Label>Beschreibung</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <Label>Standort</Label>
          <Input
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </div>
        <div>
          <Label>Stadt</Label>
          <Input
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>
      </div>

      {/* Pricing */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Euro className="w-5 h-5 text-amber-600" />
            Preisgestaltung
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label>Originalpreis (Bauträger)</Label>
            <Input
              type="number"
              value={formData.originalPrice}
              onChange={(e) => handleChange("originalPrice", e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Verkaufspreis</Label>
            <Input
              type="number"
              value={formData.sellingPrice}
              onChange={(e) => handleChange("sellingPrice", e.target.value)}
              placeholder="0.00"
              className="border-amber-300 focus:border-amber-500"
            />
          </div>
          <div>
            <Label>Marge</Label>
            <Input
              value={margin ? `${margin}%` : "-"}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label>Fläche (m²)</Label>
            <Input
              type="number"
              value={formData.area}
              onChange={(e) => handleChange("area", e.target.value)}
            />
          </div>
          <div>
            <Label>Preis/m²</Label>
            <Input
              value={pricePerSqm ? `${parseFloat(pricePerSqm).toLocaleString("de-DE")} €` : "-"}
              disabled
              className="bg-gray-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Zahlungsoptionen
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label>Min. Anzahlung (%)</Label>
            <Input
              type="number"
              value={formData.minDownPayment}
              onChange={(e) => handleChange("minDownPayment", e.target.value)}
            />
          </div>
          <div>
            <Label>Max. Ratenlaufzeit (Monate)</Label>
            <Input
              type="number"
              value={formData.maxInstallmentMonths}
              onChange={(e) => handleChange("maxInstallmentMonths", e.target.value)}
            />
          </div>
          <div>
            <Label>Zinssatz (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.installmentInterestRate}
              onChange={(e) => handleChange("installmentInterestRate", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label>Schlafzimmer</Label>
          <Input
            type="number"
            value={formData.bedrooms}
            onChange={(e) => handleChange("bedrooms", e.target.value)}
          />
        </div>
        <div>
          <Label>Badezimmer</Label>
          <Input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => handleChange("bathrooms", e.target.value)}
          />
        </div>
        <div>
          <Label>Immobilientyp</Label>
          <Select value={formData.propertyType} onValueChange={(v) => handleChange("propertyType", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Wohnung</SelectItem>
              <SelectItem value="house">Haus</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="commercial">Gewerbe</SelectItem>
              <SelectItem value="land">Grundstück</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Baustatus</Label>
          <Select value={formData.constructionStatus} onValueChange={(v) => handleChange("constructionStatus", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planung</SelectItem>
              <SelectItem value="foundation">Fundament</SelectItem>
              <SelectItem value="structure">Rohbau</SelectItem>
              <SelectItem value="finishing">Ausbau</SelectItem>
              <SelectItem value="completed">Fertiggestellt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving} className="bg-[#C4A052] hover:bg-[#B39142]">
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          Speichern
        </Button>
      </DialogFooter>
    </div>
  );
}

export default AIPropertyImport;
