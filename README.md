# AI Platforms Gallery — Setup

## Prerequisites
- Node.js 18+
- pnpm (or npm/yarn) — update root scripts if you prefer npm/yarn
- PostgreSQL (or run `docker-compose up -d`)

## 1) Install deps
```bash
pnpm install
pnpm --filter backend prisma generate
```

## 2) Env
- Copy `backend/.env.example` to `backend/.env`, set `DATABASE_URL`, `JWT_SECRET`.
- Copy root `.env.example` to `.env` for docker (optional).
- Set `frontend` env: `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000`.

## 3) Database
```bash
# Start Postgres (via Docker optional)
docker-compose up -d

# Push schema
pnpm db:push

# Seed data
pnpm seed
```

## 4) Run dev
```bash
pnpm dev
# Frontend on http://localhost:3000
# Backend  on http://localhost:4000
```

## 5) Production
- **Backend (Render)**: Create a new Web Service, build command `pnpm install && pnpm --filter backend build`, start `pnpm --filter backend start`. Set env vars `DATABASE_URL`, `JWT_SECRET`, `PORT`.
- **Frontend (Vercel)**: Set env `NEXT_PUBLIC_BACKEND_URL` to your Render URL. Build normally.

## Notes
- This MVP includes micro-interactions (hover tilt, confetti, count pop) and analytics.
- Add GA if desired. Add rate-limits & captcha for production-grade subscribe.
- Images use remote patterns; consider proxying or uploading in production.