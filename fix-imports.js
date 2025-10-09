// Fix import paths for UI components
const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'frontend', 'src', 'components', 'ui');
const files = fs.readdirSync(uiDir).filter(file => file.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(uiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the incorrect import path with the correct one
  content = content.replace(
    /import { cn } from "\.\.\/\.\.\/lib\/utils"/g, 
    'import { cn } from "../../../lib/utils"'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed import in ${file}`);
});

console.log('All imports fixed!');