
import db from '../server/db/database.js';
import { getTopicsBySubject } from '../server/services/topicService.js';

try {
    console.log('--- TESTING SUBJECTS ROUTE LOGIC ---');
    const folderSubjects = db.prepare(`
      SELECT folder_path as subject, COUNT(*) as document_count, 
        SUM(page_count) as total_pages,
        SUM(CASE WHEN indexed = 1 THEN 1 ELSE 0 END) as indexed_count,
        'folder' as source
      FROM documents
      WHERE folder_path IS NOT NULL
      GROUP BY folder_path
    `).all();
    console.log('Folder Subjects Count:', folderSubjects.length);

    const aiSubjects = db.prepare(`
      SELECT subject, COUNT(*) as document_count, 
        SUM(page_count) as total_pages,
        SUM(CASE WHEN indexed = 1 THEN 1 ELSE 0 END) as indexed_count,
        'ai' as source
      FROM documents
      WHERE subject_source = 'ai'
      GROUP BY subject
    `).all();
    console.log('AI Subjects Count:', aiSubjects.length);

    console.log('\n--- TESTING TOPICS ROUTE LOGIC ---');
    const topics = getTopicsBySubject();
    console.log('Grouped Topics Count (Subjects):', Object.keys(topics).length);
    
    console.log('\n--- SAMPLE AI SUBJECTS ---');
    console.log(aiSubjects.slice(0, 3));

    process.exit(0);
} catch (err) {
    console.error('API Logic Error:', err);
    process.exit(1);
}
