# LMS Changes — Apply Guide

## What's in this package

| File | Purpose |
|------|---------|
| `backend/src/auth/oauth.ts` | Google + Microsoft Passport strategies |
| `backend/src/auth/oauthRoutes.ts` | `/api/auth/google` and `/api/auth/microsoft` route handlers |
| `backend/src/admin/sslRoutes.ts` | Admin API for Let's Encrypt cert management |
| `backend/prisma/schema-additions.prisma` | New models: CertificationTrack, CertDomain, BlogPost, PracticeExamSession + OAuth fields on User |
| `backend/prisma/seed-certifications.ts` | Seeds CISSP, CISM, CRISC, CCSP, CEH domains |
| `frontend/src/app/auth/OAuthButtons.tsx` | Google + Microsoft login button component |
| `frontend/src/app/auth/callback/page.tsx` | OAuth redirect handler page |
| `frontend/src/app/blog/page.tsx` | Blog listing page (SEO optimised) |
| `frontend/src/app/blog/[slug]/page.tsx` | Blog post detail page with OpenGraph meta |
| `nginx/lms.conf` | Production Nginx config with SSL, rate limiting, security headers |
| `scripts/deploy.sh` | One-shot deployment script for Ubuntu VM |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD (push-to-deploy) |

---

## Step 1 — Apply schema changes

Open `backend/prisma/schema.prisma` and:

1. Make `passwordHash` nullable on User: `passwordHash String?`
2. Add to User model:
   ```prisma
   avatarUrl        String?
   oauthProvider    OAuthProvider?
   oauthProviderId  String?
   ```
3. Add the `OAuthProvider` enum
4. Add `CertificationTrack`, `CertDomain`, `BlogPost`, `PracticeExamSession` models
5. Add `trackId` to `Course` model
6. Add `domainId` to `Module` model

---

## Step 2 — Install packages

```bash
cd backend
npm install passport passport-google-oauth20 passport-microsoft express-rate-limit express-session
npm install --save-dev @types/passport @types/passport-google-oauth20 @types/express-session

cd ../frontend
npm install @tailwindcss/typography
```

---

## Step 3 — Register OAuth routes in your main Express app

In `backend/src/index.ts` (or wherever your Express app is), add:

```typescript
import oauthRoutes from './auth/oauthRoutes';
import sslRoutes from './admin/sslRoutes';
import './auth/oauth'; // initialise passport strategies

// Register routes
app.use('/api/auth', oauthRoutes);
app.use('/api/admin/ssl', sslRoutes);
```

---

## Step 4 — Add to frontend login page

In your login page, import and render `<OAuthButtons />`:

```tsx
import OAuthButtons from '@/app/auth/OAuthButtons';

// Inside your login form JSX, after the submit button:
<OAuthButtons />
```

---

## Step 5 — Run migrations and seed

```bash
cd backend
npx prisma migrate dev --name "add_oauth_cert_tracks_blog"
npx ts-node prisma/seed-certifications.ts
```

---

## Step 6 — Add environment variables

Add to `backend/.env`:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=common
FRONTEND_URL=https://yourdomain.com
```

---

## Step 7 — GitHub Actions secrets

In GitHub repo → Settings → Secrets → Actions, add:
- `VM_HOST` — your VM's IP address
- `VM_USER` — SSH username (root or ubuntu)
- `VM_SSH_KEY` — your SSH private key (paste full contents)

---

## Step 8 — Deploy to VM

```bash
# On your VM (replace values):
export DOMAIN=yourdomain.com
export DB_PASSWORD=your_secure_password
bash deploy.sh
```
