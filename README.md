# Shil Niwas

Rental property management platform for an 8-unit building:
Ground floor — Sabji Dukan, General Store, Beauty Parlour, 1× 2BHK, 1× 1BHK
1st floor — Owner residence
2nd floor — 3× 2BHK

## Stack
- Next.js 14 (App Router) — frontend + API routes, becomes the PWA
- PostgreSQL via Prisma ORM (works great with Supabase free tier)
- WhatsApp Cloud API (Meta) — rent/electricity reminders
- Phone OTP auth (custom, or Supabase Auth)

## Phase 1 (this scaffold) — what's included
- Prisma schema: Unit, Tenant, Agreement, ElectricityCycle, RentPayment, MaintenanceTicket, Document
- Owner dashboard shell with the 3-floor map (ground/1st/2nd)
- Unit list + unit detail page skeleton
- API route stubs for units and electricity readings
- No parking clause anywhere (intentionally excluded)

## Setup (run this locally — this sandbox has no internet access, so packages
aren't installed here; the files are ready to drop into a real project)

```bash
npm install
cp .env.example .env       # fill in DATABASE_URL, WHATSAPP_TOKEN, etc.
npx prisma migrate dev --name init
npm run dev
```

## Seeding the 9 units (8 rented + your own flat)
After `prisma migrate dev`, run the seed script (add one — not included yet)
to insert the 9 units from `prisma/schema.prisma`'s `UnitType`/`Floor` enums,
matching the layout above.

## Built so far
- Owner dashboard with the 3-floor map (`/`)
- Unit list + unit detail (`/units`, `/units/[id]`) showing tenant, agreement,
  move-in photos, and electricity history
- Allocate-tenant flow (`/units/[id]/new-tenant`): tenant form + agreement
  form + mandatory room-condition photo upload, all in one submit. On save,
  the unit auto-flips to OCCUPIED.
- Electricity module: log reading + rate per cycle, auto-calculates
  consumption and amount, blocks a lower-than-previous reading (meter
  reset case) instead of silently saving bad data
- Public no-login vacancy page (`/vacancy`) — the future QR code target,
  only unit status is queried, never tenant/financial data
- Local file upload endpoint for photos (`/api/upload`) — see the note in
  that file about swapping to real cloud storage before deploying
- **WhatsApp reminders**: electricity bills auto-send the moment a reading
  is logged (`lib/reminders.ts` + `lib/whatsapp.ts`); rent reminders go out
  daily via a Vercel Cron job (`/api/cron/rent-reminders`, see `vercel.json`)
  — 3 days before due, on the due date, and once/day while overdue.
  `/api/rent/generate` creates the month's rent-due rows from active
  agreements (run monthly, e.g. on the 1st).
- **PWA offline support**: `public/sw.js` service worker — pages you've
  already opened (dashboard, unit list, a specific unit, the vacancy page)
  stay viewable offline; anything never visited shows `offline.html` instead
  of a browser error. `/api/*` calls are deliberately network-only (never
  cached) so bills/rent status can never be shown stale. A small amber
  banner appears whenever the device goes offline. Registered via
  `components/PwaRegister.tsx` in the root layout. Placeholder icons are in
  `public/icon-192.png` / `icon-512.png` — swap these for real branding
  whenever you have a logo.
- **Rent QR**: each rent-due row on a unit's page has a "Show payment QR"
  toggle — generates a dynamic UPI QR (`/api/rent/[id]/qr`, using the
  `qrcode` package) with the exact remaining amount pre-filled, so scanning
  it opens the tenant's UPI app with nothing left to type in. Since
  free-tier UPI has no reliable payment webhook, "Mark as paid" next to it
  is a manual owner action once you've confirmed the payment landed.
- **Tenant portal** (`/portal`): phone + WhatsApp OTP login (only numbers
  already on file as a tenant can log in — it's not open signup). Once in,
  a tenant sees their own agreement, rent dues (with the same pay-by-QR
  flow, minus the mark-paid button — that stays owner-only), electricity
  bills, and can raise/track maintenance complaints. Paid rent rows link to
  a printable receipt (`/portal/receipts/[id]`) — useful for HRA claims —
  with an ownership check so a tenant can never view another tenant's
  receipt even by guessing a URL. Sessions last 30 days via an httpOnly
  cookie; log out clears both the cookie and the session row.

## WhatsApp setup (required before reminders will actually send)
1. Create a Meta Business Account + WhatsApp Business app in
   [Meta for Developers](https://developers.facebook.com/) — this gives you
   a phone number ID and a temporary access token (generate a permanent
   token for production, under System Users).
2. In WhatsApp Manager → Message Templates, create and submit these three
   templates for approval (approval takes hours, not instant):
   - `rent_reminder` — body: `Hi {{1}}, rent of {{2}} for {{3}} is due on {{4}}. Please pay at your earliest.`
   - `rent_overdue` — body: `Hi {{1}}, rent of {{2}} for {{3}} was due on {{4}} and is still pending.`
   - `electricity_bill` — body: `Hi, electricity bill for {{1}}: {{2}}, amount {{3}}. Please pay by {{4}}.`
   - `otp_login` — body: `Your Shil Niwas login code is {{1}}. It expires in 5 minutes. Do not share this code.`
   (Template wording can differ from these, but the variable count/order
   must match what `lib/reminders.ts` sends — check that file if you change them.)
3. Put `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` in `.env` (and
   in your Vercel project's env vars once deployed).
4. Set `CRON_SECRET` to any random string, in both `.env` and Vercel's env
   vars — this is what stops random people from hitting your reminder cron.
5. Deploy to Vercel — `vercel.json` registers the daily cron automatically
   on the free tier (once a day is within the free plan's limit).
6. To test the rent cron manually before relying on the schedule:
   `curl -H "Authorization: Bearer <your CRON_SECRET>" https://<your-app>/api/cron/rent-reminders`

## Next steps (Phase 1 build order)
1. Wire Prisma to a real Postgres instance (Supabase free tier is fine)
2. `npx prisma migrate dev --name init` then `npx prisma db seed` (or `ts-node prisma/seed.ts`)
3. Swap `/api/upload` to Supabase Storage/S3 before deploying (local filesystem writes don't persist on serverless hosts)
4. Complete WhatsApp setup above, then run `/api/rent/generate` once to create this month's dues
5. Set `UPI_ID` (your real VPA, e.g. `yourname@okhdfcbank`) and `UPI_PAYEE_NAME` in `.env` so the rent QR works
6. Police verification status tracker UI (field already exists on Tenant — `verificationStatus`)
7. Add the tenant's `/portal`, `/portal/receipts/[id]` pages to the service
   worker's precache/runtime cache once you're ready for offline support
   there too (not done yet — the service worker currently only precaches
   the owner-side app shell)
8. Nice-to-have: an owner-side page listing all tenants across units (right
   now you reach a tenant only via their unit's detail page)

## Testing the service worker locally
`next dev` runs unoptimized and browsers sometimes ignore service workers on
localhost in dev mode — for a real test, run `npm run build && npm run
start`, open the app, click around a few pages once (so they get cached),
then use Chrome DevTools → Network tab → "Offline" checkbox and reload to
confirm the cached pages still load and the offline banner appears.

See the full requirements doc (rental-property-management-panel.md) for the
complete spec this scaffold is built against.
