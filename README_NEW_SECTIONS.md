## New Features (Extensions)

- Email subscription confirmation (double opt-in) with hashed tokens
- Pluggable email providers (SendGrid / Resend)
- Namespaced API routes under `/api/*` (legacy kept)
- Admin subscriber management (stats, export, resend)
- Deployment & environment templates for Neon + Vercel

## Email Confirmation Flow
1. User submits email -> token generated & emailed
2. User clicks link -> `/confirm` page verifies
3. Subscriber marked confirmed; metrics update

## Environment Variables
Refer to `backend/.env.example`, `frontend/.env.example`, root `.env.example`.
Key: `EMAIL_PROVIDER`, `SENDGRID_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `CONFIRMATION_TOKEN_EXPIRY_HOURS`, `FRONTEND_BASE_URL`, Neon `DATABASE_URL`.

## Deployment Notes
- Neon Postgres (sslmode=require)
- Frontend: Vercel (`vercel.json` added)
- Backend: separate host (set CORS & URLs)

## Added Scripts
`build:prod`, `db:migrate:prod`, `db:seed:prod`, `deploy` (placeholder), `env:setup`.
