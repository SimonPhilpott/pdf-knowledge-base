import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('server/data/app.db');
const db = new Database(dbPath);

const docs = db.prepare("SELECT filename, file_size FROM documents WHERE filename LIKE '%ALIEN%'").all();
console.log(JSON.stringify(docs, null, 2));
db.close();
