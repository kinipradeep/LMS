import { Router, Request, Response } from 'express';
import passport from './oauth.js';
import { env } from '../config/env.js';
import { signToken } from '../utils/auth.js';

const router = Router();

// Derive and validate the frontend URL from env (fallback to localhost for dev)
const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  // Guard against open-redirect: only allow http/https schemes
  if (!/^https?:\/\//.test(url)) throw new Error('Invalid FRONTEND_URL');
  return url.replace(/\/$/, '');
};

const issueTokenCookie = (res: Response, user: { id: string; role: string }) => {
  // Use the same signToken helper as the rest of the app (respects env.jwtSecret + env.jwtExpiresIn)
  const token = signToken({ userId: user.id, role: user.role as 'STUDENT' | 'TRAINER' | 'ADMIN' });
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  });
  return token;
};

// ─── Google ──────────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${getFrontendUrl()}/login?error=google`
  }),
  (req: Request, res: Response) => {
    issueTokenCookie(res, req.user as { id: string; role: string });
    res.redirect(`${getFrontendUrl()}/auth/callback`);
  }
);

// ─── Microsoft ───────────────────────────────────────────────────────────────
router.get(
  '/microsoft',
  passport.authenticate('microsoft', { session: false })
);

router.get(
  '/microsoft/callback',
  passport.authenticate('microsoft', {
    session: false,
    failureRedirect: `${getFrontendUrl()}/login?error=microsoft`
  }),
  (req: Request, res: Response) => {
    issueTokenCookie(res, req.user as { id: string; role: string });
    res.redirect(`${getFrontendUrl()}/auth/callback`);
  }
);

export default router;

