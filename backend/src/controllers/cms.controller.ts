import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getPageBySlug = async (req: Request, res: Response) => {
  const page = await prisma.page.findFirst({ where: { slug: req.params.slug, published: true } });
  if (!page) return res.status(404).json({ message: 'Page not found' });
  return res.json(page);
};

export const getPosts = async (_req: Request, res: Response) => {
  const posts = await prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } });
  return res.json(posts);
};

export const getCourses = async (_req: Request, res: Response) => {
  const courses = await prisma.course.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } });
  return res.json(courses);
};

export const getCourseBySlug = async (req: Request, res: Response) => {
  const course = await prisma.course.findFirst({
    where: { slug: req.params.slug, published: true },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: { lessons: { orderBy: { orderIndex: 'asc' } } }
      }
    }
  });

  if (!course) return res.status(404).json({ message: 'Course not found' });
  return res.json(course);
};
