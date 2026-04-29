import db from '../server/db/database.js';

const rows = db.prepare("SELECT filename, subject, indexed FROM documents WHERE filename LIKE '%Space%'").all();
console.log(rows);
