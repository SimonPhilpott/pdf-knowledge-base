import { getUsageSummary } from '../server/services/usageService.js';

try {
  const summary = getUsageSummary();
  console.log(JSON.stringify(summary, null, 2));
} catch (err) {
  console.error("Error getting usage summary:", err.message);
}
