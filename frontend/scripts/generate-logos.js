const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_SIZES = [
  { width: 150, height: 150, name: 'logo-150.png' },
  { width: 300, height: 300, name: 'logo-300.png' },
  { width: 32, height: 32, name: 'logo-favicon.ico' }
];

const SOURCE_SVG = path.join(__dirname, '../src/assets/logo/logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/images/logo');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate PNGs
async function generateLogos() {
  try {
    // Copy SVG to public folder
    fs.copyFileSync(
      SOURCE_SVG,
      path.join(OUTPUT_DIR, 'logo.svg')
    );

    // Generate different sizes
    for (const size of LOGO_SIZES) {
      if (size.name.endsWith('.ico')) {
        // Generate favicon
        await sharp(SOURCE_SVG)
          .resize(size.width, size.height)
          .toFormat('png')
          .toBuffer()
          .then(buffer => {
            return sharp(buffer)
              .toFile(path.join(OUTPUT_DIR, size.name));
          });
      } else {
        // Generate PNG
        await sharp(SOURCE_SVG)
          .resize(size.width, size.height)
          .toFormat('png')
          .toFile(path.join(OUTPUT_DIR, size.name));
      }
    }

    console.log('Logo files generated successfully!');
  } catch (error) {
    console.error('Error generating logos:', error);
  }
}

generateLogos(); 