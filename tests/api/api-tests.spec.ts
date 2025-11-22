import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test('should fetch invoices via API', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/invoices`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should create invoice via API', async ({ request }) => {
    const invoiceData = {
      invoiceType: 'Sales Tax Invoice',
      scenario: 'Standard',
      buyerId: 1,
      items: [{ productId: 1, quantity: 5 }],
    };

    const response = await request.post(`${baseURL}/api/invoices`, {
      data: invoiceData,
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should fetch products via API', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/products`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/invalid-endpoint`);
    expect(response.status()).toBe(404);
  });
});
