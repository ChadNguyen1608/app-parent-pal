// Đọc app.json, thêm google-services.json từ biến file của EAS (GOOGLE_SERVICES_JSON).
// File thật không nằm trong repo.
// Cầu nối Pal dev gọi http://10.0.2.2:8787 nên cho phép HTTP thường, trừ bản production.
const dev = process.env.EAS_BUILD_PROFILE !== 'production';

module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins ?? []), ['expo-build-properties', { android: { usesCleartextTraffic: dev } }]],
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
});
