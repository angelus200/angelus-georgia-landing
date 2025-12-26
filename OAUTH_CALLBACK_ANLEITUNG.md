# OAuth-Callback-URL für georgien-property.agency aktualisieren

## Problem

Wenn Sie versuchen, sich über "Mit Manus OAuth anmelden" auf der veröffentlichten Domain `georgien-property.agency` anzumelden, wird die Weiterleitung fehlschlagen, weil die OAuth-App in Manus noch nicht für diese Domain konfiguriert ist.

## Lösung: OAuth-Callback-URL in Manus aktualisieren

### Schritt 1: Manus-Plattform öffnen

Öffnen Sie die Manus-Plattform in Ihrem Browser und melden Sie sich mit Ihrem Manus-Account an.

### Schritt 2: Zur App-Verwaltung navigieren

Die genauen Schritte können je nach Manus-UI variieren, aber typischerweise:

1. Gehen Sie zu **Settings** oder **Einstellungen**
2. Suchen Sie nach **OAuth Apps** oder **Applications**
3. Finden Sie Ihre App: **Angelus Management Georgia** (App-ID: `XUfoFxFJx7YgWBjS6TLBXD`)

### Schritt 3: Callback-URLs aktualisieren

In den App-Einstellungen sollten Sie ein Feld für **Redirect URIs** oder **Callback URLs** finden.

**Fügen Sie folgende URL hinzu:**
```
https://georgien-property.agency/api/oauth/callback
```

**Wichtig:** Behalten Sie auch die Entwicklungs-URL bei, falls Sie noch Änderungen testen möchten:
```
https://3000-i8iv5demnzt961upu77xz-9e873ea9.sg1.manus.computer/api/oauth/callback
```

### Schritt 4: Änderungen speichern

Klicken Sie auf **Save** oder **Speichern**, um die Änderungen zu übernehmen.

### Schritt 5: OAuth-Login testen

1. Öffnen Sie `https://georgien-property.agency/admin/login`
2. Klicken Sie auf **"Mit Manus OAuth anmelden"**
3. Melden Sie sich mit Ihrem Google-Account (grossdigitalpartner@gmail.com) an
4. Sie sollten jetzt automatisch zum Admin-Dashboard weitergeleitet werden

## Alternative: Entwicklungs-URL verwenden

Wenn Sie die OAuth-Einstellungen nicht sofort aktualisieren können oder möchten, können Sie vorübergehend die Entwicklungs-URL für den Admin-Zugang verwenden:

**Admin-Login über Entwicklungs-URL:**
```
https://3000-i8iv5demnzt961upu77xz-9e873ea9.sg1.manus.computer/admin/login
```

Diese URL funktioniert bereits mit OAuth, da sie bei der ursprünglichen App-Registrierung konfiguriert wurde.

## Häufige Probleme

### "Invalid redirect_uri" Fehler

**Ursache:** Die Callback-URL ist nicht in den Manus-App-Einstellungen registriert.

**Lösung:** Stellen Sie sicher, dass Sie die exakte URL eingetragen haben:
- `https://georgien-property.agency/api/oauth/callback` (mit `/api/oauth/callback` am Ende)
- Achten Sie auf `https://` (nicht `http://`)
- Keine Leerzeichen vor oder nach der URL

### Weiterleitung zur falschen Domain

**Ursache:** Mehrere Callback-URLs sind registriert, aber die falsche wird verwendet.

**Lösung:** Entfernen Sie alte/ungültige Callback-URLs aus den Manus-App-Einstellungen.

### "Zugriff verweigert" nach erfolgreicher Anmeldung

**Ursache:** Ihr Benutzer-Account hat keine Admin-Rechte.

**Lösung:** Ihr Account (grossdigitalpartner@gmail.com) hat bereits Admin-Rechte in der Datenbank. Wenn das Problem weiterhin besteht:
1. Löschen Sie Browser-Cookies und Cache
2. Versuchen Sie es in einem privaten/Inkognito-Fenster
3. Überprüfen Sie in der Management-UI → Database, ob Ihr Benutzer `role = 'admin'` hat

## Technische Details

### Wie OAuth-Callback funktioniert

1. **Login-Anfrage:** Benutzer klickt auf "Mit Manus OAuth anmelden"
2. **Weiterleitung zu Manus:** Browser wird zu `manus.im/app-auth` weitergeleitet mit:
   - `appId`: Ihre App-ID
   - `redirectUri`: Die Callback-URL Ihrer App
   - `state`: Verschlüsselter State-Parameter
3. **Benutzer-Authentifizierung:** Benutzer meldet sich bei Manus an
4. **Callback:** Manus leitet zurück zu Ihrer `redirectUri` mit einem Authorization-Code
5. **Token-Austausch:** Ihr Server tauscht den Code gegen ein Access-Token
6. **Session-Erstellung:** Server erstellt eine Session und setzt ein Cookie
7. **Weiterleitung:** Benutzer wird zum Admin-Dashboard oder zur Startseite weitergeleitet

### Sicherheitshinweise

Die Callback-URL **muss** in den Manus-App-Einstellungen registriert sein. Dies ist eine Sicherheitsmaßnahme, um zu verhindern, dass böswillige Websites Ihre App-ID verwenden und Benutzer zu gefälschten Websites weiterleiten.

---

**Benötigen Sie weitere Hilfe?**

Falls Sie die Manus-App-Einstellungen nicht finden oder Probleme bei der Aktualisierung haben, kontaktieren Sie den Manus-Support unter https://help.manus.im
