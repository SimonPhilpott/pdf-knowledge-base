import db from '../server/db/database.js';

try {
  db.exec("ALTER TABLE documents ADD COLUMN folder_path TEXT");
  console.log("Successfully added folder_path column.");
  // Initialize folder_path with current subject if it's from folder
  db.prepare("UPDATE documents SET folder_path = subject WHERE subject_source = 'folder'").run();
} catch (err) {
  if (err.message.includes("duplicate column name")) {
    console.log("Column already exists.");
  } else {
    console.error("Error altering table:", err.message);
  }
}
