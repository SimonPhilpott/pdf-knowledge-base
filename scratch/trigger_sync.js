import { syncPdfs } from '../server/services/driveService.js';

console.log("Starting full sync to restore folder structure...");
syncPdfs().then(result => {
  console.log(`Sync complete. Processed ${result.total} documents.`);
  process.exit(0);
}).catch(err => {
  console.error("Sync failed:", err.message);
  process.exit(1);
});
