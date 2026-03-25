import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { createCourseSchema, publishCourseSchema } from '../utils/validators.js';

export const createCourse = async (req: Request, res: Response) => {
  const data = createCourseSchema.parse(req.body);
  const course = await prisma.course.create({
    data: {
      ...data,
      trainerId: req.auth?.role === 'TRAINER' ? req.auth.userId : undefined
    }
  });
  return res.status(201).json(course);
};

export const publishCourse = async (req: Request, res: Response) => {
  const data = publishCourseSchema.parse(req.body);

  const existing = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Course not found' });

  if (req.auth?.role === 'TRAINER' && existing.trainerId !== req.auth.userId) {
    return res.status(403).json({ message: 'Trainer can only publish own courses' });
  }

  const updated = await prisma.course.update({
    where: { id: req.params.id },
    data: { published: data.published }
  });

  return res.json(updated);
};
