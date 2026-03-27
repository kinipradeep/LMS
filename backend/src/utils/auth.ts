import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AuthRole = 'STUDENT' | 'TRAINER' | 'ADMIN';
export type JwtPayload = { userId: string; role: AuthRole };

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] });

export const verifyToken = (token: string) => jwt.verify(token, env.jwtSecret) as JwtPayload;
