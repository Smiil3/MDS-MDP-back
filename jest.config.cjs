module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  setupFiles: ["<rootDir>/src/tests/setup-env.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
};
