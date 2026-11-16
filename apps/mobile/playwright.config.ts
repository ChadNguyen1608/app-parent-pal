// E2E + so ảnh trên bản web (dữ liệu giả). Cần build trước: npm run build:web
// Trên máy có sẵn Chrome: E2E_CHROME_PATH=/usr/bin/google-chrome npm run test:e2e
// Trên CI: npx playwright install --with-deps chromium (dùng chromium của Playwright).
import { defineConfig } from '@playwright/test';

const PARENT_PORT = 4101;
const CHILD_PORT = 4102;
const executablePath = process.env.E2E_CHROME_PATH || undefined;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  outputDir: './test-results',
  // Ảnh chuẩn sinh trên Linux; không gắn tên nền tảng vào tên file để CI (Linux) và máy Linux dùng chung.
  snapshotPathTemplate: '{testDir}/snapshots/{projectName}/{arg}{ext}',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]] : [['list']],
  expect: {
    // Chống nhiễu răng cưa chữ giữa các lần chạy; vẫn bắt được đổi bố cục, màu, câu chữ.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, threshold: 0.2, animations: 'disabled', caret: 'hide' },
  },
  use: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    trace: 'retain-on-failure',
    launchOptions: { executablePath, args: ['--no-sandbox', '--font-render-hinting=none'] },
  },
  projects: [
    { name: 'parent', testMatch: 'parent.spec.ts', use: { baseURL: `http://127.0.0.1:${PARENT_PORT}` } },
    { name: 'child', testMatch: 'child.spec.ts', use: { baseURL: `http://127.0.0.1:${CHILD_PORT}` } },
  ],
  webServer: [
    { command: `node e2e/serve.mjs .web-build/parent ${PARENT_PORT}`, url: `http://127.0.0.1:${PARENT_PORT}`, reuseExistingServer: !process.env.CI },
    { command: `node e2e/serve.mjs .web-build/child ${CHILD_PORT}`, url: `http://127.0.0.1:${CHILD_PORT}`, reuseExistingServer: !process.env.CI },
  ],
});
