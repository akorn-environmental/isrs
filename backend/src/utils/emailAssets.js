const fs = require('fs');
const path = require('path');

// Cache for base64 encoded images
const imageCache = {};

function getBase64Image(imagePath) {
  if (imageCache[imagePath]) {
    return imageCache[imagePath];
  }

  try {
    // __dirname is backend/src/utils, go up 3 levels to project root
    const fullPath = path.join(__dirname, '../../..', imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    const base64 = imageBuffer.toString('base64');

    // Determine MIME type from extension
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    const mimeType = mimeTypes[ext] || 'image/png';

    const dataUri = `data:${mimeType};base64,${base64}`;
    imageCache[imagePath] = dataUri;
    return dataUri;
  } catch (err) {
    console.warn(`Could not load image ${imagePath}:`, err.message);
    return null;
  }
}

// Pre-load common email assets
function getEmailLogos() {
  return {
    isrsLogo: getBase64Image('frontend/public/images/logos/LOGO - ISRS - wide - green.png'),
    icsr2026Logo: getBase64Image('frontend/public/images/logos/LOGO - ICSR2026.png')
  };
}

module.exports = {
  getBase64Image,
  getEmailLogos
};
