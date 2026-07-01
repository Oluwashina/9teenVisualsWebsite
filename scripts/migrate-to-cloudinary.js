import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
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

const PRESET_NAME = process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '9teen_portfolio';

async function ensureUploadPreset() {
  try {
    await cloudinary.api.upload_preset(PRESET_NAME);
    console.log(`[Setup] Upload preset "${PRESET_NAME}" already exists.`);
  } catch {
    await cloudinary.api.create_upload_preset({
      name: PRESET_NAME,
      unsigned: true,
      folder: '9teen-visuals',
      allowed_formats: 'jpg,jpeg,png,webp',
    });
    console.log(`[Setup] Created unsigned upload preset "${PRESET_NAME}".`);
  }
}

function loadAssets() {
  const content = fs.readFileSync(ASSETS_PATH, 'utf8');
  const match = content.match(/export const portfolioAssets = (\[[\s\S]*\]);/);
  if (!match) throw new Error('Could not parse portfolioAssets from assets.js');
  return JSON.parse(match[1]);
}

function saveAssets(assets) {
  const fileContent = `export const portfolioAssets = ${JSON.stringify(assets, null, 2)};\n`;
  fs.writeFileSync(ASSETS_PATH, fileContent);
}

async function uploadImage(asset) {
  if (asset.url.startsWith('http')) {
    console.log(`[Skip] ${asset.id} already on Cloudinary.`);
    return asset;
  }

  const folder = `9teen-visuals/${asset.category}`;
  console.log(`[Upload] ${asset.id} (${asset.category})...`);

  const result = await cloudinary.uploader.upload(asset.url, {
    folder,
    public_id: asset.id,
    overwrite: true,
    resource_type: 'image',
  });

  console.log(`[Done] ${asset.id} -> ${result.secure_url}`);

  return {
    id: asset.id,
    url: result.secure_url,
    category: asset.category,
  };
}

async function main() {
  console.log('Starting Cloudinary migration...\n');

  await ensureUploadPreset();

  const assets = loadAssets();
  const needsMigration = assets.filter((a) => a.url.startsWith('data:'));
  console.log(`Found ${assets.length} assets (${needsMigration.length} to migrate).\n`);

  if (needsMigration.length === 0) {
    console.log('Nothing to migrate.');
    return;
  }

  const backupPath = path.join(ROOT, 'src', 'assets.base64.backup.js');
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(ASSETS_PATH, backupPath);
    console.log(`[Backup] Saved original to assets.base64.backup.js\n`);
  }

  const migrated = [];
  for (let i = 0; i < assets.length; i++) {
    try {
      const updated = await uploadImage(assets[i]);
      migrated.push(updated);
    } catch (err) {
      console.error(`[Error] Failed on ${assets[i].id}:`, err.message);
      migrated.push(assets[i]);
    }
  }

  saveAssets(migrated);

  console.log(`\nMigration complete. Updated ${ASSETS_PATH}`);
  console.log(`New file size: ${(fs.statSync(ASSETS_PATH).size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
