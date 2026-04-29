import fs from 'fs';

const filePath = './client/src/index.css';
let content = fs.readFileSync(filePath, 'utf8');

// Add Persona Hover Bridge
const hoverBridge = `
/* Persona Hover Bridge */
.gem-active-card::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 0;
  right: 0;
  height: 15px;
  display: none;
}
.gem-active-card:hover::after {
  display: block;
}
.gem-active-card:hover .gem-dropdown-content {
  opacity: 1;
  visibility: visible;
  transform: translateY(4px);
  pointer-events: all;
}
`;

if (!content.includes('Persona Hover Bridge')) {
  content += hoverBridge;
}

// Ensure Canvas is visible and not hidden by its animation or z-index
if (content.includes('.canvas-container {')) {
  content = content.replace('.canvas-container {', '.canvas-container {\n  flex-shrink: 0;\n  min-width: 400px;');
}

fs.writeFileSync(filePath, content);
console.log('CSS enhancements added successfully.');
