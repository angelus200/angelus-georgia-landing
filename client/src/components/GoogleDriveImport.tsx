import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, Loader2, Cloud } from 'lucide-react';
import { toast } from 'sonner';

interface Folder {
  id: string;
  name: string;
}

interface ImportResult {
  folderName: string;
  totalFiles: number;
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

export function GoogleDriveImport() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('');
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
    loadDevelopers();
  }, []);

  async function checkAuthStatus() {
    try {
      const response = await fetch('/api/google-drive/status');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        loadFolders();
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  }

  async function loadDevelopers() {
    try {
      const response = await fetch('/api/developers');
      const data = await response.json();
      setDevelopers(data);
    } catch (error) {
      console.error('Failed to load developers:', error);
    }
  }

  async function loadFolders() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/google-drive/folders');
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
      toast.error('Fehler beim Laden der Ordner');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAuthenticate() {
    try {
      const response = await fetch('/api/google-drive/auth-url');
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      toast.error('Authentifizierung fehlgeschlagen');
    }
  }

  function toggleFolder(folderId: string) {
    const newSelected = new Set(selectedFolders);
    if (newSelected.has(folderId)) {
      newSelected.delete(folderId);
    } else {
      newSelected.add(folderId);
    }
    setSelectedFolders(newSelected);
  }

  async function handleImport() {
    if (selectedFolders.size === 0) {
      toast.error('Bitte wählen Sie mindestens einen Ordner');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/google-drive/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderIds: Array.from(selectedFolders),
          developerId: selectedDeveloper || undefined,
        }),
      });

      const data = await response.json();
      setImportResults(data);
      setShowResults(true);

      const totalSuccess = data.reduce((sum: number, r: ImportResult) => sum + r.successCount, 0);
      const totalFailure = data.reduce((sum: number, r: ImportResult) => sum + r.failureCount, 0);

      if (totalFailure === 0) {
        toast.success(`${totalSuccess} Immobilien erfolgreich importiert`);
      } else {
        toast.warning(`${totalSuccess} erfolgreich, ${totalFailure} fehlgeschlagen`);
      }

      setSelectedFolders(new Set());
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Import fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Google Drive Verbindung
          </CardTitle>
          <CardDescription>
            Verbinden Sie Ihr Google Drive Konto um Immobilien zu importieren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAuthenticate} size="lg">
            Mit Google Drive verbinden
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Sie werden zu Google weitergeleitet um die Verbindung zu autorisieren.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Folder Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Ordner auswählen</CardTitle>
          <CardDescription>
            Wählen Sie die Ordner aus Google Drive, die Sie importieren möchten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : folders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Ordner gefunden. Erstellen Sie einen Ordner "Angelus-Immobilien" in Google Drive.
            </p>
          ) : (
            <div className="space-y-3">
              {folders.map((folder) => (
                <div key={folder.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedFolders.has(folder.id)}
                    onCheckedChange={() => toggleFolder(folder.id)}
                  />
                  <label className="text-sm font-medium cursor-pointer flex-1">
                    {folder.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Developer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Bauträger (optional)</CardTitle>
          <CardDescription>
            Wählen Sie einen Bauträger um Standardeinstellungen anzuwenden
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Import Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleImport}
          disabled={isLoading || selectedFolders.size === 0}
          size="lg"
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
        <Button
          variant="outline"
          onClick={loadFolders}
          disabled={isLoading}
        >
          Aktualisieren
        </Button>
      </div>

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
