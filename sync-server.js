import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const ASSETS_PATH = path.join(__dirname, 'src', 'assets.js');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/sync') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const fileContent = `export const portfolioAssets = ${JSON.stringify(data, null, 2)};\n`;

                // 1. Write the file locally
                fs.writeFileSync(ASSETS_PATH, fileContent);
                console.log(`[Sync] Updated ${ASSETS_PATH}`);

                // 2. Automatically Git Commit and Push
                const gitCommand = `git add src/assets.js && git commit -m "update: portfolio assets" && git push origin main`;

                exec(gitCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`[Git Error] ${error.message}`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'File updated, but Git push failed.' }));
                        return;
                    }
                    console.log(`[Git Success] Changes pushed to GitHub`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                });

            } catch (err) {
                console.error('[Sync Error]', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`\x1b[32m%s\x1b[0m`, `🚀 Portfolio Sync & Deploy Server running!`);
    console.log(`Watching: ${ASSETS_PATH}`);
    console.log(`Status: Ready to automatically push changes to GitHub.`);
});
