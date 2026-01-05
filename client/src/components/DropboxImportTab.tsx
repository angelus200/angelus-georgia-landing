import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Cloud, Loader2, CheckCircle2, XCircle, X } from "lucide-react";

export function DropboxImportTab() {
  const [dropboxLink, setDropboxLink] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const utils = trpc.useUtils();
  const importMutation = trpc.propertyDrafts.importFromDropbox.useMutation({
    onSuccess: (result) => {
      setImportResults(result);
      setShowResults(true);
      utils.propertyDrafts.getAll.invalidate();
      if (result.success) {
        toast.success(`${result.draftIds.length} Immobilien erfolgreich importiert`);
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const handleImport = async () => {
    if (!dropboxLink.trim()) {
      toast.error("Bitte geben Sie einen Dropbox-Link ein");
      return;
    }

    setIsImporting(true);
    try {
      await importMutation.mutateAsync({
        dropboxLink: dropboxLink.trim(),
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showResults ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#C4A052]" />
              Dropbox Ordner Import
            </CardTitle>
            <CardDescription>
              Importieren Sie Immobiliendaten direkt aus einem Dropbox-Ordner. Der Ordner sollte CSV/Excel-Dateien und Bilder enthalten.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Ordnerstruktur:</h4>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li><strong>CSV/Excel-Datei</strong> mit Immobiliendaten (Titel, Beschreibung, Preis, etc.)</li>
                <li><strong>Bilder-Ordner</strong> mit JPG/PNG-Dateien (10-20 Bilder pro Immobilie)</li>
                <li><strong>Optional:</strong> PDF-Dateien für Dokumente</li>
              </ul>
            </div>

            {/* Dropbox Link Input */}
            <div className="space-y-2">
              <Label htmlFor="dropboxLink">Dropbox Ordner Link</Label>
              <Input
                id="dropboxLink"
                placeholder="https://www.dropbox.com/sh/xxxxx?dl=0"
                value={dropboxLink}
                onChange={(e) => setDropboxLink(e.target.value)}
                disabled={isImporting}
              />
              <p className="text-xs text-gray-500">
                Kopieren Sie den Link aus Dropbox (Ordner teilen → Link kopieren)
              </p>
            </div>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={isImporting || !dropboxLink.trim()}
              className="w-full bg-[#C4A052] hover:bg-[#B39142]"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importiere...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 mr-2" />
                  Aus Dropbox importieren
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : importResults ? (
        <div className="space-y-4">
          {/* Results Summary */}
          <Card className={importResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {importResults.success ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <h3 className={`font-semibold ${importResults.success ? "text-green-900" : "text-red-900"}`}>
                    {importResults.message}
                  </h3>
                  {importResults.success && (
                    <p className="text-sm text-green-700">
                      {importResults.draftIds.length} Immobilien-Entwürfe erstellt
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {importResults.errors && importResults.errors.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900 text-base">Fehler während des Imports</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {importResults.errors.map((error: string, idx: number) => (
                    <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                      <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowResults(false);
                setDropboxLink("");
                setImportResults(null);
              }}
              className="flex-1"
            >
              Neuer Import
            </Button>
            <Button
              onClick={() => setShowResults(false)}
              className="flex-1 bg-[#C4A052] hover:bg-[#B39142]"
            >
              Zu Entwürfen
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
