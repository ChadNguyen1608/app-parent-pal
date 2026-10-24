// Đóng gói bản web (dist/) thành MỘT file HTML tự chứa, để đăng làm trang xem thử.
// Nhúng mã JS và các font thực sự dùng (Be Vietnam Pro 400/500/600, Feather) dưới dạng data URI.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const out = path.resolve(process.argv[2] ?? 'artifact/parent-pal.html');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);
if (!scripts.length) throw new Error('Không thấy script nào trong dist/index.html');

const KEEP = /(BeVietnamPro_(400Regular|500Medium|600SemiBold)\.[a-f0-9]+\.ttf|Fonts\/Feather\.[a-f0-9]+\.ttf)$/;
let js = scripts.map((s) => fs.readFileSync(path.join(dist, s), 'utf8')).join('\n;\n');
let inlined = 0;
js = js.replace(/"(\/assets\/[^"]+\.ttf)"/g, (all, url) => {
  if (!KEEP.test(url)) return all;
  const file = path.join(dist, decodeURIComponent(url));
  inlined++;
  return `"data:font/ttf;base64,${fs.readFileSync(file).toString('base64')}"`;
});
if (inlined < 4) throw new Error(`Chỉ nhúng được ${inlined} font, kỳ vọng 4`);
js = js.replace(/<\/script/gi, '<\\/script');

const page = `<title>Parent-Pal</title>
<style>
/* Một màn hình ứng dụng: khung trò chuyện đầy chiều cao; màu thật do ứng dụng tự vẽ theo cùng bộ màu. */
:root { --bg: #E9EEF1; --ink: #1D2B36; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #15212A; --ink: #E4ECF0; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #15212A; --ink: #E4ECF0; color-scheme: dark }
html, body { height: 100%; }
body { background: var(--bg); color: var(--ink); overflow: hidden; }
#root { display: flex; height: 100%; flex: 1; }
</style>
<div id="root"></div>
<noscript>Cần bật JavaScript để dùng Parent-Pal.</noscript>
<script>${js}</script>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, page);
console.log(`Đã tạo ${out} (${(page.length / 1024 / 1024).toFixed(2)} MB, ${inlined} font nhúng)`);
