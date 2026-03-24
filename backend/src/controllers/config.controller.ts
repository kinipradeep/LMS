import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { upsertConfigSchema } from '../utils/validators.js';

export const getConfig = async (_req: Request, res: Response) => {
  const config = await prisma.appConfig.findMany({ orderBy: { key: 'asc' } });
  return res.json(config);
};

export const upsertConfig = async (req: Request, res: Response) => {
  const data = upsertConfigSchema.parse(req.body);
  const config = await prisma.appConfig.upsert({
    where: { key: data.key },
    create: { key: data.key, value: data.value },
    update: { value: data.value }
  });

  return res.json(config);
};
