import { test, expect } from "@playwright/test";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "change-me-in-production";

test.describe("Full booking flow", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL and seeded database");

  test("book → admin confirm", async ({ page }) => {
  const guestEmail = `e2e-${Date.now()}@test.local`;
  const guestName = "E2E Test User";

  await page.goto("/pl/book");
  await page.getByTestId("duration-30").click();
  await page.getByTestId("step-next").click();

  await page.getByTestId("location-online").click();
  await page.getByTestId("step-next").click();

  const firstDate = page.locator("[data-testid^='date-']").first();
  await expect(firstDate).toBeVisible({ timeout: 15000 });
  await firstDate.click();

  const firstTime = page.locator("[data-testid^='time-']").first();
  await expect(firstTime).toBeVisible({ timeout: 10000 });
  await firstTime.click();
  await page.getByTestId("step-next").click();

  await page.getByTestId("guest-name").fill(guestName);
  await page.getByTestId("guest-email").fill(guestEmail);

  await page.waitForTimeout(2000);
  await page.getByTestId("submit-booking").click();

  await expect(page.getByTestId("booking-success")).toBeVisible({ timeout: 15000 });

  await page.goto("/pl/admin/login");
  await page.locator("#password").fill(ADMIN_SECRET);
  await page.getByRole("button", { name: /zaloguj|sign in/i }).click();

  await page.waitForURL(/\/pl\/admin/);
  await page.goto("/pl/admin/bookings?status=pending");
  await expect(page.getByText(guestEmail)).toBeVisible({ timeout: 10000 });

  await page.getByText(guestEmail).locator("..").locator("..").getByRole("button").click();
  await page.getByTestId("confirm-booking").click();

  await page.waitForTimeout(1000);
  await expect(page.getByText(/potwierdzon|confirmed/i)).toBeVisible();
  });
});
