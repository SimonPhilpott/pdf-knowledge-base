import db from '../server/db/database.js';
import { updateDocumentSubject } from '../server/services/vectorStore.js';

const OLD_NAME = 'Role-Playing Games';
const NEW_NAME = 'Boardgames & RPG';

try {
  // Find all documents affected
  const docs = db.prepare(`
    SELECT drive_file_id, subject, folder_path 
    FROM documents 
    WHERE subject LIKE ? OR folder_path LIKE ?
  `).all(`${OLD_NAME}%`, `${OLD_NAME}%`);

  console.log(`Found ${docs.length} documents to update.`);

  for (const doc of docs) {
    const oldSubject = doc.subject;
    const oldFolderPath = doc.folder_path;
    
    const newSubject = oldSubject?.startsWith(OLD_NAME) 
      ? oldSubject.replace(OLD_NAME, NEW_NAME) 
      : oldSubject;
      
    const newFolderPath = oldFolderPath?.startsWith(OLD_NAME) 
      ? oldFolderPath.replace(OLD_NAME, NEW_NAME) 
      : oldFolderPath;

    // 1. Update Database
    db.prepare(`
      UPDATE documents 
      SET subject = ?, folder_path = ? 
      WHERE drive_file_id = ?
    `).run(newSubject, newFolderPath, doc.drive_file_id);

    // 2. Update Topics
    db.prepare(`
      UPDATE topics 
      SET subject = ? 
      WHERE document_id = (SELECT id FROM documents WHERE drive_file_id = ?)
    `).run(newSubject, doc.drive_file_id);

    // 3. Update Vector Store
    if (oldSubject !== newSubject) {
      try {
        updateDocumentSubject(doc.drive_file_id, oldSubject, newSubject);
      } catch (err) {
        console.error(`Failed to update vector store for ${doc.drive_file_id}:`, err.message);
      }
    }
  }

  console.log("Rename complete.");
} catch (err) {
  console.error("Rename failed:", err.message);
}
