import { createServer } from 'http';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';

const PORT = parseInt(process.env.API_PORT || '3001', 10);
if (isNaN(PORT)) throw new Error(`Invalid API_PORT: "${process.env.API_PORT}"`);

const CORS_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:3000';

const handler = toNodeHandler(auth);

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  handler(req, res);
}).listen(PORT, () => {
  console.log(`API server → http://localhost:${PORT}`);
});
