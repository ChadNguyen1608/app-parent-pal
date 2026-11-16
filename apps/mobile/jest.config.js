// Test component (jest-expo + @testing-library/react-native). Tách khỏi `npm test` (node:test, thư mục test/).
// Chạy: npm run test:component
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/component-test/**/*.spec.tsx'],
  setupFiles: ['<rootDir>/component-test/setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
