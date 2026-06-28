# SocaSob API Specification

Dokumentasi lengkap API dan Socket.io yang dibutuhkan untuk backend SocaSob.

## Quick Reference

```
Base URL: http://localhost:3001
Socket URL: http://localhost:3001

Authentication: Ready for implementation
CORS: Must include http://localhost:3000
```

## Socket.io Events

### Client Events (Frontend mengirim)

Saat ini frontend belum mengirim event khusus. Siap untuk:
```javascript
socket.emit('start-monitoring', { userId: '...' })
socket.emit('stop-monitoring', { userId: '...' })
socket.emit('robot-connect', { ipAddress: '192.168.1.100' })
```

### Server Events (Backend mengirim ke Frontend)

#### 1. Connection Management
```javascript
// Auto-emitted by Socket.io
'connect'         // Connection established
'disconnect'      // Connection closed
```

#### 2. Real-time Monitoring Events

**Timer Update** (Priority: HIGH)
```javascript
socket.emit('timer-update', {
  hours: number,      // 0-23
  minutes: number,    // 0-59
  seconds: number,    // 0-59
  timestamp: string   // ISO 8601
})
```

**Eye Distance Detection** (Priority: HIGH)
```javascript
socket.emit('eye-distance', {
  distance: 'Dekat' | 'Jauh',  // Dekat: < 30cm, Jauh: >= 30cm
  confidence: number,           // 0-100 (detection confidence)
  timestamp: string             // ISO 8601
})
```

**Eye Status** (Priority: HIGH)
```javascript
socket.emit('eye-status', {
  status: 'normal' | 'risk_myopia' | 'risk_fatigue' | 'disconnected',
  score: number,                // 0-100
  indicators: {
    eyeFatigue: number,         // 0-100
    myopiaRisk: number,         // 0-100
    posureWarning: boolean,     // postural risk
    blinkRate: number           // blinks per minute
  },
  timestamp: string             // ISO 8601
})
```

**Session Events** (Optional)
```javascript
socket.emit('session-started', {
  sessionId: string,
  startTime: string,           // ISO 8601
  deviceId: string,            // ESP32Cam ID
  userId: string               // Optional
})

socket.emit('session-ended', {
  sessionId: string,
  endTime: string,             // ISO 8601
  duration: number,            // seconds
  metrics: {
    closDistanceTime: number,  // minutes tatap dekat
    farDistanceTime: number,   // minutes tatap jauh
    totalBlinks: number,
    averageDistance: number    // cm
  }
})
```

## REST API Endpoints

### Base Path: `/api`

### 1. Monitoring Data

#### GET `/log/today`
**Description**: Fetch today's monitoring data

**Response**:
```json
{
  "date": "2026-01-10",
  "durationsShort": 5,      // minutes tatap dekat
  "durationsLong": 2,       // minutes tatap jauh
  "startTime": "08:00:00",
  "endTime": "17:00:00",
  "totalDuration": 480,     // minutes
  "sessions": [
    {
      "id": "session-1",
      "startTime": "08:00:00",
      "endTime": "09:30:00",
      "closDistance": 45,    // minutes
      "farDistance": 45      // minutes
    }
  ]
}
```

**Status Codes**:
- 200: Success
- 400: Invalid parameters
- 401: Unauthorized
- 500: Server error

---

#### GET `/log/weekly`
**Description**: Fetch last 7 days history

**Query Parameters**:
- `startDate` (optional): YYYY-MM-DD format, defaults to 7 days ago
- `endDate` (optional): YYYY-MM-DD format, defaults to today
- `userId` (optional): Filter by specific user

**Response**:
```json
{
  "data": [
    {
      "date": "2026-01-10",
      "status": "normal" | "risk_myopia" | "risk_fatigue",
      "eyeHealthScore": 84,
      "closDistanceMinutes": 45,
      "farDistanceMinutes": 315,
      "restCompliance": 92,
      "incidents": [
        {
          "type": "long_close_distance",
          "severity": "high",
          "duration": 15,    // minutes
          "timestamp": "2026-01-10T14:30:00Z"
        }
      ]
    }
  ],
  "summary": {
    "averageScore": 82,
    "totalMonitoringHours": 42,
    "averageClosDistance": 42,  // minutes per day
    "averageFarDistance": 318,  // minutes per day
    "bestDay": "2026-01-10",
    "worstDay": "2026-01-05"
  }
}
```

---

#### GET `/log/:date`
**Description**: Fetch specific day's data

**Parameters**:
- `date` (path): YYYY-MM-DD format

**Response**: Same as `/log/today` format

---

### 2. Analytics & Resume

#### GET `/resume`
**Description**: Fetch 6-month summary

**Query Parameters**:
- `months` (optional): Default 6, range 1-12
- `userId` (optional): Filter by specific user

**Response**:
```json
{
  "period": {
    "startDate": "2025-07-10",
    "endDate": "2026-01-10",
    "months": 6
  },
  "metrics": {
    "eyeHealthScore": 84,
    "trend": "improving",        // improving, stable, declining
    "trendValue": "+5"           // change from previous period
  },
  "risks": {
    "myopia": {
      "level": "rendah",         // rendah, sedang, tinggi
      "score": 22,
      "trend": "stable",
      "recommendation": "Pertahankan kebiasaan istirahat mata yang baik"
    },
    "fatigue": {
      "level": "sedang",
      "score": 35,
      "trend": "improving",
      "recommendation": "Tingkatkan istirahat mata, gunakan aturan 20-20-20"
    }
  },
  "metrics": {
    "averageDistance": 57,       // cm
    "averageClosDistance": 45,   // minutes per day
    "averageFarDistance": 315,   // minutes per day
    "totalMonitoringHours": 245,
    "restCompliancePercentage": 89,
    "averageBlinksPerMinute": 18,
    "bestMonths": ["December", "January"],
    "worstMonths": ["September"]
  },
  "distribution": {
    "closDistance": 12.5,        // percentage
    "farDistance": 87.5          // percentage
  },
  "incidents": {
    "total": 8,
    "byType": {
      "longClosDistance": 4,
      "reducedBlinking": 2,
      "postalWarning": 2
    },
    "trend": "decreasing"
  }
}
```

---

### 3. Settings & Preferences

#### GET `/settings`
**Description**: Get user settings

**Response**:
```json
{
  "userId": "user-123",
  "deviceConnection": {
    "ipAddress": "192.168.1.100",
    "isConnected": true,
    "lastConnected": "2026-01-10T10:30:00Z",
    "deviceId": "ESP32CAM-001",
    "firmware": "v1.2.1"
  },
  "audioSettings": {
    "volumeLevel": 70,         // 0-100
    "alertEnabled": true,
    "alertFrequency": "high"   // low, medium, high
  },
  "notificationSettings": {
    "browserNotifications": true,
    "emailAlerts": true,
    "dailyReport": true,
    "reportTime": "09:00"
  },
  "privacy": {
    "dataSharing": false,
    "analyticsTracking": true
  }
}
```

#### POST `/settings`
**Description**: Update user settings

**Request Body**:
```json
{
  "deviceConnection": {
    "ipAddress": "192.168.1.100"
  },
  "audioSettings": {
    "volumeLevel": 75,
    "alertEnabled": true
  },
  "notificationSettings": {
    "browserNotifications": true,
    "emailAlerts": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "updatedFields": ["audioSettings", "notificationSettings"]
}
```

---

### 4. Robot/Device Connection

#### POST `/robot/connect`
**Description**: Test and establish connection with ESP32Cam

**Request Body**:
```json
{
  "ipAddress": "192.168.1.100",
  "port": 8080,          // optional, default 8080
  "userId": "user-123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Connected successfully",
  "device": {
    "id": "ESP32CAM-001",
    "firmware": "v1.2.1",
    "ipAddress": "192.168.1.100",
    "mac": "AA:BB:CC:DD:EE:FF",
    "rssi": -45,              // WiFi signal strength
    "status": "online"
  }
}
```

---

#### GET `/robot/status`
**Description**: Get current robot/device status

**Response**:
```json
{
  "status": "online" | "offline" | "error",
  "device": {
    "id": "ESP32CAM-001",
    "ipAddress": "192.168.1.100",
    "uptime": 3600,           // seconds
    "cpuTemp": 45.5,          // Celsius
    "freeMemory": 2048,       // KB
    "wifiSignal": -45,        // dBm
    "lastUpdate": "2026-01-10T10:45:00Z"
  },
  "camera": {
    "frameRate": 30,          // fps
    "resolution": "320x240",
    "exposureMode": "auto",
    "brightness": 50
  },
  "mlModel": {
    "fps": 25,
    "latency": 40,            // ms
    "accuracy": 0.94          // 0-1
  }
}
```

---

#### GET `/robot/health`
**Description**: Detailed health check

**Response**:
```json
{
  "overall": "healthy" | "degraded" | "critical",
  "checks": {
    "connectivity": {
      "status": "ok",
      "latency": 15           // ms
    },
    "camera": {
      "status": "ok",
      "frameRate": 30
    },
    "ml_inference": {
      "status": "ok",
      "throughput": 25        // fps
    },
    "storage": {
      "status": "ok",
      "freeSpace": 5120       // MB
    }
  }
}
```

---

### 5. Error Responses

**400 Bad Request**:
```json
{
  "error": "Bad Request",
  "message": "Invalid parameters",
  "details": {
    "ipAddress": "Invalid IP address format"
  }
}
```

**401 Unauthorized**:
```json
{
  "error": "Unauthorized",
  "message": "Authentication token required"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal Server Error",
  "message": "Database connection failed",
  "requestId": "req-12345"
}
```

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/log/*` | 100 req/minute |
| `/resume` | 50 req/minute |
| `/settings` | 30 req/minute |
| `/robot/*` | 50 req/minute |

---

## Authentication (Ready for Implementation)

```
Header: Authorization: Bearer <token>
```

---

## CORS Configuration

Required headers:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## WebSocket (Socket.io) Configuration

```javascript
io.engine.generateId = () => { /* ... */ }

io.use((socket, next) => {
  // Authentication middleware
  next()
})

socket.on('disconnect', () => {
  // Cleanup
})
```

---

## Data Types & Enums

### Status Types
```typescript
type EyeStatus = 'normal' | 'risk_myopia' | 'risk_fatigue' | 'disconnected'
type RiskLevel = 'rendah' | 'sedang' | 'tinggi'
type Distance = 'Dekat' | 'Jauh'
```

### Time Zones
- Backend: UTC
- Frontend: User's local timezone

### Date Format
- API requests: `YYYY-MM-DD`
- API responses: ISO 8601 (`2026-01-10T10:30:00Z`)
- Storage: ISO 8601

---

## Example Flow: Session Start

```
1. User opens app
2. Frontend connects Socket.io
   → Server emits 'connect' event
   
3. Backend detects camera
   → Server emits 'eye-distance'
   → Server emits 'eye-status'
   
4. Backend starts timer
   → Every 1 second: 'timer-update'
   → Every frame: 'eye-distance' + 'eye-status'
   
5. Session continues
   → Real-time updates flow continuously
   
6. User closes app/session ends
   → Frontend disconnects
   → Backend logs session data
   → API endpoint returns summary
```

---

## Recommended Implementation Order

1. ✅ Socket.io connection setup
2. ⏳ Emit real-time events (timer, distance, status)
3. ⏳ Implement REST API endpoints
4. ⏳ Add database persistence
5. ⏳ Add authentication
6. ⏳ Implement rate limiting

---

## Testing Checklist

- [ ] Socket.io connection works
- [ ] Timer updates every 1 second
- [ ] Distance detection updates
- [ ] Status changes propagate
- [ ] API endpoints respond correctly
- [ ] Error handling works
- [ ] Rate limiting enforced
- [ ] CORS configured properly
- [ ] Data persistence working
- [ ] Mobile connection stable

---

**API Version**: 1.0.0
**Last Updated**: 2026-01-10
**Status**: Specification Complete, Implementation Pending
