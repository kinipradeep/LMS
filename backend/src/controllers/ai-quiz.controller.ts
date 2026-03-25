import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { generateQuizQuestions } from '../services/ai-quiz.service.js';
import { aiQuizGenerateSchema } from '../utils/validators.js';

export const generateQuizWithAI = async (req: Request, res: Response) => {
  const data = aiQuizGenerateSchema.parse(req.body);

  const course = await prisma.course.findUnique({ where: { id: data.courseId } });
  if (!course) return res.status(404).json({ message: 'Course not found' });

  if (req.auth?.role === 'TRAINER' && course.trainerId !== req.auth.userId) {
    return res.status(403).json({ message: 'Trainer can only create quizzes for own courses' });
  }

  const generated = await generateQuizQuestions(data.provider, {
    title: data.title,
    domain: data.domain,
    questionCount: data.questionCount,
    difficulty: data.difficulty
  });

  const quiz = await prisma.quiz.create({
    data: {
      courseId: data.courseId,
      title: data.title,
      duration: data.duration,
      questions: {
        create: generated.map((item) => ({
          question: item.question,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          domain: item.domain
        }))
      }
    },
    include: { questions: true }
  });

  return res.status(201).json(quiz);
};
