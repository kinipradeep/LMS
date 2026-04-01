#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# LMS Full Deployment Script
# Run as root on a fresh Ubuntu 22.04 VM
# Usage: bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

DOMAIN="${DOMAIN:-yourdomain.com}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -hex 16)}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO_PATH="kinipradeep/LMS"
REPO="https://${GITHUB_TOKEN:+${GITHUB_TOKEN}@}github.com/${REPO_PATH}.git"
APP_DIR="/var/www/lms"
NODE_VERSION="20"

echo "════════════════════════════════════════"
echo " LMS Deployment — $DOMAIN"
echo "════════════════════════════════════════"

# ── 1. System update ──────────────────────────────────────────────────────────
echo "→ Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Install Node.js ────────────────────────────────────────────────────────
echo "→ Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# ── 3. Install PostgreSQL ─────────────────────────────────────────────────────
echo "→ Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql && systemctl start postgresql

# Create DB and user
sudo -u postgres psql <<EOF
CREATE USER lmsuser WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE lmsdb OWNER lmsuser;
GRANT ALL PRIVILEGES ON DATABASE lmsdb TO lmsuser;
EOF
echo "  ✅ Database: lmsdb / user: lmsuser / pass: ${DB_PASSWORD}"

# ── 4. Install Redis ──────────────────────────────────────────────────────────
echo "→ Installing Redis..."
apt-get install -y redis-server
# Tune Redis for 2GB RAM — max 256MB
sed -i 's/^# maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf
sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
systemctl enable redis-server && systemctl start redis-server

# ── 5. Install Nginx ──────────────────────────────────────────────────────────
echo "→ Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx

# ── 6. Install Certbot ────────────────────────────────────────────────────────
echo "→ Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# ── 7. Install PM2 ────────────────────────────────────────────────────────────
echo "→ Installing PM2..."
npm install -g pm2

# ── 8. Clone repo ─────────────────────────────────────────────────────────────
echo "→ Cloning repository..."
mkdir -p $APP_DIR
git clone $REPO $APP_DIR || (cd $APP_DIR && git pull)

# ── 9. Backend setup ──────────────────────────────────────────────────────────
echo "→ Setting up backend..."
cd $APP_DIR/backend

cat > .env <<EOF
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://lmsuser:${DB_PASSWORD}@localhost:5432/lmsdb
REDIS_URL=redis://localhost:6379
JWT_SECRET=$(openssl rand -hex 32)
PUBLIC_APP_URL=https://${DOMAIN}
FRONTEND_URL=https://${DOMAIN}

# OAuth — fill these in
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=common

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# AI Quiz generation
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
EOF

npm install
npm run build
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed-certifications.ts || echo "  ⚠️  Seed skipped (may already exist)"

# ── 10. Frontend setup ────────────────────────────────────────────────────────
echo "→ Setting up frontend..."
cd $APP_DIR/frontend

cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
EOF

npm install
npm run build

# ── 11. PM2 process config ────────────────────────────────────────────────────
echo "→ Configuring PM2..."
cat > $APP_DIR/ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'lms-backend',
      cwd: '${APP_DIR}/backend',
      script: 'npm',
      args: 'start',
      env: { NODE_ENV: 'production', PORT: 4000 },
      max_memory_restart: '400M',
      instances: 1,
    },
    {
      name: 'lms-frontend',
      cwd: '${APP_DIR}/frontend',
      script: 'npm',
      args: 'start',
      env: { NODE_ENV: 'production', PORT: 3000 },
      max_memory_restart: '400M',
      instances: 1,
    },
  ],
};
EOF

cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

# ── 12. Nginx config ──────────────────────────────────────────────────────────
echo "→ Configuring Nginx..."
sed "s/YOUR_DOMAIN/${DOMAIN}/g" $APP_DIR/nginx/lms.conf > /etc/nginx/sites-available/lms
ln -sf /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/lms
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 13. Let's Encrypt SSL ─────────────────────────────────────────────────────
echo "→ Issuing Let's Encrypt certificate for ${DOMAIN}..."
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} \
  --non-interactive --agree-tos \
  --email admin@${DOMAIN} \
  --redirect

# Auto-renewal cron
echo "0 3 * * * certbot renew --quiet && systemctl reload nginx" | crontab -

# ── 14. Firewall ──────────────────────────────────────────────────────────────
echo "→ Configuring UFW firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "════════════════════════════════════════"
echo " ✅ Deployment complete!"
echo "════════════════════════════════════════"
echo " App:      https://${DOMAIN}"
echo " API:      https://${DOMAIN}/api"
echo " DB pass:  ${DB_PASSWORD}"
echo ""
echo " ⚠️  Remember to fill in OAuth + payment keys in:"
echo "    ${APP_DIR}/backend/.env"
echo ""
echo " PM2 status: pm2 status"
echo " Logs:       pm2 logs"
echo "════════════════════════════════════════"
