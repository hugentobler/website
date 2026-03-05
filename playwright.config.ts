import { defineConfig, devices } from "@playwright/test";

const port = 4173;

export default defineConfig({
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  testDir: "tests",
  testMatch: ["**/*.e2e.spec.ts"],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
  },
  webServer: {
    command: `bun run dev -- --host 127.0.0.1 --port ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
  },
});
