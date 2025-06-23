import { NextRequest, NextResponse } from 'next/server';

const merchantId = process.env.merchantId!;
const apiKey = process.env.apiKey!;
const apiUrl = process.env.apiUrl!;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = 'USD',
      customerFirstName = 'Ali',
      customerLastName = 'Masood',
      customerEmail = 'test@example.com',
      language = 'en',
    } = body;

    const merchantTransactionId = `TXN-${Date.now()}`;

    const form = new URLSearchParams({
      entityId: merchantId,
      amount: amount || '1.00',
      currency,
      paymentType: 'DB',
      customer: {
        givenName: customerFirstName,
        surname: customerLastName,
        email: customerEmail,
      },
      merchantTransactionId,
      shopperResultUrl: baseUrl,
    } as any);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const data = await response.json();

    if (data?.id) {
      const paymentUrl = `https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${data.id}`;
      return NextResponse.json({ redirectUrl: paymentUrl });
    } else {
      console.error('Areeba response error:', data);
      return NextResponse.json({ error: 'فشل إنشاء الدفع', details: data }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
