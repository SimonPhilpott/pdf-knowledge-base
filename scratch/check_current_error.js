import Database from 'better-sqlite3';
const db = new Database('./server/data/app.db');
const target = 'ALIEN RPG - Building Better Worlds_iFwtGZ.pdf';
const row = db.prepare('SELECT filename, indexed, index_error FROM documents WHERE filename = ?').get(target);
console.log(JSON.stringify(row, null, 2));
db.close();
