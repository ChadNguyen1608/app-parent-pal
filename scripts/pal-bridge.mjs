// Cầu nối để dev thử Pal thật: app gửi {system, prompt} tới đây, đây hỏi Claude rồi trả {text}.
// Hai chế độ:
//  - API key (ưu tiên): có biến ANTHROPIC_API_KEY hoặc file key/anthropic-api-key.txt thì gọi thẳng API (mặc định Haiku),
//    system được đặt cache_control để các lượt sau tính khoảng 10% giá đầu vào. Log số token và chi phí ước tính mỗi lượt.
//  - Claude Code: không có key thì dùng claude -p bằng phiên đăng nhập của người dev (gói cá nhân, chỉ để dev).
// Key không bao giờ đưa vào app: app chỉ nói chuyện với cầu nối này. Bản cho người dùng thật sẽ là Edge Function pal-chat.
//
// Chạy: node scripts/pal-bridge.mjs [--port 8787] [--lan] [--model claude-haiku-5-5] [--max-tokens 8000] [--effort low|medium|high]
// Emulator Android gọi tới http://10.0.2.2:8787/pal. Máy thật: --lan rồi đặt EXPO_PUBLIC_PAL_BRIDGE_URL.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const arg = (name, def) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
};
const PORT = +arg('--port', 8787);
const HOST = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1';
const MODEL = arg('--model', '');
const TIMEOUT_MS = +arg('--timeout', 420000);

// Tìm lệnh claude: --claude <đường dẫn>, biến CLAUDE_BIN, bản npm toàn cục (khi shim trong PATH hỏng), rồi lệnh claude trong PATH.
function findClaude() {
  const given = arg('--claude', process.env.CLAUDE_BIN || '');
  if (given) return { cmd: given, shell: false };
  const npmExe = process.env.APPDATA && path.join(process.env.APPDATA, 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe');
  if (npmExe && fs.existsSync(npmExe)) return { cmd: npmExe, shell: false };
  return { cmd: 'claude', shell: true };
}
const CLAUDE = findClaude();

// Bỏ các biến môi trường của phiên Claude Code đang chạy (nếu khởi động cầu nối từ trong đó), để claude dùng phiên đăng nhập của máy.
const CHILD_ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC|AI_AGENT|BAGGAGE)/i.test(k)));

const DEFAULT_MODEL = 'claude-haiku-5-5';
const MAX_TOKENS = +arg('--max-tokens', 8000);
// Giá USD / 1 triệu token (đầu vào, ghi cache, đọc cache, đầu ra), chỉ để ước tính chi phí trong log.
const PRICE = { 'claude-haiku-5-5': [0.1, 0.125, 0.01, 0.5] }; // dưới 100K token đầu vào; ghi cache = 1,25 lần, đọc cache = 0,1 lần giá vào

function readKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  const file = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', 'key', 'anthropic-api-key.txt');
  try { return fs.readFileSync(file, 'utf8').trim(); } catch { return ''; }
}
const API_KEY = readKey();
const API_MODEL = MODEL || DEFAULT_MODEL;
const EFFORT = arg('--effort', 'low');

async function askApi(system, prompt) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: API_MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: EFFORT }, // Haiku 5.5 mặc định medium; JSON lập lịch thử ở low để bớt token suy nghĩ
      system: system ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }] : undefined,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j) throw new Error('API lỗi ' + r.status + ': ' + (j?.error?.message || 'không đọc được phản hồi'));
  const text = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  const u = j.usage || {};
  const [pi, pw, pr, po] = PRICE[API_MODEL] || [0, 0, 0, 0];
  const cost = ((u.input_tokens || 0) * pi + (u.cache_creation_input_tokens || 0) * pw + (u.cache_read_input_tokens || 0) * pr + (u.output_tokens || 0) * po) / 1e6;
  const note = j.stop_reason === 'max_tokens' ? ' | CẢNH BÁO: bị cắt do hết max_tokens' : '';
  console.log(`   token: vào ${u.input_tokens || 0}, ghi cache ${u.cache_creation_input_tokens || 0}, đọc cache ${u.cache_read_input_tokens || 0}, ra ${u.output_tokens || 0} | ước tính ${cost.toFixed(4)}${note}`);
  return text;
}

function askClaude(prompt) {
  return new Promise((resolve, reject) => {
    const args = ['-p', '--output-format', 'json', '--no-session-persistence', '--tools', CLAUDE.shell ? '""' : ''];
    if (MODEL) args.push('--model', MODEL);
    const p = spawn(CLAUDE.cmd, args, { shell: CLAUDE.shell, stdio: ['pipe', 'pipe', 'pipe'], env: CHILD_ENV });
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
    let prompt, system;
    try { ({ prompt, system } = JSON.parse(body)); } catch { return send(400, { error: 'Body không phải JSON' }); }
    if (typeof prompt !== 'string' || !prompt.trim()) return send(400, { error: 'Thiếu prompt' });
    const t0 = Date.now();
    try {
      const text = API_KEY ? await askApi(system, prompt) : await askClaude((system ? system + '\n\n' : '') + prompt);
      console.log(`[${new Date().toLocaleTimeString()}] ${prompt.length} ký tự vào, ${text.length} ký tự ra, ${Math.round((Date.now() - t0) / 1000)} giây`);
      send(200, { text });
    } catch (e) {
      console.error('Lỗi:', e.message);
      send(502, { error: e.message });
    }
  });
});

console.log(API_KEY ? `Chế độ API key, model ${API_MODEL}` : `Chế độ Claude Code, dùng claude: ${CLAUDE.cmd}`);
server.listen(PORT, HOST, () => console.log(`Cầu nối Pal chạy ở http://${HOST}:${PORT}/pal (dev)`));
