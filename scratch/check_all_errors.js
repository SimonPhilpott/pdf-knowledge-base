import Database from 'better-sqlite3';
const db = new Database('./server/data/app.db');
const rows = db.prepare('SELECT filename, indexed, index_error FROM documents WHERE indexed = -1').all();
console.log(JSON.stringify(rows, null, 2));
db.close();
