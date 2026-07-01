import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { listPortfolioImages, deletePortfolioImage } from './cloudinary-api.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(data));
}

function handlePortfolioApi(req, res) {
  if (!req.url?.startsWith('/api/portfolio')) return false;

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return true;
  }

  if (req.method === 'GET') {
    listPortfolioImages()
      .then((images) => sendJson(res, 200, { images }))
      .catch((err) => {
        console.error('[API] List error:', err.message);
        sendJson(res, 500, { error: err.message });
      });
    return true;
  }

  if (req.method === 'DELETE') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { publicId } = JSON.parse(body);
        if (!publicId) throw new Error('publicId is required');
        await deletePortfolioImage(publicId);
        sendJson(res, 200, { success: true });
      } catch (err) {
        console.error('[API] Delete error:', err.message);
        sendJson(res, 500, { error: err.message });
      }
    });
    return true;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
  return true;
}

function attachApiMiddleware(server) {
  server.middlewares.use((req, res, next) => {
    if (handlePortfolioApi(req, res)) return;
    next();
  });
}

export function portfolioApiPlugin() {
  return {
    name: 'portfolio-api',
    configureServer: attachApiMiddleware,
    configurePreviewServer: attachApiMiddleware,
  };
}
