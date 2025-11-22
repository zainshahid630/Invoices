import crypto from 'crypto';

export interface JazzCashConfig {
  merchantId: string;
  password: string;
  integritySalt: string;
  returnUrl: string;
  environment: 'sandbox' | 'production';
}

export interface PaymentRequest {
  amount: number;
  billReference: string;
  description: string;
  customerEmail?: string;
  customerMobile?: string;
  customerCardNumber?: string;
  customerCardCVV?: string;
  customerCardExpiry?: string;
  customerId?: string;
  isRegisteredCustomer?: 'yes' | 'no';
  shouldTokenizeCard?: 'yes' | 'no';
}

export function getJazzCashConfig(): JazzCashConfig {
  return {
    merchantId: process.env.JAZZCASH_MERCHANT_ID || '',
    password: process.env.JAZZCASH_PASSWORD || '',
    integritySalt: process.env.JAZZCASH_INTEGRITY_SALT || '',
    returnUrl: process.env.JAZZCASH_RETURN_URL || '',
    environment: (process.env.JAZZCASH_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  };
}

export function getJazzCashUrl(environment: 'sandbox' | 'production'): string {
  return environment === 'production'
    ? 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/'
    : 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';
}

export function generateTxnRefNo(): string {
  // Format: T + timestamp + random
  return 'T' + Date.now() + Math.floor(Math.random() * 1000);
}

export function generateSecureHash(data: Record<string, string>, integritySalt: string): string {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(data).sort();
  
  // Create hash string: integritySalt&value1&value2&...
  const hashString = integritySalt + '&' + sortedKeys.map(key => data[key]).join('&');
  
  // Generate HMAC SHA256 hash
  const hash = crypto
    .createHmac('sha256', integritySalt)
    .update(hashString)
    .digest('hex')
    .toUpperCase();
  
  return hash;
}

export function createPaymentForm(paymentRequest: PaymentRequest) {
  const config = getJazzCashConfig();
  const txnRefNo = generateTxnRefNo();
  
  // Current date and time in required format
  const now = new Date();
  const txnDateTime = formatDateTime(now);
  
  // Expiry date time (3 months from now - max allowed)
  const expiryDateTime = formatDateTime(new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000));
  
  // Amount in paisa (multiply by 100)
  const amountInPaisa = Math.round(paymentRequest.amount * 100).toString();
  
  // Determine transaction type based on whether card details are provided
  const txnType = paymentRequest.customerCardNumber ? 'MPAY' : 'MWALLET';
  
  // Prepare data for hash (order matters - alphabetically sorted)
  const hashData: Record<string, string> = {
    pp_Amount: amountInPaisa,
    pp_BillReference: paymentRequest.billReference,
    pp_Description: paymentRequest.description,
    pp_Language: 'EN',
    pp_MerchantID: config.merchantId,
    pp_Password: config.password,
    pp_ReturnURL: config.returnUrl,
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: txnDateTime,
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_TxnRefNo: txnRefNo,
    pp_TxnType: txnType,
    pp_Version: '1.1', // Use 1.1 for MWALLET, 2.0 for MPAY
  };
  
  // Add fields based on transaction type
  if (txnType === 'MWALLET') {
    // For MWALLET (Mobile Account), use ppmpf fields as per JazzCash documentation
    // ppmpf_1 = Mobile number
    // ppmpf_2 = Email (optional)
    if (paymentRequest.customerMobile) {
      hashData.ppmpf_1 = paymentRequest.customerMobile;
    }
    if (paymentRequest.customerEmail) {
      hashData.ppmpf_2 = paymentRequest.customerEmail;
    }
    
    // Optional fields for MWALLET
    hashData.pp_BankID = '';
    hashData.pp_ProductID = '';
    hashData.pp_SubMerchantID = '';
    
  } else if (txnType === 'MPAY' && paymentRequest.customerCardNumber) {
    // For MPAY (Direct Pay with card), use pp_Customer fields
    hashData.pp_Version = '2.0'; // MPAY uses version 2.0
    hashData.pp_CustomerCardNumber = paymentRequest.customerCardNumber;
    hashData.pp_CustomerCardCVV = paymentRequest.customerCardCVV || '';
    hashData.pp_CustomerCardExpiry = paymentRequest.customerCardExpiry || '';
    hashData.pp_IsRegisteredCustomer = paymentRequest.isRegisteredCustomer || 'no';
    hashData.pp_ShouldTokenizeCardNumber = paymentRequest.shouldTokenizeCard || 'no';
    
    if (paymentRequest.customerEmail) {
      hashData.pp_CustomerEmail = paymentRequest.customerEmail;
    }
    if (paymentRequest.customerMobile) {
      hashData.pp_CustomerMobile = paymentRequest.customerMobile;
    }
    if (paymentRequest.customerId) {
      hashData.pp_CustomerID = paymentRequest.customerId;
    }
    
    // UsageMode for API integration
    hashData.pp_UsageMode = 'API';
  }
  
  // Generate secure hash
  const secureHash = generateSecureHash(hashData, config.integritySalt);
  
  // Add hash to form data
  const formData = {
    ...hashData,
    pp_SecureHash: secureHash,
  };
  
  return {
    url: getJazzCashUrl(config.environment),
    formData,
    txnRefNo,
  };
}

function formatDateTime(date: Date): string {
  // Format: YYYYMMDDHHMMSS
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
  }).format(amount);
}
