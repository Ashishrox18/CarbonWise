import { test, expect } from '@playwright/test';

test.describe('Daily Carbon Check-In', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('landing page renders correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /small daily actions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /start today/i })).toBeVisible();
  });

  test('check-in form shows all 5 steps', async ({ page }) => {
    await page.getByRole('button', { name: /start today/i }).click();

    // Step 1: Transport
    await expect(page.getByText(/how did you get around/i)).toBeVisible();
    await page.getByRole('button', { name: /walk/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 2: Food
    await expect(page.getByText(/what best describes your meals/i)).toBeVisible();
    await page.getByRole('button', { name: /vegetarian/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 3: Electricity
    await expect(page.getByText(/how was your energy use/i)).toBeVisible();
    await page.getByRole('button', { name: /low/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 4: Shopping
    await expect(page.getByText(/did you make any purchases/i)).toBeVisible();
    await page.getByRole('button', { name: /none/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 5: Waste
    await expect(page.getByText(/how did you handle your waste/i)).toBeVisible();
    await page.getByRole('button', { name: /fully recycled/i }).click();
    await page.getByRole('button', { name: /analyse my footprint/i }).click();
  });

  test('progress bar advances through steps', async ({ page }) => {
    await page.getByRole('button', { name: /start today/i }).click();
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    await page.getByRole('button', { name: /walk/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await expect(progressBar).toHaveAttribute('aria-valuenow', '2');
  });
});

test.describe('Navigation', () => {
  test('dashboard page is accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /progress dashboard/i })).toBeVisible();
  });

  test('AI coach page is accessible', async ({ page }) => {
    await page.goto('/coach');
    await expect(page.getByRole('heading', { name: /ai coach/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('skip link is present and focusable', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeFocused();
  });

  test('main content landmark exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
  });
});
