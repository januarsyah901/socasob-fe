# SocaSob Frontend

Aplikasi monitoring kesehatan mata yang intelligent dengan real-time data streaming menggunakan Socket.io. Built dengan Next.js 13, React 18, dan Tailwind CSS 3.

---

### 🌐 Live Production Deployment
- **URL Publik**: [socasob.hallojanu.xyz](https://socasob.hallojanu.xyz) (Status: 🟢 200 OK)
- **Backend Connected**: [be-socasob.hallojanu.xyz](https://be-socasob.hallojanu.xyz)
- **ML Vision Pipeline**: [socasob-ml.hallojanu.xyz](https://socasob-ml.hallojanu.xyz)

---

## Features

### 🏠 Homepage
- **Real-time Timer**: Menampilkan durasi monitoring dengan countdown yang update real-time
- **Eye Distance Detection**: Status jarak mata dari kamera (Dekat/Jauh) dari hasil deteksi ML
- **Eye Health Status**: Monitoring status mata real-time (Normal/Risiko Miopia/Kelelahan)
- **Greeting Message**: Pesan personal untuk user

### 📋 Log Page
- **Daily Monitoring**: Durasi tatap dekat dan jauh hari ini
- **Weekly History**: Riwayat 7 hari terakhir dengan status deteksi
- **Expandable Sections**: Toggle untuk melihat detail harian dan mingguan
- **Status Indicators**: Visual indicators untuk Normal/Risiko Mata Lelah/Kelelahan Mata

### 📊 Resume Page
- **6-Month Summary**: Ringkasan 6 bulan terakhir
- **Eye Health Score**: Skor kesehatan mata (0-100)
- **Risk Analysis**:
  - Risiko Miopia (Low/Medium/High)
  - Risiko Ketidakamanan Mata (Safe/Medium/Unsafe)
- **Metrics**:
  - Rata-rata jarak mata
  - Kepatuhan istirahat
  - Total jam monitoring
- **Distribution Chart**: Grafik persentase tatap dekat vs jauh

### ⚙️ Settings
- **Robot Connection**: Manage koneksi dengan ESP32Cam via IP address
- **Sound Control**: Volume suara untuk alert/notifikasi
- **Browser Notifications**: Toggle notifikasi browser
- **Settings Persistence**: Auto-save ke localStorage

### 🧭 Navigation
- **Responsive Sidebar**: Desktop sidebar, mobile hamburger menu
- **Active State Indicator**: Highlight halaman aktif
- **Smooth Transitions**: Transisi halus antar halaman
- **Mobile Optimized**: Full mobile responsiveness

## Tech Stack

- **Frontend Framework**: Next.js 13 (App Router)
- **React Version**: React 18
- **Styling**: Tailwind CSS 3.4
- **Real-time Communication**: Socket.io Client 4.8.3
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
socasob-frontend/
├── app/
│   ├── layout.tsx              # Root layout dengan Socket provider
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles
│   ├── log/
│   │   └── page.tsx            # Log page
│   ├── resume/
│   │   └── page.tsx            # Resume page
│   └── settings/
│       └── page.tsx            # Settings page
├── components/
│   ├── dashboard-layout.tsx     # Main layout dengan sidebar
│   ├── timer-display.tsx        # Timer component
│   └── eye-metrics.tsx          # Eye distance & status display
├── lib/
│   ├── socket-context.tsx       # Socket.io context provider
│   └── utils.ts                 # Utility functions
├── public/                      # Static files
├── BACKEND_INTEGRATION.md       # Backend integration guide
└── .env.example                 # Environment variables example
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm (recommended) atau pnpm/yarn

### Installation

1. Clone repository
```bash
git clone <repo-url>
cd socasob-frontend
```

2. Install dependencies
```bash
npm install
```

3. Setup environment
```bash
cp .env.example .env.local
# Edit .env.local dengan Socket.io URL backend Anda
```

4. Run development server
```bash
npm run dev
```

5. Open browser
```
http://localhost:3000
```

### Environment Variables

Buat file `.env.local` dengan:

```env
# Socket.io Server URL (development)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Atau untuk production:
# NEXT_PUBLIC_SOCKET_URL=https://api.socasob.com
```

## Development

### Start Dev Server
```bash
npm run dev
# Atau jika mengalami OpenSSL error pada versi Node.js tertentu:
npm run dev:legacy
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## Backend Integration

Untuk integrasi penuh dengan backend Node.js/Express Anda, lihat [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)

### Socket.io Events yang Didengarkan

**Real-time Updates:**
- `timer-update`: Timer countdown update
- `eye-distance`: Eye distance detection (Dekat/Jauh)
- `eye-status`: Eye health status (Normal/Risk)

**Connection:**
- `connect`: Client berhasil terhubung
- `disconnect`: Client kehilangan koneksi

### API Endpoints yang Diperlukan

Frontend sudah siap menerima data dari endpoints:
- `GET /api/log/today` - Daily log data
- `GET /api/log/weekly` - Weekly history
- `GET /api/resume` - 6-month summary
- `POST /api/settings` - Save user settings

## Data Flow

```
Socket.io (Real-time)
├── Timer updates (1 detik sekali)
├── Eye distance (real-time dari camera)
└── Eye status (real-time dari ML analysis)

REST API (On-demand)
├── Historical data (logs, resume)
├── User settings
└── Analytics data
```

## Component Hierarchy

```
Layout (app/layout.tsx)
└── SocketProvider
    └── DashboardLayout
        ├── Sidebar Navigation
        └── Page Routes
            ├── HomePage
            │   ├── TimerDisplay
            │   └── EyeMetrics
            ├── LogPage
            ├── ResumePage
            └── SettingsPage
```

## Responsive Design

- **Mobile** (< 640px): Hamburger menu, single column
- **Tablet** (640px - 1024px): Responsive grid
- **Desktop** (> 1024px): Fixed sidebar, full layout

## Color System

**Primary Colors:**
- Blue: #3B82F6
- Cyan: #06B6D4
- Green: #10B981
- Yellow: #FBBF24
- Orange: #F97316
- Red: #EF4444
- Purple: #A855F7

**Neutrals:**
- Light: #F8FAFC
- Gray: #6B7280
- Dark: #1F2937 / #0F172A

## Performance

- **Lighthouse Score**: Target 90+
- **Hydration**: Fast client-side hydration
- **Bundle Size**: Optimized dengan Next.js
- **Real-time**: Low-latency Socket.io updates

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Self-hosted (Docker example)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Socket.io Connection Issues
1. Verify `NEXT_PUBLIC_SOCKET_URL` di `.env.local`
2. Pastikan backend Socket.io server running
3. Check CORS settings di backend
4. Check browser console untuk error messages

### Data Not Updating
1. Verify Socket.io adalah terhubung (check browser DevTools)
2. Verify backend mengirim correct event names
3. Check console logs untuk emission status

### Styling Issues
1. Ensure Tailwind CSS compiled properly
2. Clear Next.js cache: `rm -rf .next`
3. Restart dev server

## Contributing

Kontribusi sangat disambut baik! Mohon:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push ke branch
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

- Dokumentasi: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
- Issues: GitHub Issues
- Discussions: GitHub Discussions

## Roadmap

- [ ] Data persistence ke database
- [ ] User authentication & profiles
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Dark mode improvements
- [ ] Offline support (PWA)
- [ ] Multi-language support
- [ ] Export data functionality

## Changelog

### v1.0.0 (2026-01-10)
- Initial release
- Homepage dengan real-time timer
- Log page dengan daily/weekly history
- Resume page dengan 6-month summary
- Settings page untuk device connection
- Responsive design dengan Tailwind CSS
- Socket.io integration ready

---

Built with ❤️ by the SocaSob Team
