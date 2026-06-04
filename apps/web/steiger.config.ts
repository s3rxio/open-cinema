import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: [
      "**/__mocks__/**",
      "**/generated/**",
      "pages/**",
      "app/**"
    ]
  },
  {
    rules: {
      "fsd/typo-in-layer-name": "off",
      "fsd/insignificant-slice": "warn",
      "fsd/excessive-slicing": "warn",
      "fsd/forbidden-imports": "off"
    }
  },
  {
    files: ["./src/shared/**"],
    rules: {
      "fsd/public-api": "off"
    }
  },
  {
    files: [
      "./src/pages/**",
      "./src/features/**",
      "./src/entities/**",
      "./src/app/**",
      "./src/shared/api/**"
    ],
    rules: {
      "fsd/no-public-api-sidestep": "off"
    }
  }
]);
