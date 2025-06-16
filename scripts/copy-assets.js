const fs = require('fs');
const path = require('path');

// Ensure assets are properly copied to build directory
const sourceDir = path.join(__dirname, '../public/assets');
const targetDir = path.join(__dirname, '../build/assets');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(sourceDir)) {
  console.log('Copying assets to build directory...');
  copyDir(sourceDir, targetDir);
  console.log('Assets copied successfully!');
} else {
  console.log('Source assets directory not found:', sourceDir);
} 