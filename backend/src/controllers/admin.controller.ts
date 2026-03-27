import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const adminCourses = async (_req: Request, res: Response) => {
  const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(courses);
};

export const adminUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  return res.json(users);
};
