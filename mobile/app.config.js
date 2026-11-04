// Đọc app.json, thêm google-services.json từ biến file của EAS (GOOGLE_SERVICES_JSON).
// File thật không nằm trong repo.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
});
