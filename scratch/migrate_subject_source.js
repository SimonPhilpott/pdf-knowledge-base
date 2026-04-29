import db from '../server/db/database.js';

try {
  db.exec("ALTER TABLE documents ADD COLUMN subject_source TEXT DEFAULT 'folder'");
  console.log("Successfully added subject_source column.");
} catch (err) {
  if (err.message.includes("duplicate column name")) {
    console.log("Column already exists.");
  } else {
    console.error("Error altering table:", err.message);
  }
}
