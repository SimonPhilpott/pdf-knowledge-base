import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config.js';
import { logUsage } from './usageService.js';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

/**
 * Generate embeddings for an array of text chunks
 * Batches requests and includes rate limiting
 */
export async function generateEmbeddings(chunks, taskType = 'RETRIEVAL_DOCUMENT') {
  const model = genAI.getGenerativeModel({ model: config.gemini.embeddingModel });
  const embeddings = [];

  // Process in batches of 20 to avoid rate limits
  const BATCH_SIZE = 20;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (chunk) => {
      const result = await model.embedContent({
        content: { parts: [{ text: chunk.text }], role: 'user' },
        taskType
      });
      return result.embedding.values;
    });

    const batchResults = await Promise.all(promises);

    for (let j = 0; j < batch.length; j++) {
      embeddings.push({
        ...batch[j],
        embedding: batchResults[j]
      });
    }

    // Log embedding usage (approximate)
    const totalChars = batch.reduce((sum, c) => sum + c.text.length, 0);
    const approxTokens = Math.ceil(totalChars / 4);
    logUsage(config.gemini.embeddingModel, approxTokens, 0, 'embedding');

    // Rate limit pause between batches
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return embeddings;
}

/**
 * Generate a single embedding for a query
 */
export async function generateQueryEmbedding(query) {
  const model = genAI.getGenerativeModel({ model: config.gemini.embeddingModel });

  const result = await model.embedContent({
    content: { parts: [{ text: query }], role: 'user' },
    taskType: 'RETRIEVAL_QUERY'
  });

  // Log usage
  const approxTokens = Math.ceil(query.length / 4);
  logUsage(config.gemini.embeddingModel, approxTokens, 0, 'embedding');

  return result.embedding.values;
}
