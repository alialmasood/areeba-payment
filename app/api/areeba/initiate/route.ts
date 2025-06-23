import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ✅ قراءة المتغيرات من .env
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
      currency,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerIpAddress,
      language,
    } = body;

    // ✅ تحقق من البيانات الأساسية
    if (!amount || !currency || !customerFirstName || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const merchantTransactionId = `TXN-${Date.now()}`;
    const payloadToHash = `${merchantId}${merchantTransactionId}${amount}${currency}`;
    const hmac = crypto.createHmac('sha256', apiKey).update(payloadToHash).digest('hex');

    // ✅ تجهيز Payload
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
      customerIp: customerIpAddress || '127.0.0.1',
      language: language || 'en',
      signature: hmac,
    };

    // ✅ تحويل اسم المستخدم وكلمة المرور إلى base64
    const credentials = Buffer.from(`${apiUser}:${apiPass}`).toString('base64');

    // ✅ إرسال الطلب إلى Areeba
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data?.paymentUrl) {
      return NextResponse.json({ redirectUrl: data.paymentUrl });
    } else {
      console.error('Areeba API Response Error:', data);
      return NextResponse.json({ error: 'فشل في توليد رابط الدفع', details: data }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم أثناء بدء الدفع' }, { status: 500 });
  }
}
