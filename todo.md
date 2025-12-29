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

## Dokumenten-Upload für CRM-Leads
- [x] Datenbank-Schema: Lead-Dokumente-Tabelle erstellen
- [x] Backend-API: Dokument-Upload mit S3-Speicherung
- [x] Backend-API: Dokumente auflisten und löschen
- [x] Frontend: Dokument-Upload-Bereich im Lead-Detail
- [x] Frontend: Dokumentenliste mit Download-Links

## Lead-Import aus CSV
- [x] Backend-API: CSV-Parsing und Validierung
- [x] Backend-API: Bulk-Insert für Leads
- [x] Frontend: CSV-Upload-Dialog im CRM
- [x] Frontend: Spalten-Mapping-Interface
- [x] Frontend: Import-Vorschau und Fehleranzeige

## Social-Media-Sharing für Immobilien
- [x] Sharing-Komponente mit WhatsApp, Facebook, Twitter, E-Mail erstellen
- [x] In Immobilien-Detailseite einbinden
- [x] Sharing-URL mit Immobilien-Titel und Beschreibung generieren

## Video-Galerie/Mediathek
- [x] Datenbank-Schema: Videos-Tabelle mit Kategorien
- [x] Backend-API: CRUD für Videos
- [x] Admin: Video-Verwaltung (hinzufügen, bearbeiten, löschen)
- [x] Frontend: /videos Seite mit Kategorien und Lightbox
- [x] Frontend: Video-Sektion auf Startseite
- [x] Navigation: Link zu Videos/Mediathek hinzufügen

## Investoren-Selbsttest (Lead-Generierung)
- [x] Logik und Fragenkonzept entwickeln
- [x] Frontend: Interaktiver Multi-Step-Test
- [x] Ergebnis-Seite mit Investoren-Profil und Empfehlungen
- [x] Lead-Erfassung (E-Mail) vor Ergebnisanzeige
- [x] CRM-Integration: Leads automatisch anlegen
- [x] Call-to-Action mit passenden Immobilien

## Manus Forge Chatbot
- [x] Chatbot-Komponente mit Floating-Button erstellen
- [x] Manus Forge API Integration
- [x] System-Prompt mit Firmenkontext (Services, Immobilien, FAQs)
- [x] Quick-Reply Buttons für häufige Fragen
- [x] Lead-Erfassung bei Interesse
- [x] In alle Seiten einbinden

## Calendly-Integration
- [x] Calendly-Link auf Startseite (Beratung anfragen)
- [x] Calendly-Link im Kontaktbereich
- [x] Calendly-Link im Investment-Test Ergebnis
- [x] Calendly-Link im Chatbot System-Prompt
- [x] Calendly-Link auf Immobilien-Detailseiten

## Navigation & Calendly-Widget
- [x] Alle Seiten auf fehlende Navigation prüfen
- [x] Einheitliche Header-Navigation auf allen Unterseiten
- [x] Calendly-Widget als Popup einbetten
- [x] Verlinkungen zwischen allen Seiten sicherstellen

## Mehrsprachigkeit (Google Translate)
- [x] Google Translate Script in index.html einbinden
- [x] Sprachwahl-Komponente im Header (DE/EN/RU)
- [x] Widget auch im Admin-Bereich verfügbar machen
- [x] Styling anpassen (zum Design passend)

## Cookie-Banner für DSGVO-Konformität
- [x] Cookie-Consent-Banner Komponente erstellen
- [x] Cookie-Einstellungen im localStorage speichern
- [x] Google Translate nur laden wenn Cookies akzeptiert
- [x] Banner-Design passend zum Website-Stil

## Sprachpräferenz speichern
- [x] Gewählte Sprache im localStorage speichern
- [x] Sprache bei Seitenaufruf automatisch wiederherstellen
- [x] LanguageSwitcher-Komponente entsprechend anpassen

## SEO-Optimierung für Mehrsprachigkeit
- [x] hreflang-Tags im HTML-Head hinzufügen
- [x] Canonical-URLs für jede Sprachversion
- [x] Meta-Tags für Sprache setzen

## Bug-Fixes (29.12.2025)
- [x] CRM-Seite: Navigation zurück zum Admin-Dashboard hinzufügen
- [x] Immobilien-Formular: "Fehler beim Speichern" beheben

## Services-Verwaltung im Admin-Dashboard
- [x] Service-Erstellungsformular in AdminDirect implementieren
- [x] Service-Bearbeitungsfunktion in AdminDirect hinzufügen
- [x] Service-Löschfunktion in AdminDirect hinzufügen
- [x] API-Integration für Services CRUD
- [x] Services-Tab im regulären Admin-Dashboard (Admin.tsx) hinzufügen

## Kunden-Wallet-System
- [x] Datenbank-Schema für Wallets und Transaktionen erstellen
- [x] Backend API-Routen für Wallet-Operationen implementieren
- [x] Kunden-Wallet-Seite mit Guthaben-Anzeige erstellen
- [x] Einzahlungsoptionen (Bank und Krypto) implementieren
- [x] Bonus-Zinssystem (7% bei Ersteinzahlung ab 10.000€) implementieren
- [x] Wallet-Integration in Checkout-Prozess
- [x] Wallet-Link im Header für eingeloggte User
- [x] Admin-Bereich für Wallet-Verwaltung (Einzahlungen bestätigen)

## Admin-Wallet-Verwaltung
- [x] Wallet-Tab im Admin-Dashboard hinzufügen
- [x] Übersicht aller Kunden-Wallets anzeigen
- [x] Einzahlungsanfragen auflisten und bestätigen/ablehnen
- [x] Wallet-Guthaben manuell anpassen können

## Automatische Zinsberechnung
- [x] Cron-Job für tägliche Zinsberechnung einrichten
- [x] 7% jährliche Zinsen für qualifizierte Wallets berechnen
- [x] Zinsen als Bonus-Guthaben gutschreiben
- [x] Zinsberechnungs-Historie speichern

## E-Mail-Benachrichtigungen für Wallet
- [x] E-Mail bei Einzahlungsbestätigung senden
- [x] E-Mail bei Zinsgutschrift senden
- [x] E-Mail-Templates für Wallet-Aktivitäten erstellen

## AdminDirect Wallets-Tab
- [x] Wallets-Tab zu AdminDirect.tsx hinzufügen
- [x] Alle Kunden-Wallets anzeigen
- [x] Einzahlungsanfragen anzeigen und verwalten

## Investor Wallet-Ansicht
- [x] Wallet-Sektion im InvestorDashboard hinzufügen
- [x] Guthaben und Bonus-Guthaben anzeigen
- [x] Einzahlungsmöglichkeit für Investoren

## Wallet-Zahlung im Checkout
- [x] Wallet als Zahlungsmethode im Checkout hinzufügen
- [x] Bonus-Guthaben zuerst verwenden, dann Hauptguthaben
- [x] Wallet-Zahlung sofort als abgeschlossen markieren
- [x] E-Mail-Bestätigung für Wallet-Zahlungen anpassen
- [x] Unit Tests für Wallet-Zahlungslogik erstellen

## Bug-Fix: Wallets-Tab im AdminDirect
- [x] Wallets-Tab Button im AdminDirect prüfen und korrigieren

## Immobilien-Formular erweitern
- [x] Video-Verlinkung (YouTube/Vimeo) Feld hinzufügen
- [x] Hauptbild-URL Feld hinzufügen
- [x] Zusätzliche Bilder-URLs (Galerie) hinzufügen
- [x] Ausstattungs-Feld (Amenities) hinzufügen

## Erweiterte Immobilien-Verwaltung
- [x] Drag & Drop Bildupload-Komponente erstellen
- [x] Bildvorschau nach Upload anzeigen
- [x] Bilder zu S3 hochladen und URLs speichern
- [x] Immobilien-Vorschau im Formular implementieren
- [x] CSV-Bulk-Import für Immobilien erstellen
- [x] CSV-Template zum Download bereitstellen

## Bug-Fix: CRM-Tab im Admin-Dashboard
- [x] CRM-Tab zum Admin-Dashboard hinzufügen

## Direkter Bild- und Video-Upload
- [x] Bildupload-Komponente mit S3-Speicherung im Immobilien-Formular
- [x] Video-Upload-Funktionalität hinzufügen
- [x] URL-Eingabefelder durch Upload-Komponenten ersetzen
