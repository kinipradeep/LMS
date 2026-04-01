import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { hashPassword, signToken, verifyPassword } from '../utils/auth.js';
import { loginSchema, signupSchema } from '../utils/validators.js';

export const signup = async (req: Request, res: Response) => {
  const data = signupSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash, role: 'STUDENT' }
  });

  const token = signToken({ userId: user.id, role: user.role });
  return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
};


export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // OAuth-only users have no password — reject password login attempts
  if (!user.passwordHash) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await verifyPassword(data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken({ userId: user.id, role: user.role });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
};


export const me = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });

  return res.json(user);
};
