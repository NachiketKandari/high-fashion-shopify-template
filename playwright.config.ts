import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/design",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.01 },
  },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: ".playwright/design-results.json" }]],
  use: {
    baseURL: process.env.DESIGN_BASE_URL ?? "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
  ],
  webServer: process.env.DESIGN_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        reuseExistingServer: true,
        stderr: "ignore",
        stdout: "ignore",
        timeout: 120_000,
        url: "http://localhost:3000",
      },
});
