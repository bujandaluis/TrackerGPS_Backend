const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DATABASE_PATH || './data/trackergps.db';
const absolutePath = path.resolve(dbPath);

fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

const db = new Database(absolutePath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS ubicaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identificador_dispositivo TEXT NOT NULL,
    latitud REAL NOT NULL,
    longitud REAL NOT NULL,
    fecha_creacion TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE INDEX IF NOT EXISTS idx_ubicaciones_identificador
    ON ubicaciones (identificador_dispositivo);
`);

module.exports = db;
