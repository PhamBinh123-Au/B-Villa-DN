const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

async function run() {
  const files = getFiles(IMAGES_DIR);
  console.log(`Found ${files.length} images to optimize.`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    const originalBuffer = fs.readFileSync(file);
    const originalSize = originalBuffer.length;
    totalOriginal += originalSize;

    const ext = path.extname(file).toLowerCase();
    try {
      let pipeline = sharp(originalBuffer).resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      });

      let buffer;
      if (ext === '.png') {
        buffer = await pipeline.png({ quality: 85, compressionLevel: 9 }).toBuffer();
      } else {
        buffer = await pipeline
          .jpeg({ quality: 82, mozjpeg: true, progressive: true })
          .toBuffer();
      }

      // Only overwrite if new size is smaller and valid
      if (buffer.length < originalSize) {
        fs.writeFileSync(file, buffer);
        totalOptimized += buffer.length;
        console.log(`✓ ${path.relative(IMAGES_DIR, file)}: ${(originalSize / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB (-${((1 - buffer.length / originalSize) * 100).toFixed(0)}%)`);
      } else {
        totalOptimized += originalSize;
        console.log(`- ${path.relative(IMAGES_DIR, file)}: already optimal`);
      }
    } catch (err) {
      console.error(`Error optimizing ${file}:`, err.message);
      totalOptimized += originalSize;
    }
  }

  console.log('--------------------------------------------------');
  console.log(`Total original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total optimized: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total saved: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
}

run();
