import { nxE2EPreset } from "@nx/cypress/plugins/cypress-preset";
import { defineConfig } from "cypress";
export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: "src",
      webServerCommands: {
        default: "pnpm exec nx run web:dev"
      },
      ciWebServerCommand: "pnpm exec nx run web:start",
      ciBaseUrl: "http://localhost:3000"
    }),
    baseUrl: "http://127.0.0.1:3000"
  }
});
