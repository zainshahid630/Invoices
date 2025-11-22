import { NextRequest, NextResponse } from 'next/server';
import { createPaymentForm } from '@/lib/jazzcash';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, billReference, description, customerEmail, customerMobile } = body;

    // Validate required fields
    if (!amount || !billReference || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment form data
    const paymentData = createPaymentForm({
      amount: amountNum,
      billReference,
      description,
      customerEmail,
      customerMobile,
    });

    console.log('Payment initiated:', {
      txnRefNo: paymentData.txnRefNo,
      amount: amountNum,
      billReference,
    });

    // Return payment URL and form data to client
    return NextResponse.json({
      success: true,
      paymentUrl: paymentData.url,
      formData: paymentData.formData,
      txnRefNo: paymentData.txnRefNo,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
