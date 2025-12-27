# Project TODO

## E-Mail-System Vervollständigung
- [x] Backend: Passwort-Reset-Endpunkte zu auth-Router hinzufügen
- [x] Backend: E-Mail-Verifizierungs-Endpunkte zu auth-Router hinzufügen
- [x] Backend: Registrierung mit E-Mail-Versand erweitern
- [x] Frontend: Passwort-vergessen-Seite erstellen
- [x] Frontend: Passwort-zurücksetzen-Seite erstellen
- [x] Frontend: E-Mail-Verifizierungs-Seite erstellen
- [x] Frontend: "Passwort vergessen"-Link zur Login-Seite hinzufügen

## Service-Pakete-Seite
- [x] Service-Pakete-Seite mit Übersicht erstellen
- [x] Einzelleistungen anzeigen (Firmengründung, Property Management, Mietgarantie)
- [x] Preise und Beschreibungen hinzufügen
- [x] Buchungsfunktion für Service-Pakete implementieren
- [x] Route zur Navigation hinzufügen

## Admin-Testaccount
- [x] Admin-Benutzer in der Datenbank erstellen
- [x] Login-Daten dem Benutzer mitteilen

## Login-Problem beheben
- [x] Admin-Account in Datenbank überprüfen
- [x] Login-Funktionalität testen
- [x] Passwort-Hash validieren

## Admin-Login-Seite korrigieren
- [x] Admin-Seite zu /admin/login weiterleiten wenn nicht angemeldet
- [x] Alle Login-Links korrigieren
- [x] Lokale Authentifizierung testen

## Admin-Login-Link auf Landing Page
- [x] Admin-Login-Link im Footer hinzufügen

## Admin-Login Weiterleitungsproblem
- [x] Admin-Login-Seite analysieren - OAuth-Login funktioniert korrekt
- [x] OAuth als empfohlene Login-Methode dokumentiert
- [x] Admin-Zugangs-Dokumentation erstellt (ADMIN_ZUGANG.md)
- [x] OAuth-Login-Flow getestet

## OAuth-Benutzer Admin-Rechte geben
- [x] Benutzer in Datenbank gefunden (grossdigitalpartner@gmail.com)
- [x] Admin-Rolle bereits gesetzt
- [x] OAuth-Callback angepasst - Admin-Benutzer werden jetzt automatisch zu /admin weitergeleitet
- [x] Admin-Zugang testen

## OAuth-Weiterleitungs-URL korrigieren
- [x] getLoginUrl() Funktion geprüft - funktioniert korrekt
- [x] Problem identifiziert: Callback-URL muss in Manus-App-Einstellungen registriert werden
- [x] Detaillierte Anleitung erstellt (OAUTH_CALLBACK_ANLEITUNG.md)
- [ ] Benutzer muss Callback-URL in Manus-Plattform aktualisieren

## OAuth-Session-Problem beheben
- [x] Session-Cookie wird nach OAuth-Callback richtig gesetzt
- [x] Admin-Seite erkennt angemeldeten Benutzer
- [x] React-Hook-Fehler behoben (Hooks vor bedingten Returns verschoben)

## OAuth-Session-Cookie Problem (kritisch)
- [x] Session-Cookie wird jetzt vom Browser akzeptiert
- [x] Cookie-Einstellungen überprüft (SameSite, Secure, Domain)
- [x] OAuth-Callback debuggt und repariert
- [x] Session-Token als URL-Parameter als Fallback implementiert

## Geheimer Admin-Direktlink
- [x] Geheimen Token für Direktzugang generiert
- [x] Route für Direktlink erstellt (/admin/direct/[token])
- [x] Separates Admin-Dashboard ohne Auth-Check implementiert
- [x] Link dem Benutzer mitgeteilt

## Admin-Dashboard CRUD-Funktionen
- [x] Immobilien: Erstellen-Button und Formular
- [x] Immobilien: Bearbeiten-Funktion
- [x] Immobilien: Löschen-Funktion
- [x] Kontaktanfragen: Status ändern
- [x] Buchungen: Status ändern
- [x] Alle Funktionen getestet

## E-Commerce-Plattform Erweiterung

### Phase 1: Datenbank-Schema erweitern
- [x] Immobilien-Schema: Fotos (mehrere), Videos, erweiterte Beschreibungen
- [x] Immobilien-Schema: Kaufpreis, Zahlungsbedingungen, Ratenzahlungsoptionen
- [x] Dienstleistungen-Schema: Unternehmensgründungen mit Preisen
- [x] Dienstleistungen-Schema: Mietgarantien mit Preisen
- [x] Bestellungen-Schema: Warenkorb, Bestellpositionen, Zusatzleistungen
- [x] Zahlungen-Schema: Krypto-Wallet, Banküberweisung, Status

### Phase 2: Admin - Erweiterte Immobilienverwaltung
- [x] Mehrere Fotos pro Immobilie hochladen (S3)
- [x] Videos hochladen/einbetten
- [x] Zahlungsbedingungen konfigurieren (Anzahlung, Raten, Laufzeit)
- [x] Ratenzahlungsoptionen definieren

### Phase 3: Admin - Dienstleistungsverwaltung
- [x] Unternehmensgründungen anlegen mit Preisen
- [x] Mietgarantien anlegen mit Preisen/Konditionen
- [x] Zusatzleistungen pro Immobilie konfigurieren

### Phase 4: Kunden-Kaufprozess
- [x] Immobilien-Detailseite mit allen Infos
- [x] Warenkorb-Funktion
- [x] Zusatzleistungen beim Kauf auswählen
- [x] Checkout-Prozess

### Phase 5: Zahlungssystem
- [x] Krypto-Wallet-Integration (Bitcoin, Ethereum, USDT)
- [x] Banküberweisung mit Zahlungsanweisungen
- [x] Zahlungsstatus-Tracking
- [ ] Bestellbestätigungen per E-Mail (optional)

## Admin-Dashboard E-Commerce-Integration
- [x] E-Commerce-Link im Admin-Dashboard hinzufügen
- [x] Navigation zwischen Admin-Bereichen verbessern
- [x] Krypto-Wallets Verwaltung funktioniert
- [x] Bankkonten Verwaltung funktioniert
- [x] Dienstleistungen Verwaltung funktioniert

## Kunden-Login Verbesserungen
- [x] Login-Button für Kunden in der Navigation hinzufügen
- [x] Dashboard-Weiterleitung zur Login-Seite wenn nicht angemeldet
- [x] Kunden-Login sichtbar auf der Startseite (Anmelden/Registrieren Buttons)

## Registrierung und Kundendaten
- [x] Benutzer-Schema erweitern: Adresse, Telefon, Geburtsdatum, Verifizierungsstatus
- [x] E-Mail-Verifizierung bei Registrierung implementieren
- [x] Verifizierungs-E-Mail mit Bestätigungslink senden
- [x] Registrierungsformular mit Pflichtfeldern erweitern (Name, Adresse, Telefon)
- [x] Login nur für verifizierte Benutzer erlauben
- [x] Profil-Seite für Kunden erstellen
  - [x] Backend-API für Profil-Update
  - [x] Frontend Profil-Seite mit Formular
  - [x] Passwort ändern Funktion
- [ ] Checkout nur für verifizierte Benutzer mit vollständigem Profil erlauben (optional)

## Social Media Integration
- [x] WhatsApp-Kanal-Link hinzufügen (https://whatsapp.com/channel/0029VbC18IWCsU9YyrOyj01N)
- [x] Telegram-Kanal-Link hinzufügen (https://t.me/Angelus_Management_GeorgiaDE)
- [x] Abonnieren-Buttons im Hero-Bereich und Footer
- [x] Facebook-Seite hinzufügen (https://www.facebook.com/search/top?q=angelus%20management%20georgia)

## Mobile Navigation
- [x] Hamburger-Menü Komponente erstellen
- [x] Mobile Navigation in Home.tsx integrieren
- [x] Responsive Breakpoints (md: 768px) implementiert

## E-Mail-Benachrichtigungen
- [x] Resend API-Key prüfen und konfigurieren (bereits als API_KEY_RESEND vorhanden)
- [x] E-Mail-Verifizierung bei Registrierung (bereits implementiert)
- [x] Bestellbestätigungs-E-Mails implementieren
- [x] Zahlungseingangs-E-Mails implementieren
- [x] Admin-Benachrichtigung bei neuen Bestellungen

## E-Mail-Versand Problem (GELÖST)
- [x] Bestätigungs-E-Mail ging nicht raus bei Registrierung
- [x] Problem: Resend Free-Plan Kontingent war aufgebraucht (0 E-Mails übrig)
- [x] Lösung: Upgrade auf Transactional Pro Plan (50.000 E-Mails/Monat, $20/Monat)
- [x] E-Mail-Versand funktioniert jetzt korrekt

## E-Mail-Absender Verbesserungen
- [x] Absender-Name auf "Angelus Management Georgia" setzen
- [x] Reply-To Adresse auf angelusmanagementgeorgia@gmail.com setzen

## Admin-Formular Erweiterung für Immobilien
- [x] Stadt-Feld hinzufügen
- [x] Baufortschritt-Dropdown hinzufügen (planning/foundation/structure/finishing/completed)
- [x] Fertigstellungsdatum-Feld hinzufügen
- [x] Mietgarantie-Optionen hinzufügen (Ja/Nein, Prozent, Dauer)
- [x] Ratenzahlungsoptionen hinzufügen (Min. Anzahlung, Max. Laufzeit, Zinssatz)
- [x] Mehrere Bilder-Upload ermöglichen (Galerie)
- [x] Video-URLs Feld hinzufügen

## CRM-System Erweiterung
- [x] Datenbank-Schema: Leads-Tabelle mit Pipeline-Phasen
- [x] Datenbank-Schema: Aktivitäten-Tabelle (Notizen, Anrufe, E-Mails)
- [x] Backend-API für Lead-Management (CRUD, Status-Änderung)
- [x] Backend-API für Aktivitäten (erstellen, auflisten)
- [x] CRM-Dashboard mit Übersicht und KPIs
- [x] Lead-Pipeline mit Drag & Drop (Kanban-Board)
- [x] Kundendetailseite mit vollständiger Historie
- [x] Aktivitäten-Log pro Kunde/Lead
