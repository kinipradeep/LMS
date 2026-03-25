import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['STUDENT', 'TRAINER', 'ADMIN']).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const progressSchema = z.object({
  lessonId: z.string().uuid(),
  completed: z.boolean().default(true)
});

export const submitQuizSchema = z.object({
  answers: z.array(z.object({ questionId: z.string().uuid(), answer: z.string() }))
});

export const createOrderSchema = z.object({
  courseId: z.string().uuid()
});

export const createCourseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  thumbnail: z.string().url().optional(),
  published: z.boolean().default(false)
});

export const publishCourseSchema = z.object({
  published: z.boolean()
});

export const upsertConfigSchema = z.object({
  key: z.string().min(2),
  value: z.unknown()
});

export const aiQuizGenerateSchema = z.object({
  provider: z.enum(['openai', 'gemini', 'claude']),
  courseId: z.string().uuid(),
  title: z.string().min(3),
  duration: z.number().int().min(1).max(240),
  domain: z.string().min(2),
  questionCount: z.number().int().min(3).max(40),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
});

export const buildCertificateSchema = z.object({
  quizResultId: z.string().uuid()
});
