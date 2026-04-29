import db from '../server/db/database.js';

const subjects = db.prepare('SELECT DISTINCT subject FROM documents').all();
console.log(JSON.stringify(subjects, null, 2));
