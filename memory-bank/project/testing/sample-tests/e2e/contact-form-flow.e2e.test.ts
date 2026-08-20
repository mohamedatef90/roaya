/**
 * E2E Tests: Complete Contact Form Submission Flow
 *
 * Tests the entire user journey from form fill to email notification.
 * Uses Playwright for browser automation.
 */

import { test, expect, Page } from '@playwright/test';
import { prisma } from '../../../src/lib/prisma';

test.describe('Contact Form Submission E2E', () => {
  let testEmail: string;

  test.beforeEach(({ page }) => {
    // Generate unique email for this test run
    testEmail = `e2e-test-${Date.now()}@example.com`;
  });

  test('Complete contact form submission flow - English', async ({ page }) => {
    // Step 1: Navigate to contact page
    await page.goto('https://staging.roaya.co/en/contact');
    await expect(page).toHaveTitle(/Contact.*Roaya/i);

    // Step 2: Fill form fields
    await page.fill('input[name="name"]', 'E2E Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '+201234567890');
    await page.fill('input[name="company"]', 'E2E Test Company');
    await page.selectOption('select[name="service"]', 'cloud');
    await page.fill('textarea[name="message"]', 'This is an E2E test submission for the contact form.');

    // Step 3: Submit form
    await page.click('button[type="submit"]');

    // Step 4: Verify success message displayed
    await expect(page.locator('.success-message, .alert-success')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('.success-message, .alert-success')).toContainText(
      /thank you|received your inquiry/i
    );

    // Step 5: Verify form was cleared (or redirected)
    const nameInput = page.locator('input[name="name"]');
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBe(''); // Form should be cleared

    // Step 6: Verify lead in database (via API call)
    // Wait a moment for database write
    await page.waitForTimeout(1000);

    // Login to admin API to verify lead
    const adminToken = await getAdminToken();

    const apiResponse = await page.request.get(
      `https://api-staging.roaya.co/api/v1/admin/leads?search=${encodeURIComponent(testEmail)}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(apiResponse.ok()).toBeTruthy();
    const leadsData = await apiResponse.json();

    expect(leadsData.success).toBe(true);
    expect(leadsData.data.items).toHaveLength(1);

    const lead = leadsData.data.items[0];
    expect(lead).toMatchObject({
      contact_email: testEmail,
      contact_name: 'E2E Test User',
      company_name: 'E2E Test Company',
      source: expect.objectContaining({ code: 'contact' }),
      status: expect.objectContaining({ code: 'new' }),
    });

    // Step 7: Verify email notifications queued
    const emailsResponse = await page.request.get(
      `https://api-staging.roaya.co/api/v1/admin/leads/${lead.id}/emails`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const emailsData = await emailsResponse.json();
    expect(emailsData.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          notification_type: 'admin_alert',
          status: expect.stringMatching(/pending|sent/),
        }),
        expect.objectContaining({
          notification_type: 'lead_confirmation',
          recipient_email: testEmail,
        }),
      ])
    );
  });

  test('Complete contact form submission flow - Arabic', async ({ page }) => {
    // Step 1: Navigate to Arabic contact page
    await page.goto('https://staging.roaya.co/ar/contact');

    // Verify Arabic page loaded (RTL)
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('ar');

    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');

    // Step 2: Fill form with Arabic data
    await page.fill('input[name="name"]', 'محمد أحمد');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '+201234567890');
    await page.fill('input[name="company"]', 'شركة الاختبار');
    await page.selectOption('select[name="service"]', 'cloud');
    await page.fill(
      'textarea[name="message"]',
      'هذا اختبار للنموذج باللغة العربية'
    );

    // Step 3: Submit form
    await page.click('button[type="submit"]');

    // Step 4: Verify Arabic success message
    await expect(page.locator('.success-message, .alert-success')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('.success-message, .alert-success')).toContainText(
      /شكرا|تم استلام/
    );

    // Step 5: Verify lead in database with Arabic content
    await page.waitForTimeout(1000);

    const adminToken = await getAdminToken();
    const apiResponse = await page.request.get(
      `https://api-staging.roaya.co/api/v1/admin/leads?search=${encodeURIComponent(testEmail)}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const leadsData = await apiResponse.json();
    const lead = leadsData.data.items[0];

    expect(lead).toMatchObject({
      contact_name: 'محمد أحمد',
      company_name: 'شركة الاختبار',
      language: 'ar',
    });

    // Verify Arabic email template used
    const emailsResponse = await page.request.get(
      `https://api-staging.roaya.co/api/v1/admin/leads/${lead.id}/emails`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const emailsData = await emailsResponse.json();
    const customerEmail = emailsData.data.find(
      (e: any) => e.notification_type === 'lead_confirmation'
    );

    expect(customerEmail.template_name).toContain('_ar');
  });

  test('Form validation prevents submission with invalid data', async ({ page }) => {
    // Navigate to contact page
    await page.goto('https://staging.roaya.co/en/contact');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Verify validation errors shown
    await expect(page.locator('.error-message, .invalid-feedback')).toBeVisible();

    // Try invalid email
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('textarea[name="message"]', 'Test message');
    await page.click('button[type="submit"]');

    // Verify email validation error
    await expect(page.locator('input[name="email"] + .error, input[name="email"]:invalid')).toBeVisible();
  });

  test('Form shows loading state during submission', async ({ page }) => {
    // Navigate and fill form
    await page.goto('https://staging.roaya.co/en/contact');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('textarea[name="message"]', 'Test message');

    // Submit and immediately check for loading state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Button should show loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText(/sending|submitting|loading/i, {
      timeout: 500,
    });

    // Wait for completion
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 5000 });

    // Button should be re-enabled
    await expect(submitButton).not.toBeDisabled();
  });

  test('Form handles network errors gracefully', async ({ page, context }) => {
    // Simulate network failure
    await context.route('**/api/v1/leads/contact', (route) => {
      route.abort('failed');
    });

    // Fill and submit form
    await page.goto('https://staging.roaya.co/en/contact');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('textarea[name="message"]', 'Test message');
    await page.click('button[type="submit"]');

    // Verify error message shown to user
    await expect(page.locator('.error-message, .alert-danger')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('.error-message, .alert-danger')).toContainText(
      /error|failed|try again/i
    );

    // Form data should be preserved (not cleared)
    const nameValue = await page.inputValue('input[name="name"]');
    expect(nameValue).toBe('Test User');
  });
});

test.describe('Pricing Quote Form E2E', () => {
  let testEmail: string;

  test.beforeEach(() => {
    testEmail = `pricing-e2e-${Date.now()}@example.com`;
  });

  test('Complete pricing quote submission flow', async ({ page }) => {
    // Navigate to pricing page
    await page.goto('https://staging.roaya.co/en/pricing');

    // Scroll to quote form
    await page.locator('#quote-form').scrollIntoViewIfNeeded();

    // Fill form
    await page.fill('input[name="companyName"]', 'E2E Test Corporation');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '+201234567890');
    await page.selectOption('select[name="industry"]', 'technology');
    await page.selectOption('select[name="employees"]', '51-200');

    // Select multiple services (checkboxes)
    await page.check('input[name="services"][value="cloud"]');
    await page.check('input[name="services"][value="security"]');
    await page.check('input[name="services"][value="email"]');

    await page.fill(
      'textarea[name="requirements"]',
      'Need enterprise cloud migration and security audit'
    );

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 5000 });

    // Verify lead in database
    await page.waitForTimeout(1000);

    const adminToken = await getAdminToken();
    const apiResponse = await page.request.get(
      `https://api-staging.roaya.co/api/v1/admin/leads?search=${encodeURIComponent(testEmail)}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const leadsData = await apiResponse.json();
    const lead = leadsData.data.items[0];

    expect(lead).toMatchObject({
      contact_email: testEmail,
      company_name: 'E2E Test Corporation',
      source: expect.objectContaining({ code: 'pricing_quote' }),
      employee_count: '51-200',
    });

    // Verify services linked
    expect(lead.services).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'cloud' }),
        expect.objectContaining({ code: 'security' }),
        expect.objectContaining({ code: 'email' }),
      ])
    );
  });
});

test.describe('ROI Calculator Form E2E', () => {
  test('Complete ROI calculator submission flow', async ({ page }) => {
    const testEmail = `roi-e2e-${Date.now()}@example.com`;

    // Navigate to ROI calculator
    await page.goto('https://staging.roaya.co/en/roi-calculator');

    // Select calculator type
    await page.click('button[data-calculator="cloud"]');

    // Fill calculator inputs
    await page.fill('input[name="currentSpend"]', '15000');
    await page.fill('input[name="employees"]', '75');
    await page.fill('input[name="serverCount"]', '15');

    // Calculate
    await page.click('button.calculate-btn');

    // Wait for results to appear
    await expect(page.locator('.roi-results')).toBeVisible({ timeout: 3000 });

    // Verify calculated results displayed
    await expect(page.locator('.estimated-savings')).toBeVisible();
    await expect(page.locator('.roi-percentage')).toBeVisible();

    // Scroll to lead capture form
    await page.locator('.lead-capture-form').scrollIntoViewIfNeeded();

    // Fill contact info
    await page.fill('input[name="name"]', 'ROI Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '+201234567890');
    await page.fill('input[name="company"]', 'ROI Test Company');

    // Submit
    await page.click('button.submit-roi-btn');

    // Verify success
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 5000 });

    // Verify lead in database
    await page.waitForTimeout(1000);

    const adminToken = await getAdminToken();
    const apiResponse = await page.request.get(
      `https://api-staging.roaya.co/api/v1/admin/leads?search=${encodeURIComponent(testEmail)}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const leadsData = await apiResponse.json();
    const lead = leadsData.data.items[0];

    expect(lead).toMatchObject({
      contact_email: testEmail,
      source: expect.objectContaining({ code: 'roi_calculator' }),
    });

    // Verify form_data contains calculator inputs and results
    expect(lead.form_data).toMatchObject({
      calculatorType: 'cloud',
      inputs: {
        currentSpend: 15000,
        employees: 75,
        serverCount: 15,
      },
      results: {
        estimatedSavings: expect.any(Number),
        roi: expect.any(Number),
        paybackPeriod: expect.any(Number),
      },
    });

    // Verify lead score calculated
    expect(lead.lead_score).toBeGreaterThan(0);
  });
});

// Helper function to get admin token
async function getAdminToken(): Promise<string> {
  const response = await fetch('https://api-staging.roaya.co/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@roaya.co',
      password: process.env.TEST_ADMIN_PASSWORD || 'TestPassword123!',
    }),
  });

  const data = await response.json();
  return data.data.accessToken;
}
