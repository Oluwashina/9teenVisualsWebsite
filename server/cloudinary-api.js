import { v2 as cloudinary } from 'cloudinary';

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

export async function deletePortfolioImage(publicId) {
  configureCloudinary();
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary delete failed: ${result.result}`);
  }
  return result;
}
