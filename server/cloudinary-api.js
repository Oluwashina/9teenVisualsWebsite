import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

const CATEGORIES = ['portrait', 'event', 'baby'];
const BASE_FOLDER = '9teen-visuals';

export function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      'Missing Cloudinary credentials. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env (local) or Netlify environment variables (production).'
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

async function listFolder(category) {
  const prefix = `${BASE_FOLDER}/${category}`;
  let resources = [];
  let nextCursor;

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix,
      max_results: 500,
      next_cursor: nextCursor,
    });
    resources = resources.concat(result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return resources.map((resource) => ({
    id: resource.public_id.split('/').pop(),
    publicId: resource.public_id,
    url: resource.secure_url,
    category,
  }));
}

export async function listPortfolioImages() {
  configureCloudinary();
  const results = await Promise.all(CATEGORIES.map(listFolder));
  return results.flat().sort((a, b) => b.id.localeCompare(a.id));
}

async function prepareUploadBuffer(fileBase64) {
  const dataUri = fileBase64.startsWith('data:')
    ? fileBase64
    : `data:image/jpeg;base64,${fileBase64}`;

  const base64Data = dataUri.split(',')[1];
  let buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > 9 * 1024 * 1024) {
    buffer = await sharp(buffer)
      .rotate()
      .resize({ width: 4000, height: 4000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
  }

  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

export async function uploadPortfolioImage(fileBase64, category) {
  if (!CATEGORIES.includes(category)) {
    throw new Error('Invalid category. Use portrait, event, or baby.');
  }

  configureCloudinary();

  const id = Date.now().toString();
  const folder = `${BASE_FOLDER}/${category}`;
  const uploadData = await prepareUploadBuffer(fileBase64);

  const result = await cloudinary.uploader.upload(uploadData, {
    folder,
    public_id: id,
    overwrite: false,
    resource_type: 'image',
  });

  return {
    id,
    publicId: result.public_id,
    url: result.secure_url,
    category,
  };
}

export async function deletePortfolioImage(publicId) {
  configureCloudinary();
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary delete failed: ${result.result}`);
  }
  return result;
}
