# Pool Service App

A working MVP pool service management platform built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite, Zod, React Hook Form, and date-fns.

It is designed for a software engineering course demo and supports:

- role-based authentication
- customer and pool management
- technician scheduling
- reusable checklists
- technician job execution
- service logs and chemical logs
- automated chemistry alerts
- compliance and financial reports
- CSV export
- print-friendly reports
- customer update emails with SMTP or database fallback

## Demo credentials

All demo users use the password `demo1234`.

- Owner: `john@poolcleaners.test`
- Operations Manager: `scylla@poolcleaners.test`
- Technician: `alex@poolcleaners.test`
- Technician: `maya@poolcleaners.test`
- Technician: `diego@poolcleaners.test`

## Local setup

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client and create the SQLite database:

```bash
npm run db:generate
npm run db:push
```

If `db:push` fails in your local environment, use the included SQLite bootstrap fallback:

```bash
npm run db:bootstrap
```

The fallback writes the schema to `prisma/dev.db`, which matches the default Prisma SQLite location used by this project.

4. Seed demo data:

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## SMTP behavior

If these environment variables are present, customer updates send as real emails:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

If they are not configured, the app still works:

- the customer message is saved in the database
- the message contents are logged to the server console

This keeps the demo reliable in local development.

## Seeded scenarios

The seed includes:

- Pool Cleaners Inc organization
- John, Scylla, Alex, Maya, and Diego
- residential, community, resort, splash zone, and hot tub pools
- jobs scheduled for today and upcoming days
- historical service logs and chemical logs
- incidents
- out-of-range chemistry that creates alerts
- equipment expenses

## Core routes

- `/login`
- `/dashboard`
- `/customers`
- `/pools`
- `/schedule`
- `/jobs`
- `/my-jobs`
- `/checklists`
- `/reports/compliance`
- `/reports/financial`
- `/team`
- `/settings`

## Simplifications

This is intentionally an MVP. A few practical simplifications were made:

- authentication uses a custom credentials and session system instead of NextAuth to keep the demo setup small and reliable
- report filters use lightweight query-string forms instead of a full saved-report builder UI
- email attachments and PDF generation are omitted; print-friendly pages are included instead
- technician job completion submits service, checklist, chemical, and incident data from one page in one action

## Architecture notes

- `app/`: App Router routes, layouts, dashboards, pages, and API handlers
- `components/`: reusable UI and client-side forms
- `lib/`: auth, permissions, reports, alerts, email, validation, and Prisma helpers
- `prisma/`: schema and seed data

## Database reset

To refresh local demo data:

```bash
rm -f prisma/dev.db prisma/dev.db-journal
npm run db:push
npm run db:seed
```
