import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// تحميل المتغيرات من البيئة
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
      customerFirstName = "Ali",
      customerLastName = "Masood",
      customerEmail = "ali@example.com",
      customerIpAddress = "127.0.0.1",
      language = "ar",
    } = body;

    if (!amount || !currency || !customerFirstName || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // توليد رقم معاملة فريد
    const merchantTransactionId = `TXN-${Date.now()}`;

    // إنشاء التوقيع باستخدام HMAC SHA256
    const stringToSign = `${merchantId}${merchantTransactionId}${amount}${currency}`;
    const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');

    // تجهيز بيانات الطلب
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
      signature,
    };

    console.log('🔵 Request Payload:\n', payload);

    // إنشاء Basic Auth
    const base64Credentials = Buffer.from(`${apiUser}:${apiPass}`).toString('base64');

    // إرسال الطلب إلى Areeba
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Credentials}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('🟢 Areeba Response:\n', data);

    if (data?.paymentUrl) {
      return NextResponse.json({ redirectUrl: data.paymentUrl });
    } else {
      return NextResponse.json({ error: 'فشل في توليد رابط الدفع', details: data }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء بدء عملية الدفع' }, { status: 500 });
  }
}
