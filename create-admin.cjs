const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const { join } = require('path');

const dbPath = join(__dirname, '.manus', 'sqlite.db');
const db = new Database(dbPath);

async function createAdminUser() {
  const password = 'Admin2025';
  const passwordHash = await bcrypt.hash(password, 10);
  
  try {
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, email_verified, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run('Admin Test', 'admin@angelusgeorgia.com', passwordHash, 'admin', 1);
    
    console.log('✅ Admin-Account erfolgreich erstellt!');
    console.log('');
    console.log('Login-Daten:');
    console.log('E-Mail: admin@angelusgeorgia.com');
    console.log('Passwort: Admin2025');
    console.log('');
    console.log('Sie können sich jetzt unter /admin/login anmelden.');
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log('ℹ️  Admin-Account existiert bereits.');
      console.log('');
      console.log('Login-Daten:');
      console.log('E-Mail: admin@angelusgeorgia.com');
      console.log('Passwort: Admin2025');
    } else {
      console.error('❌ Fehler beim Erstellen des Admin-Accounts:', error.message);
    }
  } finally {
    db.close();
  }
}

createAdminUser();
