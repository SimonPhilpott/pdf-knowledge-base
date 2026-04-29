import fs from 'fs';
import path from 'path';

const filePath = './client/src/index.css';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Line 783: .sidebar-section padding
if (lines[782].includes('padding: var(--space-md);')) {
  lines[782] = lines[782].replace('padding: var(--space-md);', 'padding: 8px var(--space-md);');
}

// Line 1523: .topic-panel-content padding
if (lines[1522].includes('padding: var(--space-md);')) {
  lines[1522] = lines[1522].replace('padding: var(--space-md);', 'padding: 6px var(--space-md);');
}

// Line 1541: .topic-search-wrapper margin
if (lines[1540].includes('margin: 0 var(--space-md) var(--space-md);')) {
  lines[1540] = lines[1540].replace('margin: 0 var(--space-md) var(--space-md);', 'margin: 0 var(--space-md) 6px;');
}

// Line 3670: .gem-selector-container margin-bottom
if (lines[3669].includes('margin-bottom: 16px;')) {
  lines[3669] = lines[3669].replace('margin-bottom: 16px;', 'margin-bottom: 6px;');
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('CSS spacing fixed successfully.');
