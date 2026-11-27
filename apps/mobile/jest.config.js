// Test component (jest-expo + @testing-library/react-native). Tách khỏi `npm test` (node:test, thư mục test/).
// Chạy: npm run test:component
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/component-test/**/*.spec.tsx'],
  setupFiles: ['<rootDir>/component-test/setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  // CI chậm hơn máy dev: lần render đầu (nạp jest-expo) có thể quá 5 giây mặc định.
  testTimeout: 30000,
};
