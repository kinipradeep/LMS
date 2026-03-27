import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { buildCertificateSchema } from '../utils/validators.js';

const PASSING_SCORE = 70;

const createCertificateNo = () => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CYBER-${new Date().getUTCFullYear()}-${random}`;
};

const createVerificationCode = () => randomUUID();

const getPublicBaseUrl = () => env.publicAppUrl.replace(/\/$/, '');

const getShareLinks = (verificationCode: string, title: string) => {
  const verificationUrl = `${getPublicBaseUrl()}/certificates/verify/${verificationCode}`;
  const shareText = `I earned the ${title} certificate on Cybersecurity LMS.`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(verificationUrl);

  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
  };
};

export const buildCertificate = async (req: Request, res: Response) => {
  const { quizResultId } = buildCertificateSchema.parse(req.body);

  const quizResult = await prisma.quizResult.findUnique({
    where: { id: quizResultId },
    include: {
      quiz: { select: { id: true, title: true, course: { select: { title: true } } } }
    }
  });

  if (!quizResult || quizResult.userId !== req.auth!.userId) {
    return res.status(404).json({ message: 'Quiz result not found' });
  }

  if (quizResult.score < PASSING_SCORE) {
    return res.status(400).json({
      message: `Minimum score of ${PASSING_SCORE} is required to generate a certificate`
    });
  }

  const certificate = await prisma.certificate.upsert({
    where: {
      userId_quizId: {
        userId: req.auth!.userId,
        quizId: quizResult.quizId
      }
    },
    create: {
      userId: req.auth!.userId,
      quizId: quizResult.quizId,
      quizResultId: quizResult.id,
      certificateNo: createCertificateNo(),
      verificationCode: createVerificationCode()
    },
    update: {
      quizResultId: quizResult.id,
      status: 'ISSUED'
    },
    include: {
      quiz: { select: { title: true, course: { select: { title: true } } } }
    }
  });

  return res.status(201).json({
    ...certificate,
    verificationUrl: `${getPublicBaseUrl()}/certificates/verify/${certificate.verificationCode}`,
    shareLinks: getShareLinks(certificate.verificationCode, certificate.quiz.title)
  });
};

export const myCertificates = async (req: Request, res: Response) => {
  const certificates = await prisma.certificate.findMany({
    where: { userId: req.auth!.userId, status: 'ISSUED' },
    orderBy: { issuedAt: 'desc' },
    include: {
      quiz: { select: { title: true, course: { select: { title: true } } } }
    }
  });

  return res.json(
    certificates.map((certificate) => ({
      ...certificate,
      verificationUrl: `${getPublicBaseUrl()}/certificates/verify/${certificate.verificationCode}`,
      shareLinks: getShareLinks(certificate.verificationCode, certificate.quiz.title)
    }))
  );
};

export const getCertificateById = async (req: Request, res: Response) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true } },
      quiz: { select: { title: true, course: { select: { title: true } } } }
    }
  });

  if (!certificate || certificate.status !== 'ISSUED') {
    return res.status(404).json({ message: 'Certificate not found' });
  }

  return res.json({
    ...certificate,
    verificationUrl: `${getPublicBaseUrl()}/certificates/verify/${certificate.verificationCode}`,
    shareLinks: getShareLinks(certificate.verificationCode, certificate.quiz.title)
  });
};

export const verifyCertificateByCode = async (req: Request, res: Response) => {
  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: req.params.verificationCode },
    include: {
      user: { select: { name: true } },
      quiz: { select: { title: true, course: { select: { title: true } } } }
    }
  });

  if (!certificate || certificate.status !== 'ISSUED') {
    return res.status(404).json({ message: 'Certificate not found' });
  }

  return res.json({
    ...certificate,
    verificationUrl: `${getPublicBaseUrl()}/certificates/verify/${certificate.verificationCode}`,
    shareLinks: getShareLinks(certificate.verificationCode, certificate.quiz.title)
  });
};
