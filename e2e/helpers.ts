import type { Page } from "@playwright/test";

export async function clickNext(page: Page) {
  await page.getByTestId("step-next").click();
}
