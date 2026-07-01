import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ASSETS_PATH = path.join(ROOT, 'src', 'assets.js');

dotenv.config({ path: path.join(ROOT, '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function loadAssets() {
  const content = fs.readFileSync(ASSETS_PATH, 'utf8');
  const match = content.match(/export const portfolioAssets = (\[[\s\S]*\]);/);
  return JSON.parse(match[1]);
}

function saveAssets(assets) {
  fs.writeFileSync(
    ASSETS_PATH,
    `export const portfolioAssets = ${JSON.stringify(assets, null, 2)};\n`
  );
}

function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
}

async function uploadLargeAsset(asset) {
  const tmpPath = path.join(os.tmpdir(), `9teen-${asset.id}.jpg`);
  const buffer = dataUrlToBuffer(asset.url);

  await sharp(buffer)
    .rotate()
    .resize({ width: 4000, height: 4000, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(tmpPath);

  const size = fs.statSync(tmpPath).size;
  console.log(`  Compressed to ${(size / 1024 / 1024).toFixed(2)} MB`);

  try {
    const result = await cloudinary.uploader.upload(tmpPath, {
      folder: `9teen-visuals/${asset.category}`,
      public_id: asset.id,
      overwrite: true,
      resource_type: 'image',
    });
    return { ...asset, url: result.secure_url };
  } finally {
    fs.unlinkSync(tmpPath);
  }
}

async function main() {
  const assets = loadAssets();
  const pending = assets.filter((a) => a.url.startsWith('data:'));
  console.log(`Retrying ${pending.length} large image(s)...`);

  for (const asset of pending) {
    console.log(`[Upload] ${asset.id} (${(asset.url.length / 1024 / 1024).toFixed(2)} MB base64)...`);
    const updated = await uploadLargeAsset(asset);
    const idx = assets.findIndex((a) => a.id === asset.id);
    assets[idx] = updated;
    console.log(`[Done] ${updated.url}`);
  }

  saveAssets(assets);
  console.log(`\nDone. File size: ${(fs.statSync(ASSETS_PATH).size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
