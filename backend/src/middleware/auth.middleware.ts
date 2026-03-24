import { NextFunction, Request, Response } from 'express';
import { AuthRole, verifyToken } from '../utils/auth.js';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: AuthRole };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = authHeader.slice(7);
    req.auth = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (role: AuthRole) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth || req.auth.role !== role) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};

export const requireAnyRole = (roles: AuthRole[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};
