// Bộ khung test e2e: phục vụ thư mục dist, mở Chromium ẩn, thu lỗi console.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };

export function serve(dir, port = 4173) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(dir, url);
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dir, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}

export async function launch() {
  return puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
}

export async function openPage(browser, url, viewport = { width: 390, height: 844, deviceScaleFactor: 2 }) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  // Mỗi kịch bản bắt đầu với bộ nhớ trình duyệt trống, không lẫn với kịch bản trước.
  await page.goto(new URL(url).origin + '/__blank', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(url, { waitUntil: 'networkidle0' });
  return { page, errors };
}

export const byId = (id) => `[data-testid="${id}"]`;

export async function waitText(page, text, timeout = 8000) {
  await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout }, text);
}

/** Gõ và gửi một tin nhắn, chờ Pal trả lời xong. */
export async function say(page, text) {
  const before = await page.$$eval('[data-testid="bubble-pal"], [data-testid="safety-card"]', (els) => els.length);
  await page.click('[data-testid="composer"]');
  await page.type('[data-testid="composer"]', text);
  await page.keyboard.press('Enter');
  await page.waitForFunction(
    (n) => document.querySelectorAll('[data-testid="bubble-pal"], [data-testid="safety-card"]').length > n && !document.querySelector('[data-testid="typing"]'),
    { timeout: 8000 },
    before,
  );
}

export async function clickText(page, text, selector = '[role="button"], [role="tab"], button') {
  const ok = await page.evaluate(
    (t, sel) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.innerText.trim() === t || e.getAttribute('aria-label') === t);
      if (!el) return false;
      el.click();
      return true;
    },
    text,
    selector,
  );
  if (!ok) throw new Error(`Không tìm thấy nút "${text}"`);
}

export const bodyText = (page) => page.evaluate(() => document.body.innerText);

export async function onboard(page, name = 'chị Lan', kids = 'bé Na 8 tuổi') {
  await waitText(page, 'mình nên gọi bạn');
  await say(page, name);
  await say(page, kids);
}
