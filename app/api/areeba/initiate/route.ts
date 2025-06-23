import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const merchantId = process.env.merchantId!;
const apiKey = process.env.apiKey!;
const apiSecret = process.env.apiSecret!;         // shared secret للتوقيع
const apiUrl = process.env.apiUrl!;

// username و password إذا مطلوبة Basic Auth (حسب دعم الدعم)
const apiUser = process.env.apiUser!;
const apiPass = process.env.apiPass!;

export async function POST(req: NextRequest) {
  try {
    const {
      amount,
      currency = 'USD',
      customerFirstName,
      customerLastName,
      customerEmail,
    } = await req.json();

    if (!amount || !customerFirstName || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const merchantTransactionId = `TXN-${Date.now()}`;
    const payload = {
      merchantId,
      merchantTransactionId,
      amount: amount, // تأكد إن كان "1.00" أو "100"، حسب متطلبات API
      currency,
      returnUrl: process.env.NEXT_PUBLIC_BASE_URL + '/product',
      cancelUrl: process.env.NEXT_PUBLIC_BASE_URL + '/product',
      customerFirstName,
      customerLastName,
      customerEmail,
      // phone و ip افتراضية، يمكن تعديلها عند الطلب
      customerPhone: '0000000000',
      customerIp: req.headers.get('x-forwarded-for') || '0.0.0.0',
      language: 'en',
    };

    // SHA256 HMAC - هذا أكثر شيوعًا في Areeba
    const hmac = crypto
      .createHmac('sha256', apiSecret)
      .update(`${merchantId}${merchantTransactionId}${amount}${currency}`)
      .digest('hex');
    payload['signature'] = hmac;

    console.log('🔵 Request Payload:', payload);

    // Basic Auth Header:
    const basic = Buffer.from(`${apiUser}:${apiPass}`).toString('base64');

    // إرسال الطلب النهائي
    const res = await fetch(apiUrl, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basic}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log('🔴 Response Data:', data);

    if (!res.ok || !data.paymentUrl) {
      console.error('🚫 Areeba Error Response:', data);
      return NextResponse.json({ error: 'فشل في توليد رابط الدفع', details: data }, { status: 500 });
    }

    return NextResponse.json({ redirectUrl: data.paymentUrl});
  } catch (err) {
    console.error('⚠️ Server error:', err);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء بدء عملية الدفع' }, { status: 500 });
  }
}
