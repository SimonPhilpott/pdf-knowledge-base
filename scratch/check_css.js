
import fs from 'fs';

const css = fs.readFileSync('client/src/index.css', 'utf-8');
let stack = 0;
let line = 1;
for (let i = 0; i < css.length; i++) {
  if (css[i] === '\n') line++;
  if (css[i] === '{') stack++;
  if (css[i] === '}') stack--;
  if (stack < 0) {
    console.log(`Extra closing brace at line ${line}`);
    break;
  }
}
if (stack > 0) {
  console.log(`Missing closing brace! Stack: ${stack}`);
} else if (stack === 0) {
  console.log('Braces match!');
}
