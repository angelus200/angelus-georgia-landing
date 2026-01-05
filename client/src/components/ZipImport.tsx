import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Loader2, Upload, FileArchive } from 'lucide-react';
import { toast } from 'sonner';

interface ImportResult {
  folderName: string;
  successCount: number;
  failureCount: number;
  results: Array<{
    success: boolean;
    message: string;
    propertyDraftId?: string;
    errors?: string[];
  }>;
}

interface Developer {
  id: string;
  name: string;
}

export function ZipImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('');
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Load developers on mount
  useState(() => {
    loadDevelopers();
  }, []);

  async function loadDevelopers() {
    try {
      const response = await fetch('/api/developers');
      const data = await response.json();
      setDevelopers(data);
    } catch (error) {
      console.error('Failed to load developers:', error);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast.error('Bitte wählen Sie eine ZIP-Datei');
      return;
    }

    if (file.size > 1024 * 1024 * 1024) { // 1GB
      toast.error('Datei ist zu groß (max. 1 GB)');
      return;
    }

    setSelectedFile(file);
    toast.success(`Datei ausgewählt: ${file.name}`);
  }

  async function handleImport() {
    if (!selectedFile) {
      toast.error('Bitte wählen Sie eine ZIP-Datei');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedDeveloper) {
        formData.append('developerId', selectedDeveloper);
      }

      const response = await fetch('/api/zip-import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Import fehlgeschlagen');
      }

      const data = await response.json();
      setImportResults(data.results || []);
      setShowResults(true);

      const totalSuccess = data.results.reduce((sum: number, r: ImportResult) => sum + r.successCount, 0);
      const totalFailure = data.results.reduce((sum: number, r: ImportResult) => sum + r.failureCount, 0);

      if (totalFailure === 0) {
        toast.success(`${totalSuccess} Immobilien erfolgreich importiert`);
      } else {
        toast.warning(`${totalSuccess} erfolgreich, ${totalFailure} fehlgeschlagen`);
      }

      setSelectedFile(null);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Import fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="w-5 h-5" />
            ZIP-Datei hochladen
          </CardTitle>
          <CardDescription>
            Laden Sie eine ZIP-Datei mit Ordnern hoch. Jeder Ordner sollte enthalten: daten.xlsx, bilder/ Ordner und optional ein PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
              id="zip-file-input"
            />
            <label htmlFor="zip-file-input" className="cursor-pointer block">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">ZIP-Datei auswählen</p>
              <p className="text-sm text-muted-foreground">oder hier ablegen</p>
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </label>
          </div>

          {/* Developer Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Bauträger (optional)</label>
            <Select value={selectedDeveloper} onValueChange={setSelectedDeveloper}>
              <SelectTrigger>
                <SelectValue placeholder="Bauträger auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keine Vorlage</SelectItem>
                {developers.map((dev) => (
                  <SelectItem key={dev.id} value={dev.id}>
                    {dev.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={isLoading || !selectedFile}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importiere...
              </>
            ) : (
              'Importieren'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import Results */}
      {showResults && importResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import-Ergebnisse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {importResults.map((result, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{result.folderName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {result.successCount} erfolgreich, {result.failureCount} fehlgeschlagen
                    </p>
                  </div>
                  {result.failureCount === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  )}
                </div>

                {result.results.some((r) => !r.success) && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    <h5 className="font-medium text-red-900 mb-2">Fehler:</h5>
                    <ul className="space-y-1">
                      {result.results
                        .filter((r) => !r.success)
                        .map((r, i) => (
                          <li key={i} className="text-red-800">
                            • {r.message}
                            {r.errors && r.errors.length > 0 && (
                              <ul className="ml-4 mt-1">
                                {r.errors.map((e, j) => (
                                  <li key={j} className="text-red-700">
                                    - {e}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
