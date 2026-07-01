import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PRESET_NAME = process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '9teen_portfolio';

async function ensureUploadPreset() {
  try {
    await cloudinary.api.upload_preset(PRESET_NAME);
    console.log(`Upload preset "${PRESET_NAME}" already exists.`);
    return;
  } catch {
    // Preset missing — create it below.
  }

  const result = await cloudinary.api.create_upload_preset({
    name: PRESET_NAME,
    unsigned: true,
    folder: '9teen-visuals',
    allowed_formats: 'jpg,jpeg,png,webp',
  });

  console.log(`Created unsigned upload preset "${result.name}".`);
}

ensureUploadPreset().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
