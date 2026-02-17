import { test, expect } from '@playwright/test';

test('guest can join the town', async ({ page }) => {
  await page.goto('/');

  // Expect title
  await expect(page.getByRole('heading', { name: 'Feedback Town' })).toBeVisible();

  // Expect Guest Login component
  await expect(page.getByText('Join as Guest')).toBeVisible();

  // Wait for guest ID to be generated (client-side effect)
  await expect(page.getByText('Your Guest ID:')).toBeVisible();

  // Check LocalStorage
  const guestId = await page.evaluate(() => localStorage.getItem('guest_id'));
  expect(guestId).toBeTruthy();

  // Select an Avatar (Red)
  const redButton = page.getByRole('button', { name: 'Select Red' });
  await expect(redButton).toBeVisible();
  await redButton.click();

  // Click join (currently alerts, so we handle dialog)
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Enter Town' }).click();
});
