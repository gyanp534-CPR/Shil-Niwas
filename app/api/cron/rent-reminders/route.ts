import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendRentReminder } from "@/lib/reminders";

// Triggered daily by Vercel Cron (see vercel.json). Protect it with
// CRON_SECRET so it can't be hit by anyone who finds the URL — Vercel Cron
// sends this automatically as a Bearer token when CRON_SECRET is set in
// your project's env vars; for manual testing, curl with the same header.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeDaysOut = new Date(today);
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);

  const startOfToday = new Date(today);
  const startOfTomorrow = new Date(today);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  // Unpaid payments due within the next 3 days, due today, or already
  // overdue — and not already reminded today, so a slow/retried cron run
  // never double-sends.
  const candidates = await db.rentPayment.findMany({
    where: {
      isPaid: false,
      dueDate: { lte: threeDaysOut },
    },
    include: { tenant: true },
  });

  const results: { tenant: string; kind: string; ok: boolean }[] = [];

  for (const payment of candidates) {
    const alreadyRemindedToday =
      payment.lastReminderSentAt && payment.lastReminderSentAt >= startOfToday && payment.lastReminderSentAt < startOfTomorrow;
    if (alreadyRemindedToday) continue;

    const kind = payment.dueDate < today ? "overdue" : "upcoming";
    const result = await sendRentReminder(payment.id, kind);
    results.push({ tenant: payment.tenant.name, kind, ok: result.ok });
  }

  return NextResponse.json({ sent: results.length, results });
}
