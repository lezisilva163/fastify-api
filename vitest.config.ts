import { defineConfig } from "vitest/config";
import { config } from "dotenv";

// Carrega as variáveis de ambiente do .env
config();

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
