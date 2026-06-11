const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (file) => {
  if (!file.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  let needsArrowRight = false;
  let needsArrowLeft = false;

  content = content.replace(/\{`Buy → Pay ₹\$\{([^}]+)\}`\}/g, (match, p1) => {
    needsArrowRight = true;
    return `<>Buy <ArrowRight className="inline-block w-4 h-4 mx-1" /> Pay ₹{${p1}}</>`;
  });

  if (content.includes(' →')) {
    needsArrowRight = true;
    content = content.replace(/ →/g, ' <ArrowRight className="inline-block w-4 h-4 ml-1" />');
  }

  if (content.includes('← ')) {
    needsArrowLeft = true;
    content = content.replace(/← /g, '<ArrowLeft className="inline-block w-4 h-4 mr-1" /> ');
  }

  if (content !== originalContent) {
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/g;
    let match = importRegex.exec(content);
    
    if (match) {
      let imported = match[1];
      let newImported = imported;
      if (needsArrowRight && !imported.includes('ArrowRight')) {
        newImported += ', ArrowRight';
      }
      if (needsArrowLeft && !imported.includes('ArrowLeft')) {
        newImported += ', ArrowLeft';
      }
      if (newImported !== imported) {
        content = content.replace(match[0], `import {${newImported}} from "lucide-react"`);
      }
    } else {
      let newImports = [];
      if (needsArrowRight) newImports.push('ArrowRight');
      if (needsArrowLeft) newImports.push('ArrowLeft');
      
      const firstImportIdx = content.indexOf('import ');
      if (firstImportIdx !== -1) {
        content = content.slice(0, firstImportIdx) + `import { ${newImports.join(', ')} } from "lucide-react";\n` + content.slice(firstImportIdx);
      } else {
        content = `import { ${newImports.join(', ')} } from "lucide-react";\n` + content;
      }
    }
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
