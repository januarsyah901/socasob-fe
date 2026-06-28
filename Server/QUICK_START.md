# SocaSob Frontend - Quick Start Guide

## 30 Detik untuk Mulai

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Edit .env.local dengan backend URL Anda
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# 4. Run development server
pnpm dev

# 5. Open http://localhost:3000
```

## File Penting

| File | Fungsi |
|------|--------|
| `app/page.tsx` | Homepage - Real-time monitoring |
| `app/log/page.tsx` | Log - Historical data |
| `app/resume/page.tsx` | Resume - 6-month summary |
| `app/settings/page.tsx` | Settings - Configuration |
| `lib/socket-context.tsx` | Socket.io provider |
| `components/` | Reusable components |

## Pages Overview

### 🏠 Homepage (`/`)
- Timer countdown (real-time)
- Eye distance detection
- Eye health status
- Greeting message

### 📋 Log (`/log`)
- Today's monitoring summary
- Last 7 days history
- Expandable sections

### 📊 Resume (`/resume`)
- 6-month health score: 84
- Miopia risk: Rendah
- Fatigue risk: Sedang
- Distribution chart

### ⚙️ Settings (`/settings`)
- Robot connection (IP address)
- Volume control
- Notification toggle
- localStorage persistence

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time
- **TypeScript** - Type safety

## Commands

```bash
pnpm dev        # Start development
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run linter
```

## Structure

```
app/
├── page.tsx           # Homepage
├── log/page.tsx       # Log
├── resume/page.tsx    # Resume
├── settings/page.tsx  # Settings
└── layout.tsx         # Root layout

components/
├── dashboard-layout.tsx  # Main layout
├── timer-display.tsx     # Timer
└── eye-metrics.tsx       # Metrics

lib/
├── socket-context.tsx    # Socket.io
└── utils.ts              # Helpers
```

## Socket.io Events

Backend emits:
```
'timer-update'    → Timer countdown
'eye-distance'    → Distance (Dekat/Jauh)
'eye-status'      → Status (Normal/Risk)
```

## Environment

Edit `.env.local`:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

For production:
```
NEXT_PUBLIC_SOCKET_URL=https://api.socasob.com
```

## Development Tips

1. **Hot Reload**: Changes auto-refresh
2. **DevTools**: Use browser console
3. **Socket.io Debug**: Check Network tab
4. **Responsive**: Resize browser to test

## Next: Backend Integration

See `BACKEND_INTEGRATION.md` for:
- Socket.io setup
- REST API endpoints
- Example Express server
- Integration checklist

## Deployment

### Vercel (Easiest)
```bash
vercel deploy
vercel --prod
```

### Docker
```bash
docker build -t socasob .
docker run -p 3000:3000 socasob
```

### Traditional Node
```bash
pnpm install
pnpm build
pnpm start
```

## Common Issues

**Socket.io not connecting?**
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
- Verify backend is running
- Check browser console for errors

**Build fails?**
```bash
pnpm install
pnpm build
```

**Port 3000 already in use?**
```bash
pnpm dev -- -p 3001
```

## Documentation Files

- **README.md** - Full documentation
- **BACKEND_INTEGRATION.md** - Backend setup guide
- **API_SPECIFICATION.md** - API reference
- **DEPLOYMENT_CHECKLIST.md** - Deployment guide
- **PROJECT_SUMMARY.md** - Project overview

## Support

- Check README.md for detailed docs
- See BACKEND_INTEGRATION.md for API details
- Review console logs for errors
- Check browser DevTools (F12)

---

**Ready to develop!** 🚀

Start with: `pnpm dev`
