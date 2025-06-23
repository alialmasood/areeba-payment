"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkoutId");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
    script.async = true;
    document.getElementById("payment-form-container")?.appendChild(script);
  }, [checkoutId]);

  if (!checkoutId) {
    return <div className="text-center text-red-500 mt-10">لا يوجد Checkout ID</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-center text-2xl font-bold mb-6">بوابة الدفع الآمنة</h1>
      <div id="payment-form-container">
        <form
          action="/result"
          className="paymentWidgets"
          data-brands="VISA MASTER"
        ></form>
      </div>
    </div>
  );
}
