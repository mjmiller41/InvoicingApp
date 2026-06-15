import { createServer } from 'http';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';

const handler = toNodeHandler(auth);

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  handler(req, res);
}).listen(3001, () => {
  console.log('API server → http://localhost:3001');
});
