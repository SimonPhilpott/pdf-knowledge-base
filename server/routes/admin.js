import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import ngrok from '@ngrok/ngrok';
import config from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Helper to read JSON files safely
const readJsonFile = (filename) => {
  const filePath = path.join(__dirname, '..', '..', filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      // Strip potential BOM
      const cleanContent = content.replace(/^\uFEFF/, '');
      return JSON.parse(cleanContent);
    }
  } catch (err) {
    console.error(`[Admin API] Failed to read ${filename}:`, err.message);
  }
  return null;
};

// Helper to write JSON files safely
const writeJsonFile = (filename, data) => {
  const filePath = path.join(__dirname, '..', '..', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// 1. Project Structure View
router.get('/structure', (req, res) => {
  const structure = readJsonFile('ProjectStructure.JSON');
  res.json(structure);
});

router.put('/structure', (req, res) => {
  writeJsonFile('ProjectStructure.JSON', req.body);
  res.json({ success: true });
});

// 2. Rules View (Custom AI Rules)
router.get('/rules', (req, res) => {
  const rules = db.prepare('SELECT * FROM global_rules ORDER BY created_at DESC').all();
  res.json(rules);
});

router.post('/rules', (req, res) => {
  const { content } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO global_rules (id, content) VALUES (?, ?)').run(id, content);
  res.json({ success: true, id });
});

router.delete('/rules/:id', (req, res) => {
  db.prepare('DELETE FROM global_rules WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 3. Dev Rules View (GEMINI.md)
router.get('/dev-rules', (req, res) => {
  // Look for GEMINI.md in common locations
  const possiblePaths = [
    path.join('C:', 'Users', 'sideb', '.gemini', 'GEMINI.md'),
    path.join(__dirname, '..', '..', 'GEMINI.md')
  ];
  
  let content = 'GEMINI.md not found.';
  let filePath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      content = fs.readFileSync(p, 'utf8');
      filePath = p;
      break;
    }
  }
  res.json({ content, filePath });
});

router.put('/dev-rules', (req, res) => {
  const { content, filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: 'No file path provided' });
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Features View
router.get('/features', (req, res) => {
  const features = readJsonFile('feature.JSON');
  res.json(features);
});

router.put('/features', (req, res) => {
  writeJsonFile('feature.JSON', req.body);
  res.json({ success: true });
});

// 5. Ngrok Tunnel Management
let ngrokListener = null;

export const startNgrok = async () => {
  if (ngrokListener) return ngrokListener.url();
  if (!config.ngrok.authtoken) return null;

  try {
    ngrokListener = await ngrok.forward({
      addr: 5173,
      authtoken: config.ngrok.authtoken,
      domain: config.ngrok.domain
    });
    console.log(`\n🌍 Ngrok Tunnel Active: ${ngrokListener.url()}`);
    return ngrokListener.url();
  } catch (err) {
    console.error(`❌ Ngrok Failed to start: ${err.message}`);
    return null;
  }
};

router.get('/ngrok/status', async (req, res) => {
  if (ngrokListener) {
    res.json({ active: true, url: ngrokListener.url() });
  } else {
    res.json({ active: false, url: null });
  }
});

router.post('/ngrok/toggle', async (req, res) => {
  const { action } = req.body;
  try {
    if (action === 'start') {
      const url = await startNgrok();
      res.json({ active: !!url, url });
    } else if (action === 'stop') {
      if (ngrokListener) {
        await ngrokListener.close();
        ngrokListener = null;
      }
      res.json({ active: false, url: null });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
