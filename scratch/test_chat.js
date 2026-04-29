import { processMessage } from '../server/services/chatService.js';
import db from '../server/db/database.js';

async function testChat() {
  const query = "Give me the turn sequence for the game space empires 4x";
  console.log(`Testing query: "${query}"`);
  
  try {
    const result = await processMessage(query, null, [], 'flash');
    console.log("\n--- RESPONSE ---");
    console.log(result.response);
    console.log("\n--- CITATIONS ---");
    console.log(result.citations);
  } catch (err) {
    console.error("Chat error:", err);
  }
}

testChat();
