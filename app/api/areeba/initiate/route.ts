import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const merchantId = process.env.merchantId!;
const apiKey = process.env.apiKey!;
const apiUrl = process.env.apiUrl!;
const apiUser = process.env.apiUser!;
const apiPass = process.env.apiPass!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      amount,
      currency = 'USD',
      customerFirstName = 'Ali',
      customerLastName = 'Masood',
      customerEmail = 'ali@example.com',
      customerIpAddress = '127.0.0.1',
      language = 'ar',
    } = body;

    const merchantTransactionId = `TXN-${Date.now()}`;
    const payloadToHash = `${merchantId}${merchantTransactionId}${amount}${currency}`;
    const hmac = crypto.createHmac('sha256', apiKey).update(payloadToHash).digest('hex');

    const payload = {
      merchantId,
      merchantTransactionId,
      amount,
      currency,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/product`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/product`,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone: '0000000000',
      customerIp: customerIpAddress,
      language,
      signature: hmac,
    };

    // توليد Basic Auth
    const credentials = Buffer.from(`${apiUser}:${apiPass}`).toString('base64');
    const authHeader = `Basic ${credentials}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
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
