import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const merchantId = process.env.merchantId!;
const apiKey = process.env.apiKey!;
const apiUrl = process.env.apiUrl!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      amount,
      currency,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerIpAddress,
      language,
    } = body;

    if (!amount || !currency || !customerFirstName || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const merchantTransactionId = `TXN-${Date.now()}`;
    const payloadToHash = `${merchantId}${merchantTransactionId}${amount}${currency}`;
    const hmac = crypto.createHmac('sha256', apiKey).update(payloadToHash).digest('hex');

    const payload = {
      merchantId,
      merchantTransactionId,
      amount,
      currency,
      returnUrl: 'https://areeba-payment-iyjp.vercel.app/product',
      cancelUrl: 'https://areeba-payment-iyjp.vercel.app/product',
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone: '0000000000',
      customerIp: customerIpAddress || '127.0.0.1',
      language: language || 'en',
      signature: hmac,
    };

    console.log('Request Payload:', payload);

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data?.paymentUrl) {
      return NextResponse.json({ redirectUrl: data.paymentUrl });
    } else {
      console.error('Areeba Error Response:', data);
      return NextResponse.json({ error: 'فشل في توليد رابط الدفع', details: data }, { status: 500 });
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء بدء عملية الدفع' }, { status: 500 });
  }
}
