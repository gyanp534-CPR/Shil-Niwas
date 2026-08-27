// UPI intent URL spec (used by every UPI app — GPay, PhonePe, Paytm, etc.):
//   upi://pay?pa=<payee VPA>&pn=<payee name>&am=<amount>&cu=INR&tn=<note>
// Scanning this opens the user's UPI app with the amount pre-filled — they
// still confirm/pay manually, but can't accidentally under/overpay by
// mis-typing the amount.
export function buildUpiIntentUrl(amount: number, note: string): string {
  const upiId = process.env.UPI_ID;
  if (!upiId) {
    throw new Error("UPI_ID is not set — add it to .env to generate payment QR codes.");
  }
  const payeeName = process.env.UPI_PAYEE_NAME || "Shil Niwas";

  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note,
  });

  return `upi://pay?${params.toString()}`;
}
