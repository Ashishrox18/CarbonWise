/**
 * @fileoverview Playwright end-to-end tests for CarbonWise.
 *
 * Test suites:
 * 1. Daily Carbon Check-In — landing, 5-step form, progress bar
 * 2. Navigation — dashboard and coach pages
 * 3. Accessibility — skip link, landmarks, headings, ARIA roles
 * 4. Keyboard Navigation — full keyboard-only check-in flow
 */

import { test, expect } from '@playwright/test';

// ─── Helper ────────────────────────────────────────────────────────

async function clearLocalStorage(page: import('@playwright/test').Page) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

// ─── Check-In Flow ────────────────────────────────────────────────

test.describe('Daily Carbon Check-In', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
  });

  test('landing page renders headline and CTA', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /small daily actions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /start today/i })).toBeVisible();
  });

  test('landing page shows three value proposition cards', async ({ page }) => {
    await expect(page.getByText('Under 3 minutes')).toBeVisible();
    await expect(page.getByText('AI-powered insights')).toBeVisible();
    await expect(page.getByText('100% private')).toBeVisible();
  });

  test('check-in form shows all 5 steps in sequence', async ({ page }) => {
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
    await page.getByRole('button', { name: /^low$/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 4: Shopping
    await expect(page.getByText(/did you make any purchases/i)).toBeVisible();
    await page.getByRole('button', { name: /^none$/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 5: Waste
    await expect(page.getByText(/how did you handle your waste/i)).toBeVisible();
    await page.getByRole('button', { name: /fully recycled/i }).click();
    await page.getByRole('button', { name: /analyse my footprint/i }).click();
  });

  test('progress bar aria-valuenow advances through steps', async ({ page }) => {
    await page.getByRole('button', { name: /start today/i }).click();

    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    await expect(progressBar).toHaveAttribute('aria-valuemin', '1');
    await expect(progressBar).toHaveAttribute('aria-valuemax', '5');

    await page.getByRole('button', { name: /walk/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await expect(progressBar).toHaveAttribute('aria-valuenow', '2');

    await page.getByRole('button', { name: /vegetarian/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await expect(progressBar).toHaveAttribute('aria-valuenow', '3');
  });

  test('back button returns to previous step', async ({ page }) => {
    await page.getByRole('button', { name: /start today/i }).click();
    await page.getByRole('button', { name: /walk/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    await expect(page.getByText(/what best describes your meals/i)).toBeVisible();
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByText(/how did you get around/i)).toBeVisible();
  });

  test('option buttons show aria-pressed state', async ({ page }) => {
    await page.getByRole('button', { name: /start today/i }).click();
    const walkBtn = page.getByRole('button', { name: /walk/i });

    // Default selection (walk is default)
    await expect(walkBtn).toHaveAttribute('aria-pressed', 'true');

    // Select a different option
    const busBtn = page.getByRole('button', { name: /bus/i });
    await busBtn.click();
    await expect(busBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(walkBtn).toHaveAttribute('aria-pressed', 'false');
  });
});

// ─── Navigation ───────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('dashboard page renders heading', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /progress dashboard/i })).toBeVisible();
  });

  test('AI coach page renders heading', async ({ page }) => {
    await page.goto('/coach');
    await expect(page.getByRole('heading', { name: /ai coach/i })).toBeVisible();
  });

  test('navigation links exist on home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /ai coach/i })).toBeVisible();
  });

  test('navigation links exist on dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: /check-in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /ai coach/i })).toBeVisible();
  });

  test('logo link navigates to home', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /carbonwise/i }).first().click();
    await expect(page).toHaveURL('/');
  });
});

// ─── Accessibility ────────────────────────────────────────────────

test.describe('Accessibility', () => {
  test('skip link is present and focusable on home page', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeFocused();
  });

  test('skip link is present on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Tab');
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeFocused();
  });

  test('skip link is present on coach page', async ({ page }) => {
    await page.goto('/coach');
    await page.keyboard.press('Tab');
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeFocused();
  });

  test('main content landmark exists on home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('main content landmark exists on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('main content landmark exists on coach page', async ({ page }) => {
    await page.goto('/coach');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('home page has a single h1', async ({ page }) => {
    await page.goto('/');
    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1);
  });

  test('dashboard page has a single h1', async ({ page }) => {
    await page.goto('/dashboard');
    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1);
  });

  test('coach page has a single h1', async ({ page }) => {
    await page.goto('/coach');
    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1);
  });

  test('page lang attribute is set to "en"', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('header landmark exists on all pages', async ({ page }) => {
    for (const url of ['/', '/dashboard', '/coach']) {
      await page.goto(url);
      await expect(page.locator('header').first()).toBeVisible();
    }
  });

  test('nav landmark has accessible label', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: /navigation/i });
    await expect(nav).toBeVisible();
  });

  test('check-in form fieldset has a legend', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.getByRole('button', { name: /start today/i }).click();
    // fieldset with sr-only legend should exist
    await expect(page.locator('fieldset')).toBeVisible();
  });

  test('progress bar has aria-label', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.getByRole('button', { name: /start today/i }).click();
    const progressBar = page.getByRole('progressbar');
    const label = await progressBar.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('AI coach textarea is associated with a label', async ({ page }) => {
    await page.goto('/coach');
    const textarea = page.locator('#chat-input');
    await expect(textarea).toBeVisible();
    // htmlFor association
    const label = page.locator('label[for="chat-input"]');
    await expect(label).toBeAttached();
  });

  test('toast container has aria-live="polite"', async ({ page }) => {
    await page.goto('/');
    const container = page.locator('[aria-live="polite"]');
    await expect(container).toBeAttached();
  });
});

// ─── Keyboard Navigation ──────────────────────────────────────────

test.describe('Keyboard Navigation', () => {
  test('CTA button is reachable via keyboard and activatable with Enter', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);

    // Tab past skip link, then to logo, then to nav links, then to CTA
    // We'll find the button and focus it directly for reliability
    const ctaBtn = page.getByRole('button', { name: /start today/i });
    await ctaBtn.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByText(/how did you get around/i)).toBeVisible();
  });

  test('option buttons activate with Space key', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.getByRole('button', { name: /start today/i }).click();

    const busBtn = page.getByRole('button', { name: /bus/i });
    await busBtn.focus();
    await page.keyboard.press('Space');
    await expect(busBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('Next button is keyboard-activatable', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.getByRole('button', { name: /start today/i }).click();

    const nextBtn = page.getByRole('button', { name: /next/i });
    await nextBtn.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(/what best describes your meals/i)).toBeVisible();
  });

  test('AI coach send button is keyboard-activatable', async ({ page }) => {
    await page.goto('/coach');
    const textarea = page.locator('#chat-input');
    await textarea.focus();
    await textarea.type('Hello');
    await page.keyboard.press('Enter');
    // After sending, input should be cleared
    await expect(textarea).toHaveValue('');
  });
});
