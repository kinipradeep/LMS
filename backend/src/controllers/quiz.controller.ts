import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { submitQuizSchema } from '../utils/validators.js';

export const getQuiz = async (req: Request, res: Response) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: req.params.id },
    include: {
      questions: { select: { id: true, question: true, options: true, domain: true } }
    }
  });

  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  return res.json(quiz);
};

export const submitQuiz = async (req: Request, res: Response) => {
  const data = submitQuizSchema.parse(req.body);
  const questions = await prisma.question.findMany({ where: { quizId: req.params.id } });
  if (!questions.length) return res.status(404).json({ message: 'Quiz not found' });

  const answerMap = new Map(data.answers.map((a) => [a.questionId, a.answer]));
  const correct = questions.filter((q) => answerMap.get(q.id) === q.correctAnswer).length;
  const score = Math.round((correct / questions.length) * 100);

  const result = await prisma.quizResult.create({
    data: { userId: req.auth!.userId, quizId: req.params.id, score }
  });

  return res.json({
    resultId: result.id,
    score,
    total: questions.length,
    correct,
    canGenerateCertificate: score >= 70
  });
};
