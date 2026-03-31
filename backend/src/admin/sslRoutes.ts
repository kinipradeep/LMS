import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '../middleware/auth';

const router = Router();
const execAsync = promisify(exec);

// All routes require admin role
router.use(requireAdmin);

// ─── GET /api/admin/ssl/status ────────────────────────────────────────────────
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const domain = process.env.PUBLIC_APP_URL?.replace(/https?:\/\//, '') || '';
    const certPath = `/etc/letsencrypt/live/${domain}/fullchain.pem`;

    if (!fs.existsSync(certPath)) {
      return res.json({ status: 'not_issued', domain });
    }

    // Read cert expiry using openssl
    const { stdout } = await execAsync(
      `openssl x509 -enddate -noout -in ${certPath}`
    );
    const match = stdout.match(/notAfter=(.+)/);
    const expiryDate = match ? new Date(match[1]) : null;
    const daysLeft = expiryDate
      ? Math.floor((expiryDate.getTime() - Date.now()) / 86400000)
      : null;

    return res.json({
      status: daysLeft && daysLeft > 0 ? 'active' : 'expired',
      domain,
      expiresAt: expiryDate?.toISOString(),
      daysLeft,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/admin/ssl/renew ────────────────────────────────────────────────
router.post('/renew', async (_req: Request, res: Response) => {
  try {
    const { stdout, stderr } = await execAsync(
      'certbot renew --quiet && systemctl reload nginx'
    );
    return res.json({ success: true, output: stdout || stderr });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/ssl/issue ────────────────────────────────────────────────
// Issue a new cert for a domain (first-time setup)
router.post('/issue', async (req: Request, res: Response) => {
  const { domain, email } = req.body;
  if (!domain || !email) {
    return res.status(400).json({ error: 'domain and email are required' });
  }

  // Basic domain validation
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  try {
    const cmd = `certbot --nginx -d ${domain} -d www.${domain} --non-interactive --agree-tos --email ${email} --redirect`;
    const { stdout } = await execAsync(cmd);
    return res.json({ success: true, output: stdout });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
