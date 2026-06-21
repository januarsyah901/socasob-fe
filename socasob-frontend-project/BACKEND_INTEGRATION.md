# SocaSob Frontend - Backend Integration Guide

Panduan lengkap untuk mengintegrasikan frontend SocaSob dengan backend Node.js/Express dan Socket.io Anda.

## Overview Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Next.js 16)                      │
├─────────────────────────────────────────────────────────────┤
│  - HomePage: Timer monitoring, eye distance, eye status     │
│  - Log Page: Daily & weekly history                         │
│  - Resume Page: 6-month health summary                      │
│  - Settings Page: Robot connection, volume, notifications   │
└─────────────────────────────────────────────────────────────┘
                            │
                    Socket.io Connection
                            │
┌─────────────────────────────────────────────────────────────┐
│               Backend (Node.js + Express)                    │
├─────────────────────────────────────────────────────────────┤
│  - Socket.io Server for real-time updates                  │
│  - REST API endpoints for data fetching                     │
│  - Python ML integration untuk eye detection & analysis     │
└─────────────────────────────────────────────────────────────┘
```

## Socket.io Events

Frontend mendengarkan event-event berikut dari backend:

### 1. Connection Events
```javascript
'connect'        // Client berhasil terhubung ke server
'disconnect'     // Client kehilangan koneksi dengan server
```

### 2. Real-time Data Events

#### Timer Update
```javascript
// Backend mengirim:
socket.emit('timer-update', {
  hours: 2,
  minutes: 35,
  seconds: 42
})
```

#### Eye Distance Detection
```javascript
// Backend mengirim (dari ESP32Cam ML detection):
socket.emit('eye-distance', {
  distance: 'Dekat'  // atau 'Jauh'
})
```

#### Eye Status
```javascript
// Backend mengirim (hasil analisis):
socket.emit('eye-status', {
  status: 'normal'        // 'normal', 'risk_myopia', 'risk_fatigue', 'disconnected'
})
```

## Environment Variables

Tambahkan ke file `.env.local`:

```env
# Socket.io Server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
# atau untuk production:
# NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
```

## Backend Setup (Example dengan Express + Socket.io)

```javascript
// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Emit real-time updates
  const timerInterval = setInterval(() => {
    // Get data dari database/ML service
    socket.emit('timer-update', {
      hours: 0,
      minutes: 0,
      seconds: 0
    });

    socket.emit('eye-distance', {
      distance: 'Dekat' // atau 'Jauh'
    });

    socket.emit('eye-status', {
      status: 'normal' // atau 'risk_myopia', 'risk_fatigue'
    });
  }, 1000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(timerInterval);
  });
});

// REST API Endpoints
app.get('/api/log/today', (req, res) => {
  // Return today's log data
  res.json({
    date: new Date(),
    durationsShort: 5,  // jam
    durationsLong: 2    // jam
  });
});

app.get('/api/log/weekly', (req, res) => {
  // Return weekly history
  res.json([
    { date: '10 Januari 2026', status: 'normal' },
    // ... more data
  ]);
});

app.get('/api/resume', (req, res) => {
  // Return 6-month summary
  res.json({
    eyeHealthScore: 84,
    myopiaRisk: 'Rendah',
    fatigueRisk: 'Sedang',
    averageDistance: 57,
    restCompliance: 89,
    totalHours: 245
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Frontend Socket.io Context Usage

Komponenn sudah menggunakan `useSocket()` hook:

```typescript
import { useSocket } from '@/lib/socket-context'

export function MyComponent() {
  const { socket, isConnected, timer, eyeDistance, eyeStatus } = useSocket()
  
  // Use real-time data
}
```

## Data Fetching untuk Log dan Resume

Frontend saat ini menggunakan mock data. Untuk mengintegrasikan dengan API:

### Update Log Page (`app/log/page.tsx`)
```typescript
// Ubah dari mock data menjadi API call:
const response = await fetch('/api/log/weekly')
const weeklyHistory = await response.json()
```

### Update Resume Page (`app/resume/page.tsx`)
```typescript
// Fetch summary data dari API:
const response = await fetch('/api/resume')
const resumeData = await response.json()
```

## Settings Integration

Settings page sudah menyimpan ke localStorage. Untuk backend integration:

```typescript
// Dalam app/settings/page.tsx
const saveSettings = async () => {
  await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ipAddress, volume, notificationsEnabled })
  })
}
```

## Mobile Responsiveness

Frontend sudah fully responsive dengan:
- Mobile hamburger menu (sidebar kolaps pada layar kecil)
- Flexible grid layouts
- Touch-friendly button sizes
- Scroll behavior yang baik

## TypeScript Types untuk Backend Response

```typescript
// types/api.ts
export interface DailyLog {
  date: string
  durationsShort: number
  durationsLong: number
}

export interface WeeklyHistory {
  date: string
  status: 'normal' | 'risk_myopia' | 'risk_fatigue'
}

export interface ResumeData {
  eyeHealthScore: number
  myopiaRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  fatigueRisk: 'Rendah' | 'Sedang' | 'Tinggi'
  averageDistance: number
  restCompliance: number
  totalHours: number
}

export interface SocketMessage {
  timer?: { hours: number; minutes: number; seconds: number }
  eyeDistance?: string
  eyeStatus?: 'normal' | 'risk_myopia' | 'risk_fatigue' | 'disconnected'
}
```

## Next Steps

1. Setup backend server dengan Socket.io sesuai contoh di atas
2. Update `NEXT_PUBLIC_SOCKET_URL` di `.env.local`
3. Implement REST API endpoints untuk `/api/log/*` dan `/api/resume`
4. Update `app/log/page.tsx` dan `app/resume/page.tsx` untuk fetch data real
5. Test Socket.io connection dengan browser DevTools
6. Deploy ke Vercel atau hosting pilihan Anda

## Testing Socket.io Connection

Buka browser console dan test:

```javascript
// Dari socket context yang sudah di-initialize
const { isConnected } = useSocket()
console.log('Socket connected:', isConnected)
```

## Notes

- Socket.io URL dapat dikonfigurasi via environment variable
- Frontend menggunakan `socket.io-client` v4.8.3
- Semua komponen sudah menggunakan Client-side rendering (`'use client'`)
- Mock data akan otomatis diganti saat API terintegrasi
