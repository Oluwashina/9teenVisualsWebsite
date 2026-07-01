import dotenv from 'dotenv';
import { listPortfolioImages, deletePortfolioImage } from '../../server/cloudinary-api.js';

dotenv.config();

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const images = await listPortfolioImages();
      return { statusCode: 200, headers, body: JSON.stringify({ images }) };
    }

    if (event.httpMethod === 'DELETE') {
      const { publicId } = JSON.parse(event.body || '{}');
      if (!publicId) throw new Error('publicId is required');
      await deletePortfolioImage(publicId);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('[Netlify] Portfolio API error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
}
