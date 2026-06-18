# Tino Barber Booking (Next.js)

Production-quality barber booking platform built with Next.js App Router, TypeScript, Tailwind, Supabase, Google Calendar API, Resend, Zod, and date-fns.

Google Calendar is the source of truth for availability.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS (v4)
- Supabase (Postgres + Auth)
- Google Calendar API (service account)
- Resend (transactional email)
- Zod (validation)
- date-fns (date utilities)

## Features

- Premium dark-brand marketing homepage (`/`)
- Booking flow (`/book`)
- Real-time availability fetched from Google Calendar + business hour env vars
- Server-side booking validation and double-book prevention
- Booking creation flow:
  1. Validate input (Zod)
  2. Re-check slot availability server-side
  3. Create Google Calendar event
  4. Save booking in Supabase
  5. Generate ICS invite
  6. Send customer confirmation email
  7. Send barber notification email
- Admin dashboard (`/admin`) protected via Supabase Auth
- Admin actions: search, cancel, resend confirmation
- Cancellation sync: update booking status + remove Google Calendar event + send cancellation emails

## Routes

### Pages

- `/` Home
- `/book` Booking page
- `/admin/login` Admin sign in
- `/admin` Admin dashboard (protected)

### API

- `GET /api/services`
- `GET /api/availability?serviceId=<uuid>&date=YYYY-MM-DD`
- `POST /api/bookings`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/:id/cancel`
- `POST /api/admin/bookings/:id/resend`

## Database Schema

SQL is in `supabase/schema.sql`.

Tables:

- `services`
  - `id uuid primary key`
  - `name text`
  - `description text`
  - `duration_minutes integer`
  - `price_cents integer`
  - `active boolean`
  - `created_at timestamp`

- `bookings`
  - `id uuid primary key`
  - `service_id uuid references services(id)`
  - `customer_name text`
  - `customer_email text`
  - `customer_phone text`
  - `notes text`
  - `starts_at timestamp`
  - `ends_at timestamp`
  - `status text`
  - `google_calendar_event_id text`
  - `created_at timestamp`

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Required:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_CALENDAR_ID`
- `BARBER_EMAIL`

Optional:

- `RESEND_API_KEY` (if not set, email sending is skipped)
- `RESEND_FROM_EMAIL` (must be a verified sender/domain in Resend; defaults to `onboarding@resend.dev`)

Business hours (used with Google Calendar blocks):

- `MONDAY_START`, `MONDAY_END`
- `TUESDAY_START`, `TUESDAY_END`
- `WEDNESDAY_START`, `WEDNESDAY_END`
- `THURSDAY_START`, `THURSDAY_END`
- `FRIDAY_START`, `FRIDAY_END`
- `SATURDAY_START`, `SATURDAY_END`
- `SUNDAY_START`, `SUNDAY_END`

Set `START` and `END` equal to close a day.

## Setup

1. Install dependencies

```bash
npm install
```

2. Provision Supabase project and run schema:

- Open Supabase SQL editor
- Run contents of `supabase/schema.sql`

3. Create at least one admin user in Supabase Auth.

4. Configure Google Calendar service account:

- Create service account in Google Cloud
- Enable Google Calendar API
- Share barber calendar with service account email (`GOOGLE_CLIENT_EMAIL`) with editor access
- Set `GOOGLE_CALENDAR_ID`
- Add private key as `GOOGLE_PRIVATE_KEY` (escaped newlines are supported)

5. Configure Resend (optional but recommended):

- Add `RESEND_API_KEY`
- Set `RESEND_FROM_EMAIL` to a verified sender (or use `onboarding@resend.dev` for testing)
- Verify sender domain if needed

6. Start app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Availability Model

Availability = Business hours for the day minus events in Google Calendar minus past times.

The app does not provide a schedule editor. Any blocked time, vacation, lunch, personal event, or manual appointment added directly in Google Calendar is automatically respected.

## Security Notes

- Zod validation on all booking inputs
- Server-only secrets in server utilities
- Admin routes require authenticated Supabase user
- Double-book prevention by re-fetching current availability server-side at booking time

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run start`
