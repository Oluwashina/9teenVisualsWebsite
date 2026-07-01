import {
  listPortfolioImages,
  deletePortfolioImage,
  uploadPortfolioImage,
} from '../../server/cloudinary-api.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

function parseBody(event) {
  let body = event.body || '';

  if (event.isBase64Encoded) {
    body = Buffer.from(body, 'base64').toString('utf-8');
  }

  return JSON.parse(body || '{}');
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const images = await listPortfolioImages();
      return { statusCode: 200, headers, body: JSON.stringify({ images }) };
    }

    if (event.httpMethod === 'POST') {
      const { category, file } = parseBody(event);
      if (!category || !file) throw new Error('category and file are required');
      const image = await uploadPortfolioImage(file, category);
      return { statusCode: 200, headers, body: JSON.stringify({ image }) };
    }

    if (event.httpMethod === 'DELETE') {
      const { publicId } = parseBody(event);
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
