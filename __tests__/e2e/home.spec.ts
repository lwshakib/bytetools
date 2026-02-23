// Import 'test' and 'expect' utilities from the Playwright testing library
// 'test' is used to define a test case, while 'expect' is used to assert conditions within the test
import { test, expect } from '@playwright/test';

// Define a test case named 'should load the home page'
// The async function receives the Playwright 'page' object which represents a single browser tab
test('should load the home page', async ({ page }) => {
  // Instruct the browser to navigate to the root URL ('/') of the application
  await page.goto('/');

  // Assert that the page title matches the regular expression /ByteTools/i (case-insensitive)
  // This verifies that the document level <title> is correctly set
  await expect(page).toHaveTitle(/ByteTools/i);

  // Locate the first 'h1' heading element on the page and assert its text content
  // It checks if it contains the phrase "Essential tools for your" (case-insensitive)
  await expect(page.locator('h1')).toContainText(/Essential tools for your/i);
});

// Define another test case named 'should navigate to tools section'
// This test simulates user interaction flows and navigation behaviors
test('should navigate to tools section', async ({ page }) => {
  // Start by loading the home page again to ensure a clean state
  await page.goto('/');

  // Simulate a user click on an element containing the specific text "Explore Tools"
  // This is presumably a button or link that scrolls or navigates to the tools section
  await page.click('text=Explore Tools');

  // Assert that the current URL of the page contains the anchor '#tools'
  // This confirms that the click action successfully triggered anchor navigation in the browser
  await expect(page).toHaveURL(/#tools/);

  // Locate the HTML element with the id 'tools' and verify that it is visible to the user
  // This ensures the element is not hidden by CSS (e.g., display: none or visibility: hidden)
  await expect(page.locator('#tools')).toBeVisible();
});
