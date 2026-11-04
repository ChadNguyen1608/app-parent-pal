// Cầu nối để dev thử Pal thật mà không cần khóa API: app gửi prompt tới đây, đây gọi Claude Code
// ở chế độ không giao diện (claude -p) bằng phiên đăng nhập của người dev, rồi trả văn bản lại.
//
// CHỈ DÙNG ĐỂ DEV TRÊN MÁY MÌNH. Không đưa cho gia đình test dùng (đó là dùng gói cá nhân cho người khác);
// giai đoạn đó dùng Edge Function pal-chat với khóa API.
//
// Cần: đã đăng nhập Claude Code (chạy `claude` một lần). Chạy: node scripts/pal-bridge.mjs [--port 8787] [--lan]
// Emulator Android gọi tới http://10.0.2.2:8787/pal. Máy thật: --lan rồi đặt EXPO_PUBLIC_PAL_BRIDGE_URL.
import { spawn } from 'node:child_process';
import http from 'node:http';

const arg = (name, def) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
};
const PORT = +arg('--port', 8787);
const HOST = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1';
const MODEL = arg('--model', '');
const TIMEOUT_MS = +arg('--timeout', 180000);

function askClaude(prompt) {
  return new Promise((resolve, reject) => {
    const args = ['-p', '--output-format', 'json', '--no-session-persistence', '--tools', ''];
    if (MODEL) args.push('--model', MODEL);
    const p = spawn('claude', args, { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    const timer = setTimeout(() => { p.kill(); reject(new Error('Quá thời gian chờ Claude Code')); }, TIMEOUT_MS);
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('error', (e) => { clearTimeout(timer); reject(e); });
    p.on('close', () => {
      clearTimeout(timer);
      try {
        const j = JSON.parse(out);
        if (j.is_error) reject(new Error(String(j.result || 'Claude Code báo lỗi')));
        else resolve(String(j.result ?? ''));
      } catch {
        reject(new Error('Không đọc được đầu ra của claude: ' + (err || out).slice(0, 300)));
      }
    });
    p.stdin.end(prompt);
  });
}

const server = http.createServer(async (req, res) => {
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
  if (req.method === 'GET' && req.url === '/health') return send(200, { ok: true });
  if (req.method !== 'POST' || req.url !== '/pal') return send(404, { error: 'Không có đường dẫn này' });
  let body = '';
  req.on('data', (d) => { body += d; if (body.length > 2_000_000) req.destroy(); });
  req.on('end', async () => {
    let prompt;
    try { prompt = JSON.parse(body).prompt; } catch { return send(400, { error: 'Body không phải JSON' }); }
    if (typeof prompt !== 'string' || !prompt.trim()) return send(400, { error: 'Thiếu prompt' });
    const t0 = Date.now();
    try {
      const text = await askClaude(prompt);
      console.log(`[${new Date().toLocaleTimeString()}] ${prompt.length} ký tự vào, ${text.length} ký tự ra, ${Math.round((Date.now() - t0) / 1000)} giây`);
      send(200, { text });
    } catch (e) {
      console.error('Lỗi:', e.message);
      send(502, { error: e.message });
    }
  });
});

server.listen(PORT, HOST, () => console.log(`Cầu nối Pal chạy ở http://${HOST}:${PORT}/pal (dev, dùng phiên Claude Code của bạn)`));
