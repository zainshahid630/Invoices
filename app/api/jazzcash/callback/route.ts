import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('JazzCash Callback Data:', data);

    // Get base URL from environment or request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.JAZZCASH_RETURN_URL ? process.env.JAZZCASH_RETURN_URL.replace('/api/jazzcash/callback', '') : null) ||
                    new URL(request.url).origin ||
                    'https://invoicefbr.com';

    // Verify the response hash
    const isValid = verifyJazzCashResponse(data);

    if (!isValid) {
      console.error('Invalid JazzCash response hash');
      return NextResponse.redirect(
        new URL('/payment/failed?reason=invalid_hash', baseUrl)
      );
    }

    // Check payment status
    const responseCode = data.pp_ResponseCode;
    const responseMessage = data.pp_ResponseMessage;
    const txnRefNo = data.pp_TxnRefNo;
    const amount = data.pp_Amount;

    if (responseCode === '000') {
      // Payment successful
      console.log('Payment successful:', {
        txnRefNo,
        amount,
        responseMessage
      });

      // Check if this is a subscription payment (starts with 'S' and is short format)
      if (txnRefNo.startsWith('S') && txnRefNo.length <= 20) {
        // Redirect to subscription page with success data
        const params = new URLSearchParams({
          status: 'success',
          txn: txnRefNo,
          amount: amount,
          message: responseMessage,
          code: responseCode,
          rrn: data.pp_RetreivalReferenceNo || '',
          response: JSON.stringify(data),
        });
        return NextResponse.redirect(
          new URL(`/seller/subscription?${params.toString()}`, baseUrl)
        );
      }

      return NextResponse.redirect(
        new URL(`/payment/success?txn=${txnRefNo}&amount=${amount}`, baseUrl)
      );
    } else {
      // Payment failed
      console.log('Payment failed:', {
        txnRefNo,
        responseCode,
        responseMessage
      });

      // Check if this is a subscription payment (starts with 'S' and is short format)
      if (txnRefNo.startsWith('S') && txnRefNo.length <= 20) {
        // Redirect to subscription page with failure data
        const params = new URLSearchParams({
          status: 'failed',
          txn: txnRefNo,
          message: responseMessage,
          code: responseCode,
          response: JSON.stringify(data),
        });
        return NextResponse.redirect(
          new URL(`/seller/subscription?${params.toString()}`, baseUrl)
        );
      }

      return NextResponse.redirect(
        new URL(`/payment/failed?reason=${responseMessage}`, baseUrl)
      );
    }
  } catch (error) {
    console.error('JazzCash callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    new URL(request.url).origin ||
                    'https://invoicefbr.com';
    return NextResponse.redirect(
      new URL('/payment/failed?reason=server_error', baseUrl)
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests (some gateways send GET)
  const searchParams = request.nextUrl.searchParams;
  const data: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    data[key] = value;
  });

  console.log('JazzCash GET Callback Data:', data);

  // Get base URL from environment
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  (process.env.JAZZCASH_RETURN_URL ? process.env.JAZZCASH_RETURN_URL.replace('/api/jazzcash/callback', '') : null) ||
                  new URL(request.url).origin ||
                  'https://invoicefbr.com';

  const responseCode = data.pp_ResponseCode;
  const txnRefNo = data.pp_TxnRefNo;
  const amount = data.pp_Amount;

  // Check if this is a subscription payment (starts with 'S' and is short format)
  if (txnRefNo && txnRefNo.startsWith('S') && txnRefNo.length <= 20) {
    const params = new URLSearchParams({
      status: responseCode === '000' ? 'success' : 'failed',
      txn: txnRefNo,
      amount: amount || '',
      message: data.pp_ResponseMessage || '',
      code: responseCode || '',
      response: JSON.stringify(data),
    });
    return NextResponse.redirect(
      new URL(`/seller/subscription?${params.toString()}`, baseUrl)
    );
  }

  if (responseCode === '000') {
    return NextResponse.redirect(
      new URL(`/payment/success?txn=${txnRefNo}&amount=${amount}`, baseUrl)
    );
  } else {
    return NextResponse.redirect(
      new URL(`/payment/failed?reason=${data.pp_ResponseMessage}`, baseUrl)
    );
  }
}

function verifyJazzCashResponse(data: Record<string, string>): boolean {
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT || '';
  const receivedHash = data.pp_SecureHash;

  if (!receivedHash) {
    console.error('No hash received in callback');
    return false;
  }

  // Remove the hash from data before verification
  const { pp_SecureHash, ...dataWithoutHash } = data;

  // Filter out empty values and sort keys alphabetically
  const filteredData: Record<string, string> = {};
  Object.keys(dataWithoutHash).forEach(key => {
    const value = dataWithoutHash[key];
    // Only include non-empty values in hash calculation
    if (value !== null && value !== undefined && value !== '') {
      filteredData[key] = value;
    }
  });

  // Sort keys alphabetically and create hash string
  const sortedKeys = Object.keys(filteredData).sort();
  const hashString = integritySalt + '&' + sortedKeys.map(key => filteredData[key]).join('&');

  // Generate hash using HMAC SHA256
  const calculatedHash = crypto
    .createHmac('sha256', integritySalt)
    .update(hashString)
    .digest('hex')
    .toUpperCase();

  const isValid = calculatedHash === receivedHash;
  
  if (!isValid) {
    console.error('Hash verification failed', {
      calculated: calculatedHash,
      received: receivedHash,
      hashString: hashString.substring(0, 100) + '...',
      filteredKeys: sortedKeys,
    });
  }

  return isValid;
}
