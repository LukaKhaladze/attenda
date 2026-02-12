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
- Google Calendar integration + ICS fallback
- Zod validation + server-side sanitization

## Features

- Public conference landing page (`/`)
- Public attendee registration (`/register`)
- Public attendee directory with search/filter/sort (`/attendees`)
- Public attendee detail with privacy-aware phone display (`/attendees/[id]`)
- Meeting proposal actions:
  - Google Calendar event creation (OAuth)
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
- `ADMIN_EMAILS`: comma-separated admin emails allowed into `/admin`
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: optional for Google Calendar API integration
- `GOOGLE_CALENDAR_REDIRECT_URI`: optional, used for Google Calendar API flow

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
