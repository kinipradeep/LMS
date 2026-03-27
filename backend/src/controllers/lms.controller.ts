import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { progressSchema } from '../utils/validators.js';

const canAccessCourse = async (userId: string, role: string, courseId: string) => {
  if (role === 'ADMIN') return true;

  if (role === 'TRAINER') {
    const ownCourse = await prisma.course.findFirst({
      where: { id: courseId, trainerId: userId },
      select: { id: true }
    });
    if (ownCourse) return true;
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { status: true }
  });

  return enrollment?.status === 'ACTIVE';
};

export const myCourses = async (req: Request, res: Response) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.auth!.userId, status: 'ACTIVE' },
    include: { course: true },
    orderBy: { enrolledAt: 'desc' }
  });

  return res.json(enrollments.map((enrollment) => enrollment.course));
};

export const courseModules = async (req: Request, res: Response) => {
  const allowed = await canAccessCourse(req.auth!.userId, req.auth!.role, req.params.id);
  if (!allowed) return res.status(403).json({ message: 'Enrollment required for this course' });

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
    include: { module: { select: { courseId: true, course: true } } }
  });

  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
  const allowed = await canAccessCourse(req.auth!.userId, req.auth!.role, lesson.module.courseId);
  if (!allowed) return res.status(403).json({ message: 'Enrollment required for this lesson' });

  return res.json(lesson);
};

export const updateProgress = async (req: Request, res: Response) => {
  const data = progressSchema.parse(req.body);
  const lesson = await prisma.lesson.findUnique({
    where: { id: data.lessonId },
    select: { module: { select: { courseId: true } } }
  });

  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
  const allowed = await canAccessCourse(req.auth!.userId, req.auth!.role, lesson.module.courseId);
  if (!allowed) return res.status(403).json({ message: 'Enrollment required for this lesson' });

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
