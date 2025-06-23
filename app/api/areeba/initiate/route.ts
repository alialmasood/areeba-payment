import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ثابتات بيئة الاختبار
const merchantId = 'IQ3093980103';
const apiKey = 'TESTKEYIQ3093980103';
const apiUrl = 'https://gateway-test.apsrtareeba.com/api/payment/initiate'; // بيئة الاختبار

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

    // توليد معرف معاملة فريد
    const merchantTransactionId = `TXN-${Date.now()}`;

    // توليد توقيع HMAC
    const payloadToHash = `${merchantId}${merchantTransactionId}${amount}${currency}`;
    const hmac = crypto
      .createHmac('sha256', apiKey)
      .update(payloadToHash)
      .digest('hex');

    // بناء بيانات الطلب
    const payload = {
      merchantId,
      merchantTransactionId,
      amount,
      currency,
      returnUrl: 'http://localhost:3000/product', // عدّل لاحقًا حسب موقعك
      cancelUrl: 'http://localhost:3000/product',
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone: '0000000000', // يمكنك تخصيصه لاحقًا
      customerIp: customerIpAddress,
      language,
      signature: hmac,
    };
    console.log('Payload being sent to Areeba:', payload);
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data?.paymentUrl) {
      return NextResponse.json({ redirectUrl: data.paymentUrl });
    } else {
      console.error('Areeba API Response Error:', data);
      return NextResponse.json(
        { error: 'فشل في توليد رابط الدفع', details: data },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم أثناء بدء عملية الدفع' },
      { status: 500 }
    );
  }
}
