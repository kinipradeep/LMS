import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ZodError } from 'zod';
import { router } from './routes/index.js';
import { env } from './config/env.js';

export const app = express();

// Restrict CORS to known frontend origin(s) only
app.use(cors({
  origin: env.publicAppUrl,
  credentials: true // needed if frontend reads the HttpOnly auth_token cookie
}));
app.use(helmet());
app.use(morgan('dev'));

// Single express.json() call with rawBody capture for webhook signature verification
// and a 1MB payload size limit to guard against JSON bomb attacks
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
  }
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', router);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', issues: err.issues });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});
