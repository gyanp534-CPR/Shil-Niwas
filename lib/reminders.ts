import { db } from "./db";
import { sendWhatsAppTemplate, TEMPLATES } from "./whatsapp";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatRupees(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export async function sendRentReminder(paymentId: string, kind: "upcoming" | "overdue" = "upcoming") {
  const payment = await db.rentPayment.findUnique({
    where: { id: paymentId },
    include: { tenant: { include: { unit: true } } },
  });
  if (!payment) return { ok: false, error: "Payment not found" };

  const template = kind === "overdue" ? TEMPLATES.RENT_OVERDUE : TEMPLATES.RENT_REMINDER;
  const result = await sendWhatsAppTemplate(payment.tenant.phone, template, [
    payment.tenant.name,
    formatRupees(payment.amount),
    payment.tenant.unit.label,
    formatDate(payment.dueDate),
  ]);

  if (result.ok) {
    await db.rentPayment.update({
      where: { id: paymentId },
      data: { lastReminderSentAt: new Date() },
    });
  }
  return result;
}

export async function sendElectricityBillNotice(cycleId: string) {
  const cycle = await db.electricityCycle.findUnique({
    where: { id: cycleId },
    include: { unit: { include: { tenants: true } } },
  });
  if (!cycle) return { ok: false, error: "Cycle not found" };

  // Owner's own flat has no tenant to notify — just skip silently.
  const tenant = cycle.unit.tenants[0];
  if (!tenant) return { ok: true, skipped: true };

  const result = await sendWhatsAppTemplate(tenant.phone, TEMPLATES.ELECTRICITY_BILL, [
    cycle.unit.label,
    `${cycle.unitsConsumed} units x ₹${cycle.ratePerUnit}`,
    formatRupees(cycle.totalAmount),
    formatDate(new Date(cycle.cycleDate)),
  ]);

  if (result.ok) {
    await db.electricityCycle.update({
      where: { id: cycleId },
      data: { sentToTenant: true },
    });
  }
  return result;
}
