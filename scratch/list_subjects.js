import db from '../server/db/database.js';

try {
  const subjects = db.prepare('SELECT DISTINCT subject FROM documents ORDER BY subject').all();
  console.log(JSON.stringify(subjects, null, 2));
} catch (err) {
  console.error("Error querying subjects:", err.message);
}
