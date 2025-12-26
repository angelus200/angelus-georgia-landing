#!/bin/bash

echo "🔧 Erstelle Admin-Testaccount..."
echo ""

# Registrierung über die API
response=$(curl -s -X POST http://localhost:3000/trpc/auth.register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin Test","email":"admin@angelusgeorgia.com","password":"Admin2025"}')

echo "✅ Admin-Account wurde erstellt!"
echo ""
echo "📝 Login-Daten:"
echo "   E-Mail: admin@angelusgeorgia.com"
echo "   Passwort: Admin2025"
echo ""
echo "🔐 Wichtig: Sie müssen den Account noch auf 'admin' Rolle setzen."
echo "   Bitte führen Sie folgendes SQL-Kommando aus:"
echo ""
echo "   UPDATE users SET role = 'admin' WHERE email = 'admin@angelusgeorgia.com';"
echo ""
echo "💡 Sie können sich unter /admin/login anmelden."
