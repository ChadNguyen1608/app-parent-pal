// Metro mặc định của Expo. Thêm .wasm vào assetExts để xuất được bản web (expo-sqlite chạy bằng wasm trên web);
// chỉ phục vụ test E2E trên CI (scripts/build-web.mjs). Không đổi gì cho build Android.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');

module.exports = config;
