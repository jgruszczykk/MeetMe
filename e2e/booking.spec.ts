import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/pl");
  await expect(page.getByRole("heading")).toBeVisible();
});

test("book page loads", async ({ page }) => {
  await page.goto("/pl/book");
  await expect(page.locator("body")).toBeVisible();
});

test("admin login page loads", async ({ page }) => {
  await page.goto("/pl/admin/login");
  await expect(page.getByRole("heading")).toBeVisible();
});
