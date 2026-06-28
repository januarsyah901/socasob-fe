# SocaSob Frontend - Deployment Checklist

Panduan lengkap untuk deployment SocaSob Frontend ke production.

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript types are properly defined
- [ ] No console.log() statements left for debugging
- [ ] No hardcoded API URLs (use environment variables)
- [ ] All components have proper error handling
- [ ] No security vulnerabilities in dependencies

### Testing
- [ ] Homepage loads without errors
- [ ] Navigation works on all pages
- [ ] Log page displays data correctly
- [ ] Resume page shows all metrics
- [ ] Settings page saves/loads properly
- [ ] Responsive design tested on mobile
- [ ] Responsive design tested on tablet
- [ ] Responsive design tested on desktop

### Performance
- [ ] Build completes successfully
- [ ] Bundle size is optimized
- [ ] No unused dependencies
- [ ] Images are optimized
- [ ] CSS is minified
- [ ] JavaScript is minified

### Browser Testing
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile (Android)

### Socket.io Testing
- [ ] Socket.io connection establishes
- [ ] Reconnection logic works
- [ ] Events are properly received
- [ ] No memory leaks on disconnect
- [ ] Handles network failures gracefully

## Backend Integration Checklist

### API Endpoints
- [ ] `/api/log/today` endpoint ready
- [ ] `/api/log/weekly` endpoint ready
- [ ] `/api/resume` endpoint ready
- [ ] `/api/settings` POST endpoint ready
- [ ] `/api/robot/connect` endpoint ready
- [ ] `/api/robot/status` endpoint ready
- [ ] Error responses properly formatted
- [ ] Rate limiting implemented

### Socket.io Events
- [ ] Backend emits `timer-update` every second
- [ ] Backend emits `eye-distance` on detection
- [ ] Backend emits `eye-status` on status change
- [ ] Event data structure matches specification
- [ ] CORS properly configured
- [ ] Connection/disconnection handling

### Database
- [ ] Schema created for monitoring data
- [ ] Historical data stored correctly
- [ ] Settings persistence working
- [ ] Data cleanup/archival policy set

## Environment Configuration

### Development
- [ ] `.env.local` created from `.env.example`
- [ ] `NEXT_PUBLIC_SOCKET_URL` = `http://localhost:3001`
- [ ] All tests passing

### Staging
- [ ] Staging environment set up
- [ ] `NEXT_PUBLIC_SOCKET_URL` = staging backend URL
- [ ] Backend integrated
- [ ] End-to-end testing completed
- [ ] Performance testing done
- [ ] Security review completed

### Production
- [ ] Production environment configured
- [ ] `NEXT_PUBLIC_SOCKET_URL` = production backend URL
- [ ] HTTPS enabled for Socket.io
- [ ] CORS whitelist properly configured
- [ ] Rate limiting configured
- [ ] Error monitoring (Sentry/LogRocket) configured
- [ ] Analytics configured
- [ ] Backup strategy in place

## Security Checklist

### Code Security
- [ ] No API keys hardcoded
- [ ] No credentials in version control
- [ ] Dependencies scanned for vulnerabilities
  ```bash
  npm audit
  ```
- [ ] No sensitive data in localStorage beyond user settings
- [ ] Input validation implemented
- [ ] XSS protection measures in place

### Network Security
- [ ] HTTPS enforced for production
- [ ] CORS configured correctly
- [ ] CSP headers set
- [ ] X-Frame-Options header set
- [ ] X-Content-Type-Options header set
- [ ] Referrer-Policy header set

### Data Security
- [ ] User data encrypted in transit
- [ ] Sensitive data not logged
- [ ] Settings only stored in localStorage (not sensitive data)
- [ ] Socket.io authentication ready
- [ ] Rate limiting implemented

## Deployment Steps

### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Configure project (first time only)
vercel link

# 4. Set environment variables
vercel env add NEXT_PUBLIC_SOCKET_URL
# Enter: https://api.socasob.com (or your backend URL)

# 5. Deploy to production
vercel --prod
```

#### Vercel Configuration
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "startCommand": "pnpm start",
  "env": {
    "NEXT_PUBLIC_SOCKET_URL": "@socasob_socket_url"
  }
}
```

### Option 2: Docker

```bash
# 1. Build image
docker build -t socasob-frontend:latest .

# 2. Tag image
docker tag socasob-frontend:latest your-registry/socasob-frontend:latest

# 3. Push to registry
docker push your-registry/socasob-frontend:latest

# 4. Deploy (example with Docker Compose)
docker-compose up -d
```

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm install -g pnpm
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### Option 3: Traditional Node Host (AWS EC2, DigitalOcean, etc.)

```bash
# 1. Clone repository
git clone <your-repo>
cd socasob-frontend

# 2. Install dependencies
pnpm install

# 3. Build application
pnpm build

# 4. Set environment variables
echo "NEXT_PUBLIC_SOCKET_URL=https://api.socasob.com" > .env.production.local

# 5. Start application
pnpm start

# 6. Setup reverse proxy (nginx)
# Configure nginx to forward to http://localhost:3000
```

**Nginx Configuration** (example):
```nginx
upstream socasob {
  server localhost:3000;
}

server {
  listen 80;
  server_name socasob.com;
  
  # Redirect to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name socasob.com;
  
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  # Security headers
  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-XSS-Protection "1; mode=block" always;
  
  location / {
    proxy_pass http://socasob;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
  
  # Socket.io configuration
  location /socket.io {
    proxy_pass http://socasob/socket.io;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Post-Deployment Checklist

### Functionality Testing
- [ ] Homepage loads without errors
- [ ] Navigation works correctly
- [ ] Timer updates in real-time
- [ ] Socket.io connection established
- [ ] All pages accessible
- [ ] Settings can be saved
- [ ] Data displays correctly

### Performance Monitoring
- [ ] Lighthouse score > 85
- [ ] Core Web Vitals within acceptable range
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] No 404 or 500 errors
- [ ] Build time < 5 minutes

### User Experience
- [ ] Responsive design working
- [ ] Mobile experience smooth
- [ ] No layout shifts
- [ ] Animations smooth
- [ ] Loading states visible

### Monitoring & Alerts
- [ ] Error tracking configured
- [ ] Uptime monitoring active
- [ ] Performance alerts set
- [ ] Slack notifications enabled
- [ ] Dashboard accessible

## Rollback Plan

If deployment fails:

```bash
# Option 1: Vercel (Automatic)
# Previous deployment automatically available

# Option 2: Manual rollback
git revert <commit-hash>
pnpm build
pnpm start

# Option 3: Docker
docker rm -f socasob-frontend
docker run -d socasob-frontend:previous-tag
```

## Maintenance Schedule

### Daily
- [ ] Monitor error logs
- [ ] Check uptime status
- [ ] Verify Socket.io connections

### Weekly
- [ ] Review performance metrics
- [ ] Check user feedback
- [ ] Update dependencies (if needed)
- [ ] Backup data

### Monthly
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Version update check
- [ ] Capacity planning

## Troubleshooting After Deployment

### Socket.io Not Connecting
```bash
# Check backend is running
curl http://localhost:3001

# Check CORS headers
curl -H "Origin: https://socasob.com" http://api.socasob.com -v

# Check environment variable
echo $NEXT_PUBLIC_SOCKET_URL
```

### Performance Issues
```bash
# Check bundle size
pnpm build && du -sh .next

# Analyze bundle
npm run analyze
```

### High Memory Usage
```bash
# Check for memory leaks
# Monitor with: top, htop, or Node.js profiler
pm2 monit
```

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build           # Build for production
pnpm start           # Start production server
pnpm lint            # Run linter

# Deployment
vercel deploy        # Deploy to preview
vercel --prod        # Deploy to production
docker build .       # Build Docker image
docker run ...       # Run Docker container

# Monitoring
npm audit            # Check vulnerabilities
npm outdated         # Check outdated packages
pnpm why             # Check dependency tree
```

## Success Criteria

Your deployment is successful when:

✅ **Functionality**
- All pages load without errors
- Socket.io connects successfully
- Real-time data updates working
- Navigation works smoothly

✅ **Performance**
- Page load time < 3 seconds
- Core Web Vitals green
- No JavaScript errors

✅ **Reliability**
- Uptime > 99.9%
- No 5xx errors
- Graceful error handling

✅ **Security**
- HTTPS enabled
- CORS properly configured
- No security vulnerabilities

✅ **User Experience**
- Responsive on all devices
- Smooth animations
- Clear loading states

## Contact & Support

- **Deployment Issues**: Check logs with `vercel logs`
- **Performance Issues**: Use Chrome DevTools
- **Socket.io Issues**: Check browser console
- **General Questions**: See README.md

---

**Deployment Checklist Version**: 1.0.0
**Last Updated**: 2026-01-10
**Estimated Deployment Time**: 15-30 minutes
