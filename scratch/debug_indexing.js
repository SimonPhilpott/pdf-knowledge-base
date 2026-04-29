import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { extractPdfText, chunkText } from '../server/services/pdfService.js';
import { generateEmbeddings } from '../server/services/embeddingService.js';
import config from '../server/config.js';
import db from '../server/db/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testIndex(fileName) {
  console.log(`\n>>> Testing Indexing for: ${fileName}`);
  
  const doc = db.prepare('SELECT * FROM documents WHERE filename = ?').get(fileName);
  if (!doc) {
    console.error('File not found in database.');
    return;
  }

  const pdfPath = path.join(__dirname, '..', 'server', 'data', 'pdfs', `${doc.drive_file_id}.pdf`);
  console.log(`PDF Path: ${pdfPath}`);

  if (!fs.existsSync(pdfPath)) {
    console.error('PDF file does not exist in cache!');
    return;
  }

  try {
    console.log('1. Extracting text...');
    const pdfData = await extractPdfText(pdfPath);
    console.log(`   Pages: ${pdfData.pageCount}`);

    console.log('2. Chunking text...');
    const chunks = chunkText(pdfData.pages, {
      chunkSize: config.defaults.chunkSize,
      chunkOverlap: config.defaults.chunkOverlap
    });
    console.log(`   Chunks: ${chunks.length}`);

    console.log('3. Generating embeddings...');
    const embeddedChunks = await generateEmbeddings(chunks);
    console.log(`   Embedded Chunks: ${embeddedChunks.length}`);

    console.log('SUCCESS!');
  } catch (err) {
    console.error('FAILURE!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
    console.error('Full Error Object:', err);
  }
}

const target = 'ALIEN RPG - Building Better Worlds_iFwtGZ.pdf';
testIndex(target).then(() => db.close());
