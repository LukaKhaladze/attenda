# Attenda.ge

Production-ready conference networking web app built with **Next.js App Router + TypeScript + Tailwind + Prisma + Postgres**.
Default UI language is **Georgian (ka-GE)**.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL (Neon / Vercel Postgres)
- NextAuth (Credentials: email/password, admin-protected area)
- Vercel Blob uploads for attendee profile images
- ICS calendar fallback for meeting planning
- Zod validation + server-side sanitization

## Features

- Public conference landing page (`/`)
- Public attendee registration (`/register`)
- Public attendee directory with search/filter/sort (`/attendees`)
- Public attendee detail with privacy-aware phone display (`/attendees/[id]`)
- Meeting proposal actions:
  - ICS file download fallback
- Protected admin dashboard (`/admin`):
  - Conference create/read/update/delete
  - Approve/hide attendees
  - CSV attendee export
  - Basic analytics counters (total, last 24h)

## Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required values:

- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: direct PostgreSQL connection string for migrations
- `NEXTAUTH_URL`: app URL (`http://localhost:3000` for local)
- `NEXTAUTH_SECRET`: random secret for NextAuth
- `ADMIN_EMAILS`: optional comma-separated admin emails allowed into `/admin` (if empty, any authenticated user can access admin)
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token
- `SUPABASE_URL`: optional, Supabase project URL for profile photo uploads
- `SUPABASE_SERVICE_ROLE_KEY`: optional, Supabase service role key for server-side Storage uploads
- `SUPABASE_STORAGE_BUCKET`: optional, Supabase Storage bucket for profile photos. Defaults to `attendee-photos`
- `RESEND_API_KEY`: optional, required to send emails through Resend
- `MAIL_FROM_EMAIL`: optional, sender email for app notifications such as registrations and approvals. Defaults to `NetworkApp <no-reply@networkapp.ge>`
- `REGISTRATION_NOTIFY_EMAILS`: optional fallback comma-separated emails notified about new attendee registrations when an event has no assigned host
- `RESET_FROM_EMAIL`: optional, sender email for password reset messages and fallback sender for app notifications. Use `NetworkApp <no-reply@networkapp.ge>`

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Prisma

Generate Prisma client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

Seed database:

```bash
npm run prisma:seed
```

## Deployment (Vercel)

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Add all environment variables in Vercel project settings.
4. Set `DATABASE_URL` to Neon or Vercel Postgres.
5. Run migration and seed once against production DB:
   - `npx prisma migrate deploy`
   - `npm run prisma:seed`
6. Deploy.

## Notes

- Registration endpoint includes:
  - rate limiting
  - honeypot anti-spam field
  - timing anti-bot check
- Phone numbers are hidden publicly by default unless attendee opts in (`sharePhonePublic`).
- Public attendee list only includes approved attendees.
