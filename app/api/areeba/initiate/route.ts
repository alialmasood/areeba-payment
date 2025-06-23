import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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

    const merchantId = process.env.merchantId!;
    const apiKey = process.env.apiKey!;
    const apiUrl = process.env.apiUrl!;

    // إنشاء معرف فريد للمعاملة
    const merchantTransactionId = `TXN-${Date.now()}`;

    // توقيع HMAC
    const payloadToHash = `${merchantId}${merchantTransactionId}${amount}${currency}`;
    const hmac = crypto
      .createHmac('sha256', apiKey)
      .update(payloadToHash)
      .digest('hex');

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
      customerIp: customerIpAddress,
      language,
      signature: hmac,
    };

    console.log('🔄 Sending payload to Areeba:', payload);

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data?.paymentUrl) {
      return NextResponse.json({ redirectUrl: data.paymentUrl });
    } else {
      console.error('❌ Areeba API error:', data);
      return NextResponse.json({ error: 'فشل في إنشاء رابط الدفع', details: data }, { status: 500 });
    }
  } catch (error) {
    console.error('🔥 Unexpected server error:', error);
    return NextResponse.json({ error: 'خطأ غير متوقع في الخادم' }, { status: 500 });
  }
}
