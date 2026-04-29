import Database from 'better-sqlite3';

const db = new Database('server/data/app.db');

// 1. Merge "Boardgames & RPG" into "Boardgames & Role-Playing Games"
const updateStmt = db.prepare(`
    UPDATE documents 
    SET subject = REPLACE(subject, 'Boardgames & RPG', 'Boardgames & Role-Playing Games'),
        subject_source = 'ai'
    WHERE subject LIKE 'Boardgames & RPG%'
`);

const result = updateStmt.run();
console.log(`Updated ${result.changes} documents from Boardgames & RPG to Boardgames & Role-Playing Games.`);

// 2. Also fix any other RPG/Role-Playing inconsistencies if they exist at the root
// (though the user specifically pointed out these two)

// Verify results
const rows = db.prepare("SELECT DISTINCT subject FROM documents WHERE subject LIKE 'Boardgames%' ORDER BY subject").all();
console.log("\nCurrent subjects in Boardgames category:");
rows.forEach(r => console.log(`- ${r.subject}`));
