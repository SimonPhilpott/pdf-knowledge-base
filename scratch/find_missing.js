import db from '../server/db/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VECTORS_DIR = path.join(__dirname, '..', 'server', 'data', 'vectors');

function subjectToFilename(subject) {
  return subject.replace(/[^a-zA-Z0-9-_ ]/g, '_').replace(/\s+/g, '_').toLowerCase();
}

// Find Space Empires docs
const docs = db.prepare("SELECT * FROM documents WHERE subject LIKE '%Space%' OR filename LIKE '%Space%'").all();
console.log('\n=== Space Empires docs in DB ===');
for (const doc of docs) {
  console.log(`  "${doc.filename}" => subject: "${doc.subject}"`);
  console.log(`    Expected vector file: ${subjectToFilename(doc.subject)}.json`);
  
  // Search all vector files for this doc
  const vectorFiles = fs.readdirSync(VECTORS_DIR).filter(f => f.endsWith('.json'));
  for (const file of vectorFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(VECTORS_DIR, file), 'utf-8'));
      const found = data.find(d => d.driveFileId === doc.drive_file_id);
      if (found) {
        console.log(`    FOUND IN: ${file} (as subject: "${found.subject}")`);
      }
    } catch(e) {}
  }
}

// Find RPG / Five Parsecs 3e Core Rules
const fpDocs = db.prepare("SELECT * FROM documents WHERE subject LIKE '%Five Parsecs%3e%Core%' OR subject LIKE '%Ker Nethalas%' OR subject LIKE '%Generic Resources%'").all();
console.log('\n=== Other missing docs ===');
for (const doc of fpDocs) {
  console.log(`  "${doc.filename}" => subject: "${doc.subject}"`);
  const vectorFiles = fs.readdirSync(VECTORS_DIR).filter(f => f.endsWith('.json'));
  for (const file of vectorFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(VECTORS_DIR, file), 'utf-8'));
      const found = data.find(d => d.driveFileId === doc.drive_file_id);
      if (found) {
        console.log(`    FOUND IN: ${file} (as subject: "${found.subject}")`);
      }
    } catch(e) {}
  }
}
