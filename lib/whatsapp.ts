const WHATSAPP_API_VERSION = "v20.0";

// WhatsApp Cloud API only allows business-initiated messages (i.e. anything
// you send first, outside a 24-hour customer-reply window) as pre-approved
// TEMPLATES — plain free-text won't send. Create these templates once in
// Meta Business Manager (WhatsApp > Message Templates) before using this:
//
//   rent_reminder      body: "Hi {{1}}, rent of {{2}} for {{3}} is due on {{4}}. Please pay at your earliest."
//   rent_overdue       body: "Hi {{1}}, rent of {{2}} for {{3}} was due on {{4}} and is still pending."
//   electricity_bill   body: "Hi, electricity bill for {{1}}: {{2}} units x rate = {{3}}. Please pay by {{4}}."
//   otp_login          body: "Your Shil Niwas login code is {{1}}. It expires in 5 minutes. Do not share this code."
//
// Template names/wording must match exactly what you register with Meta —
// update TEMPLATES below once your templates are approved (approval usually
// takes a few hours to a day).
export const TEMPLATES = {
  RENT_REMINDER: "rent_reminder",
  RENT_OVERDUE: "rent_overdue",
  ELECTRICITY_BILL: "electricity_bill",
  OTP_LOGIN: "otp_login",
} as const;

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  // Assume Indian numbers when a bare 10-digit number is stored.
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export async function sendWhatsAppTemplate(
  toPhone: string,
  templateName: string,
  bodyParams: string[]
): Promise<{ ok: boolean; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("WhatsApp not configured — skipping send. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN.");
    return { ok: false, error: "WhatsApp not configured" };
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePhone(toPhone),
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: bodyParams.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("WhatsApp send failed:", res.status, errBody);
      return { ok: false, error: errBody };
    }
    return { ok: true };
  } catch (err: any) {
    console.error("WhatsApp send threw:", err);
    return { ok: false, error: err.message };
  }
}
