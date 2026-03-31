import { Router, Request, Response } from 'express';
import passport from './oauth';
import jwt from 'jsonwebtoken';

const router = Router();

const issueJwt = (user: any) =>
  jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Google ──────────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${frontendUrl}/login?error=google` }),
  (req: Request, res: Response) => {
    const token = issueJwt(req.user);
    // Redirect to frontend with token in query — frontend stores in localStorage
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

// ─── Microsoft ───────────────────────────────────────────────────────────────
router.get(
  '/microsoft',
  passport.authenticate('microsoft', { session: false })
);

router.get(
  '/microsoft/callback',
  passport.authenticate('microsoft', { session: false, failureRedirect: `${frontendUrl}/login?error=microsoft` }),
  (req: Request, res: Response) => {
    const token = issueJwt(req.user);
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

export default router;
