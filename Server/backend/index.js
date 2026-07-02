/*
  TCP Server penerima video stream dari ESP32-CAM (plain socket, length-prefix).
  Format tiap frame yang dikirim ESP32: [4 byte big-endian panjang][data JPEG]

  Install dependency:
      npm install express

  Jalankan:
      node tcp_frame_server.js

  Lalu buka di browser: http://localhost:3001/
*/

const net = require('net');
const express = require('express');

const TCP_PORT = 3001;
const HTTP_PORT = 3002; // beda port dari TCP biar tidak bentrok

let latestFrame = null;
let frameCount = 0;
let lastFpsLogTime = Date.now();

// ---------------------------------------------------------------------------
// TCP Server: menerima frame dari ESP32-CAM
// ---------------------------------------------------------------------------
const tcpServer = net.createServer((socket) => {
  console.log(`[TCP] ESP32-CAM terhubung dari ${socket.remoteAddress}`);
  socket.setNoDelay(true);

  let buffer = Buffer.alloc(0);
  let expectedLen = null; // null = belum tahu panjang frame berikutnya

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    // Proses selama buffer cukup untuk header (4 byte) dan/atau payload
    while (true) {
      if (expectedLen === null) {
        if (buffer.length < 4) break; // belum cukup untuk baca header panjang
        expectedLen = buffer.readUInt32BE(0);
        buffer = buffer.subarray(4);
      }

      if (buffer.length < expectedLen) break; // payload belum lengkap, tunggu data lagi

      const frame = buffer.subarray(0, expectedLen);
      buffer = buffer.subarray(expectedLen);
      expectedLen = null;

      latestFrame = Buffer.from(frame); // copy supaya aman dari mutasi buffer berikutnya
      frameCount++;

      const now = Date.now();
      if (now - lastFpsLogTime >= 1000) {
        console.log(`[FPS] ${frameCount} frame/detik, ukuran terakhir: ${latestFrame.length} bytes`);
        frameCount = 0;
        lastFpsLogTime = now;
      }
    }
  });

  socket.on('close', () => {
    console.log('[TCP] ESP32-CAM terputus');
  });

  socket.on('error', (err) => {
    console.error('[TCP] Socket error:', err.message);
  });
});

tcpServer.listen(TCP_PORT, '0.0.0.0', () => {
  console.log(`[TCP] Server TCP mendengarkan di 0.0.0.0:${TCP_PORT}`);
});

// ---------------------------------------------------------------------------
// HTTP Server: untuk menonton stream MJPEG di browser
// ---------------------------------------------------------------------------
const app = express();

app.get('/video', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache',
    Connection: 'close',
    Pragma: 'no-cache',
  });

  const interval = setInterval(() => {
    if (latestFrame) {
      res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${latestFrame.length}\r\n\r\n`);
      res.write(latestFrame);
      res.write('\r\n');
    }
  }, 50);

  req.on('close', () => clearInterval(interval));
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="margin:0;background:#111;text-align:center;">
        <h2 style="color:white;font-family:sans-serif;">ESP32-CAM Live Stream (TCP)</h2>
        <img src="/video" style="max-width:100%;" />
      </body>
    </html>
  `);
});

app.listen(HTTP_PORT, '0.0.0.0', () =>   {
  console.log(`[HTTP] Buka http://localhost:${HTTP_PORT}/ di browser untuk menonton stream`);
});