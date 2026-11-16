// Máy chủ tĩnh cho bản web đã xuất, có fallback SPA: đường dẫn không có file thì trả index.html.
// Dùng: node e2e/serve.mjs <thư mục> <cổng>
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const port = Number(process.argv[3] ?? 4100);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

async function pick(urlPath) {
  const rel = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  const file = resolve(join(root, rel));
  if (file !== root && !file.startsWith(root + '/')) return join(root, 'index.html');
  try {
    if ((await stat(file)).isFile()) return file;
  } catch {
    /* không có file: rơi xuống index.html */
  }
  return join(root, 'index.html');
}

createServer(async (req, res) => {
  try {
    const file = await pick(new URL(req.url ?? '/', 'http://x').pathname);
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(500).end('lỗi máy chủ tĩnh');
  }
}).listen(port, '127.0.0.1', () => console.log(`serve ${root} tại http://127.0.0.1:${port}`));
