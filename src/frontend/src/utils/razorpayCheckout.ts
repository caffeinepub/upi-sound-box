export interface RazorpayOptions {
  amount: number; // in paise
  currency?: string;
  name: string;
  description: string;
  prefill?: { contact?: string; email?: string };
  theme?: { color?: string };
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onFailure: (error: unknown) => void;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: object) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(script);
  });
}

export async function openRazorpayCheckout(
  keyId: string,
  options: RazorpayOptions,
): Promise<void> {
  await loadRazorpayScript();
  const rzp = new window.Razorpay({
    key: keyId,
    amount: options.amount,
    currency: options.currency ?? "INR",
    name: options.name,
    description: options.description,
    prefill: options.prefill ?? {},
    theme: options.theme ?? { color: "#7c3aed" },
    handler: options.onSuccess,
    modal: {
      ondismiss: () => options.onFailure(new Error("Payment cancelled")),
    },
  });
  rzp.open();
}
