import fs from 'fs';
const file = './client/src/index.css';
let content = fs.readFileSync(file, 'utf8');

// Fix tone-switcher gap
content = content.replace(/\.tone-switcher \{([\s\S]*?)gap: 8px;/g, (match, p1) => {
  return `.tone-switcher {${p1}gap: 1px;`;
});

// Fix mode-switcher gap (already done in previous turn but double checking)
if (!content.includes('.sidebar-section.mode-switcher {') || !content.includes('gap: 1px;')) {
    content = content.replace(/\.sidebar-section\.mode-switcher \{([\s\S]*?)\}/g, (match, p1) => {
        if (!p1.includes('gap: 1px;')) {
            return `.sidebar-section.mode-switcher {${p1}  gap: 1px;\n}`;
        }
        return match;
    });
}

fs.writeFileSync(file, content);
console.log('CSS gaps patched.');
