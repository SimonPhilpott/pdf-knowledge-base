import Database from 'better-sqlite3';

const db = new Database('./server/data/app.db');

try {
    console.log('--- Resetting All Failed Indexing Records ---');
    const result = db.prepare('UPDATE documents SET indexed = 0, index_error = NULL WHERE indexed = -1').run();
    console.log(`Successfully reset ${result.changes} documents to pending.`);
    
    const count = db.prepare('SELECT COUNT(*) as total FROM documents WHERE indexed = 1').get();
    console.log(`Total successfully indexed: ${count.total}`);
} catch (err) {
    console.error('Database error:', err);
} finally {
    db.close();
}
