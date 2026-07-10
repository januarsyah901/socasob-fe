# Panduan Langkah demi Langkah Pembuatan Backend - SocaSob

Panduan ini menjelaskan langkah demi langkah untuk membangun seluruh infrastruktur backend sistem monitoring kesehatan mata **SocaSob**. Backend ini bertugas menerima video stream dari ESP32-CAM, memprosesnya menggunakan Machine Learning di Python untuk mendeteksi jarak mata, menyimpan data ke database, dan mengalirkan data real-time ke Next.js frontend menggunakan WebSockets.

---

## 🏗️ Gambaran Alur Data Sistem

1. **ESP32-CAM** mengambil gambar dan menyediakannya sebagai HTTP Video Stream (MJPEG).
2. **Python ML Script** mengambil frame video dari stream ESP32-CAM, mendeteksi jarak mata dengan **MediaPipe**, dan mengirimkan metrik jarak ke Node.js Backend secara real-time via WebSockets (Socket.io-client).
3. **Node.js Backend** memproses status kesehatan mata, memperbarui timer durasi, menyimpan data log ke **MongoDB**, dan memancarkan data tersebut ke **Next.js Frontend**.

---

## 📂 Struktur Folder Rekomendasi
Anda dapat memisahkan folder backend dan ML pipeline agar lebih rapi:
```text
socasob-backend/
├── backend-server/          # Node.js + Socket.io + Database
│   ├── package.json
│   ├── .env
│   ├── server.js
│   └── models/
│       ├── DailyLog.js
│       └── Settings.js
├── ml-pipeline/             # Python + MediaPipe + OpenCV
│   ├── requirements.txt
│   └── tracker.py
└── esp32cam-firmware/       # Arduino IDE Sketch
    └── esp32cam-firmware.ino
```

---

## 🚀 Langkah 1: Membangun Node.js Backend Server

Langkah pertama adalah membuat server hub yang bertindak sebagai jembatan komunikasi REST API dan WebSocket.

### 1. Inisialisasi Proyek Node.js
Buka terminal baru, buat direktori, dan install library yang dibutuhkan:
```bash
mkdir backend-server
cd backend-server
npm init -y
npm install express socket.io mongoose cors dotenv
npm install --save-dev nodemon
```

### 2. Konfigurasi Environment Variables (`.env`)
Buat file `.env` di dalam folder `backend-server`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/socasob
CLIENT_URL=http://localhost:3000
```

### 3. Membuat Model Database dengan Mongoose (`models/DailyLog.js`)
Buat folder `models` dan buat file `DailyLog.js` untuk menyimpan riwayat monitoring harian:
```javascript
const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
  durationsShort: { type: Number, default: 0 },         // Durasi tatap dekat (menit)
  durationsLong: { type: Number, default: 0 },          // Durasi tatap jauh (menit)
  eyeHealthScore: { type: Number, default: 100 },       // Skor 0-100
  myopiaRisk: { type: String, enum: ['Rendah', 'Sedang', 'Tinggi'], default: 'Rendah' },
  fatigueRisk: { type: String, enum: ['Rendah', 'Sedang', 'Tinggi'], default: 'Rendah' },
  averageDistance: { type: Number, default: 0 },        // Jarak rata-rata (cm)
  restCompliance: { type: Number, default: 100 },       // Kepatuhan istirahat (%)
  totalHours: { type: Number, default: 0 }              // Total jam penggunaan hari ini
}, { timestamps: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);
```

### 4. Membuat File Server Utama (`server.js`)
Tulis logika Socket.io untuk mendengarkan data dari program Python, menghitung timer, dan menyediakan REST API untuk frontend.

```javascript
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const DailyLog = require('./models/DailyLog');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Hubungkan ke MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Database terhubung ke MongoDB'))
  .catch(err => console.error('Gagal terhubung database:', err));

// Logika Monitoring Real-Time & Socket.io
let isMonitoring = false;
let monitorSeconds = 0;
let lastDistance = 'Jauh';
let shortDistanceSeconds = 0;
let longDistanceSeconds = 0;
let blinkCount = 0;

// Update status monitoring kelelahan secara dinamis
function calculateEyeStatus() {
  const total = shortDistanceSeconds + longDistanceSeconds;
  if (total === 0) return 'normal';
  
  const shortRatio = shortDistanceSeconds / total;
  if (shortRatio > 0.6) return 'risk_myopia'; // > 60% waktu di jarak dekat
  if (total > 3600 && shortRatio > 0.4) return 'risk_fatigue'; // Kelelahan setelah 1 jam
  return 'normal';
}

io.on('connection', (socket) => {
  console.log('Koneksi baru terbentuk:', socket.id);

  // Menerima data deteksi jarak mata dari pipeline Python
  socket.on('py-eye-detection', (data) => {
    // payload: { distance: 'Dekat' | 'Jauh', confidence: 95.0 }
    lastDistance = data.distance;

    // Pancarkan langsung ke frontend
    io.emit('eye-distance', {
      distance: data.distance,
      confidence: data.confidence,
      timestamp: new Date().toISOString()
    });
  });

  // Menerima data kedipan dari Python (Opsional)
  socket.on('py-blink-detected', () => {
    blinkCount++;
  });

  socket.on('disconnect', () => {
    console.log('Koneksi terputus:', socket.id);
  });
});

// Simulasi timer monitoring berjalan setiap 1 detik
setInterval(async () => {
  // Hanya jalankan jika ada client terhubung (monitoring aktif)
  const connectedClients = io.sockets.sockets.size;
  if (connectedClients > 1) { // 1 Client frontend + 1 Python script
    monitorSeconds++;
    
    if (lastDistance === 'Dekat') {
      shortDistanceSeconds++;
    } else {
      longDistanceSeconds++;
    }

    const hrs = Math.floor(monitorSeconds / 3600);
    const mins = Math.floor((monitorSeconds % 3600) / 60);
    const secs = monitorSeconds % 60;

    // 1. Pancarkan timer-update ke frontend
    io.emit('timer-update', {
      hours: hrs,
      minutes: mins,
      seconds: secs,
      timestamp: new Date().toISOString()
    });

    // 2. Pancarkan status mata ke frontend
    const currentStatus = calculateEyeStatus();
    io.emit('eye-status', {
      status: currentStatus,
      score: Math.max(100 - Math.floor((shortDistanceSeconds / monitorSeconds) * 40), 50),
      indicators: {
        eyeFatigue: Math.floor((shortDistanceSeconds / monitorSeconds) * 100),
        myopiaRisk: lastDistance === 'Dekat' ? 80 : 20,
        posureWarning: lastDistance === 'Dekat',
        blinkRate: Math.round((blinkCount / (monitorSeconds / 60)) || 15)
      },
      timestamp: new Date().toISOString()
    });

    // Simpan otomatis ke DB setiap 1 menit (autosave ke database)
    if (monitorSeconds % 60 === 0) {
      await saveLogToDatabase();
    }
  }
}, 1000);

async function saveLogToDatabase() {
  const today = new Date().toISOString().split('T')[0];
  const shortMins = Math.round(shortDistanceSeconds / 60);
  const longMins = Math.round(longDistanceSeconds / 60);
  
  const status = calculateEyeStatus();
  let myopiaRisk = 'Rendah';
  let fatigueRisk = 'Rendah';
  if (status === 'risk_myopia') myopiaRisk = 'Tinggi';
  if (status === 'risk_fatigue') fatigueRisk = 'Sedang';

  const healthScore = Math.max(100 - Math.floor((shortDistanceSeconds / monitorSeconds) * 35), 60);

  try {
    await DailyLog.findOneAndUpdate(
      { date: today },
      {
        $set: {
          durationsShort: shortMins,
          durationsLong: longMins,
          eyeHealthScore: healthScore,
          myopiaRisk,
          fatigueRisk,
          averageDistance: lastDistance === 'Dekat' ? 25 : 55,
          totalHours: Number(((shortDistanceSeconds + longDistanceSeconds) / 3600).toFixed(2))
        }
      },
      { upsert: true, new: true }
    );
    console.log(`Log harian berhasil diperbarui di DB untuk tanggal ${today}`);
  } catch (error) {
    console.error('Gagal menyimpan log harian ke database:', error);
  }
}

// REST API Endpoints untuk Frontend
app.get('/api/log/today', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    let log = await DailyLog.findOne({ date: today });
    if (!log) {
      log = { date: today, durationsShort: 0, durationsLong: 0 };
    }
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/log/weekly', async (req, res) => {
  try {
    const logs = await DailyLog.find().sort({ date: -1 }).limit(7);
    const formatted = logs.map(l => ({
      date: new Date(l.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: l.eyeHealthScore >= 80 ? 'normal' : (l.myopiaRisk === 'Tinggi' ? 'risk_myopia' : 'risk_fatigue')
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resume', async (req, res) => {
  try {
    const logs = await DailyLog.find();
    if (logs.length === 0) {
      return res.json({
        eyeHealthScore: 100,
        myopiaRisk: 'Rendah',
        fatigueRisk: 'Rendah',
        averageDistance: 50,
        restCompliance: 100,
        totalHours: 0,
        distribution: { closDistance: 0, farDistance: 100 }
      });
    }

    const totalLogs = logs.length;
    const avgScore = Math.round(logs.reduce((acc, curr) => acc + curr.eyeHealthScore, 0) / totalLogs);
    const avgDistance = Math.round(logs.reduce((acc, curr) => acc + curr.averageDistance, 0) / totalLogs);
    const totalHrs = logs.reduce((acc, curr) => acc + curr.totalHours, 0);
    
    const sumShort = logs.reduce((acc, curr) => acc + curr.durationsShort, 0);
    const sumLong = logs.reduce((acc, curr) => acc + curr.durationsLong, 0);
    const totalDuration = sumShort + sumLong;
    const closPercentage = totalDuration > 0 ? Math.round((sumShort / totalDuration) * 100) : 30;

    res.json({
      eyeHealthScore: avgScore,
      myopiaRisk: avgScore >= 85 ? 'Rendah' : (avgScore >= 70 ? 'Sedang' : 'Tinggi'),
      fatigueRisk: sumShort > sumLong ? 'Sedang' : 'Rendah',
      averageDistance: avgDistance || 45,
      restCompliance: 85,
      totalHours: Number(totalHrs.toFixed(1)),
      distribution: {
        closDistance: closPercentage,
        farDistance: 100 - closPercentage
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Jalankan Server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server Backend SocaSob berjalan di http://localhost:${PORT}`);
});
```

---

## ⚡ Langkah 2: Pembuatan Firmware ESP32-CAM

ESP32-CAM akan bertindak sebagai server kamera nirkabel yang menyediakan stream video HTTP MJPEG.

### 1. Persiapan Alat
* Papan ESP32-CAM (misal: AI-Thinker).
* FTDI Programmer (USB to TTL) untuk memprogram ESP32-CAM.
* Arduino IDE (pastikan sudah terpasang Board manager ESP32).

### 2. Kode Arduino (`esp32cam-firmware.ino`)
Buat sketch baru di Arduino IDE, ganti SSID dan Password Wi-Fi Anda:

```cpp
#include "esp_camera.h"
#include <WiFi.h>
#include "esp_timer.h"
#include "img_converters.h"
#include "fb_gfx.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

// Konfigurasi Pin model kamera AI-THINKER
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";

void startCameraServer();

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWNOUT_REG, 0); // Matikan deteksi Brownout
  Serial.begin(115200);
  
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  if(psramFound()){
    config.frame_size = FRAMESIZE_VGA; // Resolusi 640x480
    config.jpeg_quality = 12;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Inisialisasi kamera gagal dengan error 0x%x", err);
    return;
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Wi-Fi Terhubung.");
  
  startCameraServer();

  Serial.print("Stream URL: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/stream");
}

#include "esp_http_server.h"
typedef struct {
        httpd_req_t *req;
        size_t len;
} jpg_chunking_t;

static size_t jpg_encode_stream(void * arg, size_t index, const void* data, size_t len){
    jpg_chunking_t *j = (jpg_chunking_t *)arg;
    if(!index){
        j->len = 0;
    }
    if(httpd_resp_send_chunk(j->req, (const char *)data, len) != ESP_OK){
        return 0;
    }
    j->len += len;
    return len;
}

static esp_err_t stream_handler(httpd_req_t *req){
    camera_fb_t * fb = NULL;
    esp_err_t res = ESP_OK;
    size_t _jpg_buf_len = 0;
    uint8_t * _jpg_buf = NULL;
    char * part_buf[64];

    res = httpd_resp_set_type(req, "multipart/x-mixed-replace;boundary=123456789000000000000987654321");
    if(res != ESP_OK){
        return res;
    }

    while(true){
        fb = esp_camera_fb_get();
        if (!fb) {
            Serial.println("Gagal mengambil frame kamera");
            res = ESP_FAIL;
        } else {
            if(fb->format != PIXFORMAT_JPEG){
                bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
                esp_camera_fb_return(fb);
                fb = NULL;
                if(!jpeg_converted){
                    Serial.println("Konversi JPEG gagal");
                    res = ESP_FAIL;
                }
            } else {
                _jpg_buf_len = fb->len;
                _jpg_buf = fb->buf;
            }
        }
        if(res == ESP_OK){
            size_t hlen = snprintf((char *)part_buf, 64, "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n", _jpg_buf_len);
            res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
        }
        if(res == ESP_OK){
            res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
        }
        if(res == ESP_OK){
            res = httpd_resp_send_chunk(req, "\r\n--123456789000000000000987654321\r\n", 37);
        }
        if(fb){
            esp_camera_fb_return(fb);
            fb = NULL;
            _jpg_buf = NULL;
        } else if(_jpg_buf){
            free(_jpg_buf);
            _jpg_buf = NULL;
        }
        if(res != ESP_OK){
            break;
        }
    }
    return res;
}

void startCameraServer(){
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.server_port = 80;

    httpd_uri_t stream_uri = {
        .uri       = "/stream",
        .method    = HTTP_GET,
        .handler   = stream_handler,
        .user_ctx  = NULL
    };
    
    if (httpd_start(&camera_httpd, &config) == ESP_OK) {
        httpd_register_uri_handler(camera_httpd, &stream_uri);
    }
}
```

---

## 🧠 Langkah 3: Membuat Pipeline Machine Learning (Python)

Script Python ini akan mengambil stream MJPEG dari ESP32-CAM, mendeteksi wajah dengan **MediaPipe Face Mesh**, dan menghitung jarak mata berdasarkan kalibrasi piksel pupil.

### 1. Instalasi Library di Python
Buat virtual environment Python dan pasang pustaka berikut:
```bash
mkdir ml-pipeline
cd ml-pipeline
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Linux/Mac
pip install opencv-python mediapipe python-socketio[client] numpy requests
```

### 2. Algoritma Jarak Mata
Jarak diukur menggunakan rumus perbandingan fokus kamera (Triangulasi Kamera):
\[
d = \frac{F \times W}{P}
\]
* **d** = Jarak dari mata ke layar komputer (dalam cm).
* **F** = Focal length kamera (diperoleh melalui proses kalibrasi singkat).
* **W** = Jarak anatomis antar-pupil manusia sesungguhnya (rata-rata: **6.3 cm**).
* **P** = Jarak antar pupil dalam satuan piksel pada frame gambar (hasil deteksi MediaPipe).

### 3. Kode Pipeline ML (`tracker.py`)
Buat file `tracker.py` dan ganti URL ESP32-CAM dengan IP dari hasil langkah Arduino:

```python
import cv2
import mediapipe as mp
import socketio
import math
import time

sio = socketio.Client()
BACKEND_URL = "http://localhost:3001"

print(f"Mencoba terhubung ke backend server di {BACKEND_URL}...")
try:
    sio.connect(BACKEND_URL)
    print("Berhasil terhubung ke Socket.io Backend!")
except Exception as e:
    print(f"Gagal menghubungkan ke backend: {e}. Program tetap berjalan lokal.")

# W = Jarak antar pupil mata asli manusia (rata-rata 6.3 cm)
REAL_EYE_DISTANCE_CM = 6.3

# F = Focal length kamera. Formula: F = (P_calib * D_calib) / W
# Untuk kalibrasi: Duduk tepat 50cm dari kamera, catat jarak pixel pupil (misal: 110px).
# F = (110 * 50) / 6.3 = ~873.
FOCAL_LENGTH = 870.0 

THRESHOLD_CLOSE_CM = 30.0

# Ganti dengan IP Address ESP32-CAM Anda
ESP32_STREAM_URL = "http://192.168.1.100/stream"
cap = cv2.VideoCapture(ESP32_STREAM_URL)

if not cap.isOpened():
    print(f"Gagal membuka stream ESP32-CAM di {ESP32_STREAM_URL}. Beralih menggunakan Webcam bawaan.")
    cap = cv2.VideoCapture(0)

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

last_emit_time = time.time()

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("Gagal membaca frame video stream.")
        time.sleep(1)
        continue

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)

    distance_status = "Jauh"
    calculated_distance_cm = 50.0

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            h, w, _ = frame.shape
            
            # Landmark 468 = Pusat pupil mata kanan, Landmark 473 = Pusat pupil mata kiri
            right_pupil = face_landmarks.landmark[468]
            left_pupil = face_landmarks.landmark[473]

            rx, ry = int(right_pupil.x * w), int(right_pupil.y * h)
            lx, ly = int(left_pupil.x * w), int(left_pupil.y * h)

            pixel_distance = math.sqrt((rx - lx)**2 + (ry - ly)**2)

            if pixel_distance > 0:
                calculated_distance_cm = (REAL_EYE_DISTANCE_CM * FOCAL_LENGTH) / pixel_distance

            if calculated_distance_cm < THRESHOLD_CLOSE_CM:
                distance_status = "Dekat"
            else:
                distance_status = "Jauh"

            color = (0, 0, 255) if distance_status == "Dekat" else (0, 255, 0)
            cv2.line(frame, (lx, ly), (rx, ry), color, 2)
            cv2.putText(frame, f"Jarak: {calculated_distance_cm:.1f} cm ({distance_status})", 
                        (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    current_time = time.time()
    if current_time - last_emit_time > 0.5:
        if sio.connected:
            sio.emit('py-eye-detection', {
                'distance': distance_status,
                'confidence': 95.0
            })
        last_emit_time = current_time

    cv2.imshow('SocaSob ML Monitor', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
if sio.connected:
    sio.disconnect()
```

---

## ⚡ Langkah 4: Cara Pengujian dan Menghubungkan Semua Sistem

Ikuti langkah-langkah di bawah ini untuk memulai pengujian:

1. **Jalankan Database**: Pastikan MongoDB sudah menyala secara lokal (`mongod`).
2. **Nyalakan ESP32-CAM**: Sambungkan modul ke daya USB, dan pastikan terhubung ke Wi-Fi lokal.
3. **Nyalakan Node.js Backend**:
   ```bash
   cd backend-server
   nodemon server.js
   ```
4. **Jalankan Pipeline Python ML**:
   ```bash
   cd ml-pipeline
   python tracker.py
   ```
5. **Jalankan Frontend (Next.js)**:
   Pergi ke folder frontend SocaSob Anda:
   ```bash
   # Atur file .env.local berisi: NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   npm run dev
   ```
   Buka `http://localhost:3000` pada browser Anda.
