"use client";

import { useState } from "react";

export default function ProductPage() {
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/areeba/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: "1.00",
          currency: "USD",
          customerFirstName: "Ali",
          customerLastName: "Masood",
          customerEmail: "ali@example.com",
          customerIpAddress: "192.168.1.1", // أو اجعلها ثابتة مؤقتًا
          language: "ar",
        }),
      });

      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = `/payment?checkoutId=${data.redirectUrl.split('checkoutId=')[1]}`;
      } else {
        alert("فشل إنشاء رابط الدفع");
        console.error("Areeba API Error:", data);
      }
    } catch (error) {
      console.error("Areeba Error:", error);
      alert("حدث خطأ أثناء عملية الدفع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">كتاب إلكتروني</h1>
      <p className="mb-4">السعر: 1.00 دولار</p>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded"
        onClick={handleBuyNow}
        disabled={loading}
      >
        {loading ? "جاري المعالجة..." : "شراء الآن"}
      </button>
    </div>
  );
}
