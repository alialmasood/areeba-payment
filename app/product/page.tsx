'use client';
import { useState } from 'react';

export default function ProductPage() {
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    setLoading(true);

    const payload = {
      merchantTransactionId: 'TXN-' + Date.now(), // معرف فريد للمعاملة
      amount: '1.00',
      currency: 'USD',
      customerFirstName: 'Ali',
      customerLastName: 'Unido',
      customerEmail: 'test@example.com',
      customerIpAddress: '127.0.0.1',
      language: 'AR',
    };

    try {
      const res = await fetch('/api/areeba/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        console.log('Received response (no redirect expected in test):', data);
        alert('تم إرسال البيانات بنجاح (هذا رد تجريبي فقط)');
      }
      

    setLoading(false);
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold mb-4">📘 كتاب إلكتروني</h1>
      <p className="text-lg mb-4">السعر: 1.00 دولار</p>
      <button
        onClick={handleBuyNow}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'جاري المعالجة...' : 'شراء الآن'}
      </button>
    </div>
  );
}
