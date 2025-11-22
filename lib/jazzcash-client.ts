/**
 * JazzCash Client-Side Utilities
 * 
 * Helper functions for initiating JazzCash payments from the browser
 */

export interface PaymentInitiateRequest {
  amount: number;
  billReference: string;
  description: string;
  customerEmail?: string;
  customerMobile?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  paymentUrl?: string;
  formData?: Record<string, string>;
  txnRefNo?: string;
  error?: string;
}

/**
 * Initiates a JazzCash payment
 * @param paymentData Payment details
 * @returns Payment initiation response
 */
export async function initiateJazzCashPayment(
  paymentData: PaymentInitiateRequest
): Promise<PaymentInitiateResponse> {
  const response = await fetch('/api/jazzcash/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  return await response.json();
}

/**
 * Opens JazzCash payment in a new tab
 * @param paymentUrl JazzCash payment gateway URL
 * @param formData Form data to submit
 * @returns true if successful, false if pop-up blocked
 */
export function openPaymentInNewTab(
  paymentUrl: string,
  formData: Record<string, string>
): boolean {
  const newWindow = window.open('', '_blank');

  if (!newWindow) {
    return false;
  }

  // Create form in new window
  const form = newWindow.document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;

  // Add form fields
  Object.entries(formData).forEach(([key, value]) => {
    const input = newWindow.document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  // Add loading UI
  newWindow.document.body.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecting to JazzCash...</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          text-align: center;
          background: white;
          padding: 48px 40px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 400px;
        }
        .icon {
          font-size: 64px;
          margin-bottom: 24px;
          animation: pulse 2s ease-in-out infinite;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        p {
          color: #6b7280;
          font-size: 16px;
          margin-bottom: 24px;
        }
        .spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 20px;
          padding: 8px 16px;
          background: #f3f4f6;
          border-radius: 20px;
          font-size: 12px;
          color: #6b7280;
        }
        .secure-icon {
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">💳</div>
        <h1>Redirecting to JazzCash</h1>
        <p>Please wait while we securely redirect you to the payment gateway...</p>
        <div class="spinner"></div>
        <div class="secure-badge">
          <span class="secure-icon">🔒</span>
          <span>Secure Payment</span>
        </div>
      </div>
    </body>
    </html>
  `;

  // Append form and submit
  newWindow.document.body.appendChild(form);
  form.submit();

  return true;
}

/**
 * Opens JazzCash payment in the same page (redirects)
 * @param paymentUrl JazzCash payment gateway URL
 * @param formData Form data to submit
 */
export function openPaymentInSamePage(
  paymentUrl: string,
  formData: Record<string, string>
): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;

  Object.entries(formData).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

/**
 * Complete payment flow: initiate and open in new tab
 * @param paymentData Payment details
 * @param onError Error callback
 * @param openInSamePage If true, redirects in same page instead of new tab (useful for testing)
 * @returns Promise that resolves when payment window is opened
 */
export async function processJazzCashPayment(
  paymentData: PaymentInitiateRequest,
  onError?: (error: string) => void,
  openInSamePage: boolean = false
): Promise<void> {
  try {
    // Initiate payment
    const response = await initiateJazzCashPayment(paymentData);

    if (!response.success || !response.paymentUrl || !response.formData) {
      const error = response.error || 'Failed to initiate payment';
      onError?.(error);
      return;
    }

    // Open payment page
    if (openInSamePage) {
      openPaymentInSamePage(response.paymentUrl, response.formData);
    } else {
      const opened = openPaymentInNewTab(response.paymentUrl, response.formData);
      if (!opened) {
        onError?.('Please allow pop-ups to complete the payment');
      }
    }
  } catch (error) {
    console.error('Payment error:', error);
    onError?.('An error occurred while processing payment');
  }
}
