const fs = require('fs');
const path = require('path');

// Path to your UI components
const uiDir = path.resolve('./frontend/src/components/ui');

// Read all the JSX files
fs.readdir(uiDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }
  
  // Process each JSX file
  files.filter(file => file.endsWith('.jsx')).forEach(file => {
    const filePath = path.join(uiDir, file);
    
    // Read file content
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading ${file}:`, err);
        return;
      }
      
      // Replace import paths
      const updatedContent = data.replace(/from "\.\.\/\.\.\/lib\/utils"/g, 'from "../../../lib/utils"');
      
      // Write back if content changed
      if (updatedContent !== data) {
        fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
          if (err) {
            console.error(`Error writing ${file}:`, err);
            return;
          }
          console.log(`Updated ${file}`);
        });
      } else {
        console.log(`No changes needed for ${file}`);
      }
    });
  });
});