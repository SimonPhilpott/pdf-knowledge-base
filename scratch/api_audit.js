
import db from '../server/db/database.js';
import { getUsageSummary } from '../server/services/usageService.js';
import { getTopicsBySubject, getRandomSuggestions } from '../server/services/topicService.js';
import { getChatSessions } from '../server/services/chatService.js';

async function audit() {
    console.log('--- STARTING API AUDIT ---');
    const endpoints = [
        { name: 'Subjects', fn: () => db.prepare('SELECT subject_source FROM documents LIMIT 1').all() },
        { name: 'Chat History', fn: () => getChatSessions() },
        { name: 'Usage Summary', fn: () => getUsageSummary() },
        { name: 'Topics', fn: () => getTopicsBySubject() },
        { name: 'Suggestions', fn: () => getRandomSuggestions() },
        { name: 'Canvas', fn: () => db.prepare('SELECT content FROM canvas_state WHERE id = 1').get() },
        { name: 'Notebook', fn: () => db.prepare('SELECT * FROM pinned_items').all() },
        { name: 'Gems', fn: () => db.prepare('SELECT * FROM gems').all() }
    ];

    for (const ep of endpoints) {
        try {
            const start = Date.now();
            const res = ep.fn();
            const duration = Date.now() - start;
            console.log(`[OK] ${ep.name.padEnd(15)} | ${duration}ms`);
        } catch (err) {
            console.error(`[FAIL] ${ep.name.padEnd(15)} | ERROR: ${err.message}`);
        }
    }
    console.log('--- AUDIT COMPLETE ---');
}

audit();
