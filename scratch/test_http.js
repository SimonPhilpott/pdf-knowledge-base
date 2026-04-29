
import fetch from 'node-fetch';

async function testHttp() {
    const baseUrl = 'http://localhost:3001/api';
    const endpoints = [
        'subjects',
        'chat/history',
        'usage/summary',
        'subjects/topics',
        'subjects/suggestions',
        'drive/status',
        'settings/canvas',
        'notebook',
        'gems'
    ];

    console.log('--- TESTING HTTP ENDPOINTS ---');
    for (const ep of endpoints) {
        try {
            const res = await fetch(`${baseUrl}/${ep}`);
            const text = await res.text();
            console.log(`[${res.status}] ${ep.padEnd(20)} | Type: ${res.headers.get('content-type')} | Length: ${text.length}`);
            if (res.status !== 200 || !res.headers.get('content-type').includes('json')) {
                console.log(`    ERROR: Unexpected response for ${ep}`);
                if (text.startsWith('<!doctype html>')) {
                    console.log(`    DETAILS: Received HTML instead of JSON!`);
                }
            }
        } catch (err) {
            console.error(`[ERR] ${ep.padEnd(20)} | ${err.message}`);
        }
    }
}

testHttp();
