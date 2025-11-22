import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * IPN (Instant Payment Notification) endpoint
 * This receives server-to-server notifications from JazzCash
 * Unlike the callback URL (which user is redirected to), this is called directly by JazzCash servers
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('JazzCash IPN Received:', {
      timestamp: new Date().toISOString(),
      txnRefNo: data.pp_TxnRefNo,
      responseCode: data.pp_ResponseCode,
      amount: data.pp_Amount,
    });

    // Verify the IPN hash
    const isValid = verifyJazzCashHash(data);

    if (!isValid) {
      console.error('Invalid JazzCash IPN hash', {
        txnRefNo: data.pp_TxnRefNo,
        receivedHash: data.pp_SecureHash,
      });
      
      return NextResponse.json(
        { status: 'FAIL', message: 'Invalid hash' },
        { status: 400 }
      );
    }

    // Extract payment details
    const {
      pp_TxnRefNo: txnRefNo,
      pp_ResponseCode: responseCode,
      pp_ResponseMessage: responseMessage,
      pp_Amount: amount,
      pp_BillReference: billReference,
      pp_TxnDateTime: txnDateTime,
      pp_RetreivalReferenceNo: retrievalRefNo,
    } = data;

    // Process based on response code
    if (responseCode === '000') {
      // Payment successful
      console.log('IPN: Payment Successful', {
        txnRefNo,
        billReference,
        amount: parseInt(amount) / 100, // Convert from paisa to PKR
        retrievalRefNo,
      });

      // TODO: Update your database
      await handleSuccessfulPayment({
        txnRefNo,
        billReference,
        amount: parseInt(amount) / 100,
        responseMessage,
        txnDateTime,
        retrievalRefNo,
        rawData: data,
      });

      return NextResponse.json({
        status: 'SUCCESS',
        message: 'Payment processed successfully',
      });
    } else {
      // Payment failed
      console.log('IPN: Payment Failed', {
        txnRefNo,
        billReference,
        responseCode,
        responseMessage,
      });

      // TODO: Update your database
      await handleFailedPayment({
        txnRefNo,
        billReference,
        responseCode,
        responseMessage,
        txnDateTime,
        rawData: data,
      });

      return NextResponse.json({
        status: 'FAIL',
        message: responseMessage,
      });
    }
  } catch (error) {
    console.error('JazzCash IPN Error:', error);
    
    return NextResponse.json(
      { status: 'ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function verifyJazzCashHash(data: Record<string, string>): boolean {
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT || '';
  const receivedHash = data.pp_SecureHash;

  if (!receivedHash) {
    console.error('No hash received in IPN');
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

  // Generate hash
  const calculatedHash = crypto
    .createHmac('sha256', integritySalt)
    .update(hashString)
    .digest('hex')
    .toUpperCase();

  const isValid = calculatedHash === receivedHash;
  
  if (!isValid) {
    console.error('Hash mismatch', {
      calculated: calculatedHash,
      received: receivedHash,
      hashString: hashString.substring(0, 100) + '...',
      filteredKeys: sortedKeys,
    });
  }

  return isValid;
}

async function handleSuccessfulPayment(paymentData: {
  txnRefNo: string;
  billReference: string;
  amount: number;
  responseMessage: string;
  txnDateTime: string;
  retrievalRefNo: string;
  rawData: Record<string, string>;
}) {
  const { getSupabaseServer } = await import('@/lib/supabase-server');
  const supabase = getSupabaseServer();

  try {
    // Update payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        payment_status: 'completed',
        gateway_transaction_id: paymentData.txnRefNo,
        gateway_response_code: '000',
        gateway_response_message: paymentData.responseMessage,
        gateway_raw_response: paymentData.rawData,
        reference_number: paymentData.retrievalRefNo,
      })
      .eq('gateway_transaction_id', paymentData.txnRefNo)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      return;
    }

    console.log('Payment updated successfully:', paymentData.txnRefNo);

    // If this is a subscription payment, activate the subscription
    if (payment && payment.subscription_id) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          payment_status: 'paid',
        })
        .eq('id', payment.subscription_id);

      if (subError) {
        console.error('Error activating subscription:', subError);
      } else {
        console.log('Subscription activated:', payment.subscription_id);
      }
    }
  } catch (error) {
    console.error('Error in handleSuccessfulPayment:', error);
  }
}

async function handleFailedPayment(paymentData: {
  txnRefNo: string;
  billReference: string;
  responseCode: string;
  responseMessage: string;
  txnDateTime: string;
  rawData: Record<string, string>;
}) {
  const { getSupabaseServer } = await import('@/lib/supabase-server');
  const supabase = getSupabaseServer();

  try {
    // Update payment record
    const { error } = await supabase
      .from('payments')
      .update({
        payment_status: 'failed',
        gateway_transaction_id: paymentData.txnRefNo,
        gateway_response_code: paymentData.responseCode,
        gateway_response_message: paymentData.responseMessage,
        gateway_raw_response: paymentData.rawData,
      })
      .eq('reference_number', paymentData.billReference);

    if (error) {
      console.error('Error updating payment:', error);
    } else {
      console.log('Payment marked as failed:', paymentData.txnRefNo);
    }
  } catch (error) {
    console.error('Error in handleFailedPayment:', error);
  }
}

function parseJazzCashDateTime(dateTimeStr: string): Date {
  // Format: YYYYMMDDHHMMSS
  const year = parseInt(dateTimeStr.substring(0, 4));
  const month = parseInt(dateTimeStr.substring(4, 6)) - 1;
  const day = parseInt(dateTimeStr.substring(6, 8));
  const hours = parseInt(dateTimeStr.substring(8, 10));
  const minutes = parseInt(dateTimeStr.substring(10, 12));
  const seconds = parseInt(dateTimeStr.substring(12, 14));
  
  return new Date(year, month, day, hours, minutes, seconds);
}
