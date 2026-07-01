import { defineConfig } from 'vite';
import { portfolioApiPlugin } from './server/vite-api-plugin.js';

export default defineConfig({
  plugins: [portfolioApiPlugin()],
});
