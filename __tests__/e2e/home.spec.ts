import { test, expect } from '@playwright/test';

test('should load the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ByteTools/i);
  await expect(page.locator('h1')).toContainText(/Essential tools for your/i);
});

test('should navigate to tools section', async ({ page }) => {
  await page.goto('/');
  // Click on "Explore Tools" button
  await page.click('text=Explore Tools');
  // Check if URL contains #tools
  await expect(page).toHaveURL(/#tools/);
  // Check if the tools section is visible
  await expect(page.locator('#tools')).toBeVisible();
});
