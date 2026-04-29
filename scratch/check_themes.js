import db from '../server/db/database.js';

const rows = db.prepare("SELECT d.filename, t.topic FROM documents d JOIN topics t ON d.id = t.document_id WHERE d.filename LIKE '%Five Parsecs%'").all();
console.log(rows);
