
import fs from 'fs';
const content = fs.readFileSync('c:/Users/Ömer/Documents/projeaa/server/index.js', 'utf8');
let openBrace = 0;
let openParen = 0;
let openTick = 0;
let lines = content.split('\n');
lines.forEach((line, i) => {
    for (let char of line) {
        if (char === '{') openBrace++;
        if (char === '}') openBrace--;
        if (char === '(') openParen++;
        if (char === ')') openParen--;
        if (char === '`') openTick++;
        if (openBrace < 0) console.log(`Negative brace at line ${i + 1}`);
        if (openParen < 0) console.log(`Negative paren at line ${i + 1}`);
    }
});
console.log(`Final brace count: ${openBrace}`);
console.log(`Final paren count: ${openParen}`);
console.log(`Final backtick count: ${openTick}`);
