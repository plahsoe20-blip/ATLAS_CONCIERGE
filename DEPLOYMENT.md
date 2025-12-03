# ATLAS CONCIERGE - Production Deployment Guide

## Overview
This guide covers deploying ATLAS Concierge to production cloud platforms.

---

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 15+
- Redis 7+
- Domain name with SSL certificate
- Cloud provider account (AWS, Heroku, Railway, or DigitalOcean)

---

## Environment Setup

1. **Copy environment file:**
   ```bash
   cp backend-nestjs/.env.example backend-nestjs/.env
   ```

2. **Fill in all required environment variables** (see `.env.example` for details)

3. **Generate secure secrets:**
   ```bash
   openssl rand -base64 32  # For SESSION_SECRET
   openssl rand -base64 32  # For CSRF_SECRET
   ```

---

## Database Setup

### Option 1: Managed PostgreSQL (Recommended)
- **AWS RDS:** PostgreSQL instance
- **Heroku Postgres:** Add-on
- **Railway:** Built-in PostgreSQL
- **Supabase:** Free PostgreSQL with 500MB

### Option 2: Self-Hosted
```bash
docker run -d \
  --name atlas-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=atlas_concierge \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15
```

### Run Migrations
```bash
cd backend-nestjs
npx prisma migrate deploy
npx prisma generate
```

---

## Deployment Options

### 🚀 Option 1: AWS (Full Production)

#### **1. RDS PostgreSQL Setup**
1. Create RDS PostgreSQL 15 instance
2. Note connection string
3. Enable public access (temporary) for initial migration
4. Run Prisma migrations

#### **2. ElastiCache Redis**
1. Create Redis cluster
2. Note Redis endpoint

#### **3. EC2 or ECS**

**EC2 Deployment:**
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance

# Clone repository
git clone https://github.com/your-org/atlas-concierge.git
cd atlas-concierge

# Install dependencies
cd backend-nestjs && npm install --production
cd ../frontend && npm install

# Build frontend
npm run build

# Set up PM2 for backend
npm install -g pm2
pm2 start backend-nestjs/dist/main.js --name atlas-api
pm2 startup
pm2 save

# Nginx config for frontend
sudo cp nginx.prod.conf /etc/nginx/sites-available/atlas
sudo ln -s /etc/nginx/sites-available/atlas /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

**ECS (Docker) Deployment:**
```bash
# Build and push Docker images
docker build -t atlas-backend ./backend-nestjs
docker tag atlas-backend:latest your-ecr-repo/atlas-backend:latest
docker push your-ecr-repo/atlas-backend:latest

docker build -t atlas-frontend -f Dockerfile.frontend .
docker tag atlas-frontend:latest your-ecr-repo/atlas-frontend:latest
docker push your-ecr-repo/atlas-frontend:latest

# Deploy via ECS console or CLI
```

#### **4. S3 for File Uploads**
```bash
aws s3 mb s3://atlas-concierge-uploads
aws s3api put-bucket-cors --bucket atlas-concierge-uploads --cors-configuration file://cors.json
```

#### **5. CloudFront + Route 53**
- Create CloudFront distribution pointing to S3/EC2
- Configure Route 53 for custom domain
- Enable HTTPS with ACM certificate

---

### 🔥 Option 2: Heroku (Quick Production)

```bash
# Login to Heroku
heroku login

# Create app
heroku create atlas-concierge-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
heroku config:set GOOGLE_MAPS_API_KEY=your_key
# ... (set all other env vars from .env.example)

# Deploy backend
git subtree push --prefix backend-nestjs heroku main

# Run migrations
heroku run npx prisma migrate deploy

# Scale dynos
heroku ps:scale web=2:standard-2x
```

**Frontend (Heroku or Netlify):**
```bash
# Option A: Heroku
heroku create atlas-concierge-web
heroku buildpacks:set heroku/nodejs
git subtree push --prefix frontend heroku main

# Option B: Netlify
# Connect GitHub repo to Netlify
# Build command: npm run build
# Publish directory: dist
```

---

### ⚡ Option 3: Railway (Easiest)

1. **Create Railway account** at railway.app
2. **New Project → Deploy from GitHub**
3. **Add Services:**
   - PostgreSQL database
   - Redis instance
   - NestJS backend (detect automatically)
   - React frontend (detect automatically)
4. **Set environment variables** in Railway dashboard
5. **Deploy automatically** on every git push

**Cost:** ~$20-50/month for small production

---

### 🌊 Option 4: DigitalOcean App Platform

```bash
# Install doctl CLI
brew install doctl  # or download from DO

# Authenticate
doctl auth init

# Create app spec
cat > app.yaml <<EOF
name: atlas-concierge
services:
  - name: backend
    source:
      repo: your-org/atlas-concierge
      branch: main
      source_dir: /backend-nestjs
    build_command: npm run build
    run_command: npm run start:prod
    envs:
      - key: DATABASE_URL
        scope: RUN_TIME
        value: \${db.DATABASE_URL}
    http_port: 3001
  
  - name: frontend
    source:
      repo: your-org/atlas-concierge
      branch: main
    build_command: npm run build
    run_command: serve -s dist -p 8080
    http_port: 8080

databases:
  - name: postgres
    engine: PG
    version: "15"

  - name: redis
    engine: REDIS
    version: "7"
EOF

# Deploy
doctl apps create --spec app.yaml
```

---

## Post-Deployment Checklist

- [ ] Database migrations successful
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] SSL certificate active
- [ ] Health check endpoint responding
- [ ] Session authentication working
- [ ] File uploads to S3/Cloudinary working
- [ ] Payment processing configured (Stripe)
- [ ] SMS notifications working (Twilio)
- [ ] Map services working (Google Maps + Mapbox)
- [ ] WebSocket connections stable
- [ ] Error tracking configured (Sentry)
- [ ] Logs centralized (CloudWatch, Papertrail, etc.)
- [ ] Backup schedule configured
- [ ] Monitoring/alerts set up

---

## Performance Optimization

### Backend
```typescript
// Enable compression
app.use(compression());

// Redis caching
@Injectable()
export class CacheService {
  async getOrSet(key: string, ttl: number, fn: () => Promise<any>) {
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);
    
    const fresh = await fn();
    await this.redis.setex(key, ttl, JSON.stringify(fresh));
    return fresh;
  }
}
```

### Frontend
```bash
# Enable gzip compression
npm run build

# Analyze bundle size
npm run build -- --analyze

# Code splitting (already configured in Vite)
```

### Database
```sql
-- Add indexes for frequent queries
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_company_driver ON rides(company_id, driver_id);
CREATE INDEX idx_rides_pickup_time ON rides(pickup_time);
```

---

## Monitoring

### Health Check Endpoint
```bash
curl https://your-api.com/health
# Should return: {"status":"ok","database":"connected","redis":"connected"}
```

### Log Monitoring
```bash
# Heroku
heroku logs --tail --app atlas-concierge-api

# AWS CloudWatch
aws logs tail /aws/ec2/atlas-api --follow

# PM2
pm2 logs atlas-api
```

### Error Tracking (Sentry)
```typescript
// Already configured in backend
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

## Scaling Strategies

### Horizontal Scaling
- **Backend:** Multiple instances behind load balancer
- **Database:** Read replicas for queries
- **Redis:** Cluster mode for sessions

### Vertical Scaling
- Increase RAM/CPU for database
- Upgrade dyno/instance size

### Caching Strategy
- Redis for sessions (already implemented)
- Redis for frequent queries (implement CacheService)
- CDN for static assets (CloudFront/Cloudflare)

---

## Backup & Disaster Recovery

### Database Backups
```bash
# Automated daily backups (Heroku)
heroku pg:backups:schedule --at '02:00 America/New_York'

# Manual backup
pg_dump DATABASE_URL > backup.sql

# Restore
psql DATABASE_URL < backup.sql
```

### File Backups (S3)
```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket atlas-uploads \
  --versioning-configuration Status=Enabled
```

---

## Security Hardening

1. **Enable HTTPS only**
2. **Set secure session cookies** (already configured)
3. **Rate limiting** (implement in API Gateway or nginx)
4. **DDoS protection** (Cloudflare)
5. **Regular dependency updates**
   ```bash
   npm audit fix
   npx npm-check-updates -u
   ```
6. **Database access:** Whitelist IPs only
7. **Secrets:** Never commit to git, use secret managers

---

## Cost Estimates

| Platform | Small (100 users) | Medium (1000 users) | Large (10k+ users) |
|----------|-------------------|---------------------|---------------------|
| Railway | $20-30/mo | $80-120/mo | N/A (use AWS) |
| Heroku | $50-100/mo | $200-400/mo | $800+/mo |
| AWS | $80-150/mo | $300-600/mo | $1500+/mo |
| DigitalOcean | $40-80/mo | $150-300/mo | $600+/mo |

---

## Support & Troubleshooting

### Common Issues

**1. Database connection timeout**
- Check DATABASE_URL format
- Verify firewall rules
- Test connection: `psql $DATABASE_URL`

**2. Session not persisting**
- Verify SESSION_SECRET is set
- Check Redis connection
- Ensure cookies are httpOnly and secure

**3. CORS errors**
- Add frontend URL to CORS_ORIGINS
- Check browser console for exact error
- Verify credentials: 'include' in fetch

**4. File upload failures**
- Check AWS credentials
- Verify S3 bucket CORS policy
- Test upload from backend directly

---

## Additional Resources

- [NestJS Production Best Practices](https://docs.nestjs.com/techniques/performance)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Heroku Node.js Deployment](https://devcenter.heroku.com/articles/deploying-nodejs)
- [AWS ECS Tutorial](https://aws.amazon.com/getting-started/hands-on/deploy-docker-containers/)

---

## Maintenance Schedule

- **Daily:** Monitor logs and error rates
- **Weekly:** Review performance metrics
- **Monthly:** Security updates, dependency patches
- **Quarterly:** Database optimization, cost review

---

**Questions?** Create an issue on GitHub or contact support@atlasconcierge.com
