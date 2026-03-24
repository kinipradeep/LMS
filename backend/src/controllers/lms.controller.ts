import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { progressSchema } from '../utils/validators.js';

export const myCourses = async (req: Request, res: Response) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.auth!.userId, status: 'ACTIVE' },
    include: { course: true },
    orderBy: { enrolledAt: 'desc' }
  });

  return res.json(enrollments.map((enrollment) => enrollment.course));
};

export const courseModules = async (req: Request, res: Response) => {
  const modules = await prisma.module.findMany({
    where: { courseId: req.params.id },
    orderBy: { orderIndex: 'asc' },
    include: { lessons: { orderBy: { orderIndex: 'asc' } } }
  });
  return res.json(modules);
};

export const lessonById = async (req: Request, res: Response) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: req.params.id },
    include: { module: { include: { course: true } } }
  });

  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
  return res.json(lesson);
};

export const updateProgress = async (req: Request, res: Response) => {
  const data = progressSchema.parse(req.body);
  const progress = await prisma.progress.upsert({
    where: { userId_lessonId: { userId: req.auth!.userId, lessonId: data.lessonId } },
    create: {
      userId: req.auth!.userId,
      lessonId: data.lessonId,
      completed: data.completed,
      completedAt: data.completed ? new Date() : null
    },
    update: {
      completed: data.completed,
      completedAt: data.completed ? new Date() : null
    }
  });

  return res.json(progress);
};
