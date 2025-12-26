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
