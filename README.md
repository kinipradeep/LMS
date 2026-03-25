# Cybersecurity LMS + CMS Monorepo

This repository contains a lightweight, API-first LMS + CMS MVP for a cybersecurity edtech platform.

## Folder Structure

- `backend`: Node.js + Express + Prisma + PostgreSQL API
- `frontend`: Next.js (App Router) + Tailwind CSS web app

## Implemented Scope

- JWT auth (signup/login/me) with role support: Student, Trainer, Admin
- Public CMS endpoints (pages, posts, course catalog)
- LMS course delivery APIs (my courses, modules, lessons, progress)
- Basic quiz APIs (fetch quiz, submit quiz)
- AI-powered quiz generation with provider abstraction for OpenAI, Gemini, and Claude
- Razorpay order creation + webhook verification + auto enrollment
- Admin config API + UI for editable platform settings
- Trainer creator APIs to create and publish courses
- Certificate builder APIs with social sharing links (LinkedIn/Facebook/X/WhatsApp)
- Frontend public pages, student app pages, and admin/trainer pages

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:4000/api npm run dev
```

## Razorpay Notes

- Configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
- Expose `/api/payments/webhook` and register webhook event `payment.captured`.

## AI Provider Notes

- Set provider secrets in `backend/.env`.
- Use `/api/creator/quizzes/generate` with `provider = openai | gemini | claude` to generate and persist quizzes.

## Certificates

- Build certificate after passing quiz: `POST /api/certificates/build` with `{ "quizResultId": "<id>" }`.
- Student certificate listing: `GET /api/my-certificates`.
- Public certificate verification/share page payload: `GET /api/certificates/:id`.
- Public verification by code (used in social sharing links): `GET /api/certificates/verify/:verificationCode`.
- Configure `PUBLIC_APP_URL` in `backend/.env` so generated social share links point to your frontend domain.
