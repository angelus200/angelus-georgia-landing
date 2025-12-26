# Admin-Zugang zur Angelus Management Georgia Plattform

## Anmeldung für Administratoren

### Empfohlene Methode: Manus OAuth

Die sicherste und zuverlässigste Methode für den Admin-Zugang ist die **Manus OAuth-Anmeldung**.

#### So melden Sie sich an:

1. **Öffnen Sie die Admin-Login-Seite:**
   - Navigieren Sie zu: `https://[ihre-domain]/admin/login`
   - Oder klicken Sie auf den "Admin-Login" Link im Footer der Startseite

2. **Klicken Sie auf "Mit Manus OAuth anmelden":**
   - Der Button befindet sich unter dem E-Mail/Passwort-Formular
   - Sie werden zur Manus OAuth-Anmeldeseite weitergeleitet

3. **Melden Sie sich mit Ihrem Manus-Account an:**
   - Verwenden Sie Ihre Manus-Zugangsdaten
   - Nach erfolgreicher Anmeldung werden Sie automatisch zurück zur Plattform geleitet

4. **Admin-Berechtigung:**
   - Der Plattform-Eigentümer (definiert in den Umgebungsvariablen) erhält automatisch Admin-Rechte
   - Andere Benutzer können über die Datenbank zu Admins gemacht werden

### Admin-Berechtigungen einrichten

#### Für den Plattform-Eigentümer:
Die Admin-Berechtigung wird automatisch vergeben, wenn Ihre Manus `openId` mit der `OWNER_OPEN_ID` Umgebungsvariable übereinstimmt.

#### Für zusätzliche Administratoren:
1. Öffnen Sie das **Database Management UI** in der Manus-Oberfläche
2. Navigieren Sie zur `users` Tabelle
3. Finden Sie den Benutzer, dem Sie Admin-Rechte geben möchten
4. Ändern Sie das `role` Feld von `user` zu `admin`
5. Speichern Sie die Änderungen

### Admin-Dashboard-Funktionen

Nach erfolgreicher Anmeldung haben Sie Zugriff auf:

#### 📧 Kontaktanfragen
- Alle Kundenanfragen anzeigen und verwalten
- Status ändern: Neu → Kontaktiert → Abgeschlossen
- Anfragen löschen

#### 🏢 Immobilien-Verwaltung
- Neue Immobilien hinzufügen
- Bestehende Immobilien bearbeiten
- Immobilien-Status verwalten (Verfügbar, Reserviert, Verkauft)
- Bilder, Preise und Baufortschritt aktualisieren

#### 📦 Service-Pakete
- Service-Angebote erstellen und bearbeiten
- Preise und Leistungen verwalten

#### 💰 Buchungen & Zahlungen
- Alle Buchungen einsehen
- Buchungsstatus aktualisieren
- Ratenzahlungen verwalten
- Zahlungsstatus überwachen

### Sicherheitshinweise

- **Teilen Sie Ihre Manus-Zugangsdaten niemals mit anderen**
- **Admin-Zugang sollte nur vertrauenswürdigen Personen gewährt werden**
- **Überprüfen Sie regelmäßig die Liste der Admin-Benutzer in der Datenbank**
- **Entfernen Sie Admin-Rechte von Benutzern, die diese nicht mehr benötigen**

### Fehlerbehebung

#### "Zugriff verweigert" nach Anmeldung:
- Überprüfen Sie, ob Ihr Benutzer in der Datenbank das `role` Feld auf `admin` gesetzt hat
- Stellen Sie sicher, dass Sie mit dem richtigen Manus-Account angemeldet sind

#### Weiterleitung zur Login-Seite nach Anmeldung:
- Löschen Sie Browser-Cookies und Cache
- Versuchen Sie es in einem privaten/Inkognito-Fenster
- Stellen Sie sicher, dass die Session-Cookies aktiviert sind

#### Keine Admin-Funktionen sichtbar:
- Überprüfen Sie die Browser-Konsole auf Fehler
- Stellen Sie sicher, dass die Datenbank-Verbindung funktioniert
- Kontaktieren Sie den technischen Support

### Technische Details

#### Authentifizierung:
- Die Plattform verwendet Manus OAuth für sichere Authentifizierung
- Session-Management erfolgt über HTTP-Only Cookies
- JWT-Tokens werden für API-Anfragen verwendet

#### Datenbank:
- Benutzerdaten werden in der `users` Tabelle gespeichert
- Das `role` Feld bestimmt die Berechtigungen (`user` oder `admin`)
- Der Plattform-Eigentümer wird automatisch als Admin erkannt

---

**Letzte Aktualisierung:** 26. Dezember 2025
