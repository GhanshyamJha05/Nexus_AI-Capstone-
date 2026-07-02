import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

// Note: correct Jest key is "setupFilesAfterFramework" (after each test framework loads)
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // @ts-expect-error - jest type definition uses this key
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],
};

export default createJestConfig(config);
