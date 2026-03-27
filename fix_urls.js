const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const frontendSrcPath = path.join(__dirname, 'frontend', 'src');

walk(frontendSrcPath, function (filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace `http://localhost:3000${product.imageUrl}`
    content = content.replace(/`http:\/\/localhost:3000\$\{([a-zA-Z0-9_]+)\.imageUrl\}`/g,
      "($1.imageUrl && $1.imageUrl.startsWith('http') ? $1.imageUrl : `http://localhost:3000${$1.imageUrl}`)");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', Math.random(), filePath);
    }
  }
});
