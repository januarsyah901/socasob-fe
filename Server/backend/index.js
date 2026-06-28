const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 1. KUNCI UTAMA UNTUK ESP32 / POSTMAN
app.use(express.raw({ type: 'image/jpeg', limit: '10mb' }));

// 2. TAMBAHKAN RUTE INI AGAR BROWSER TIDAK "CANNOT GET /"
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Monitor ESP32-CAM</title>
            <script src="/socket.io/socket.io.js"></script>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; background: #222; color: white;">
            <h1>Live Stream Kamera ESP32</h1>
            <div style="margin-top: 20px;">
                <img id="live-video" src="" width="640" height="480" alt="Menunggu gambar dari Postman/ESP32..." style="border: 4px solid #00bcd4; background: #333; border-radius: 8px;">
            </div>

            <script>
                const socket = io();
                const imageElement = document.getElementById('live-video');

                // Mendengarkan pancaran data dari server
                socket.on('stream-kamera', (dataBase64) => {
                    // Update source gambar secara real-time
                    imageElement.src = dataBase64;
                });
            </script>
        </body>
        </html>
    `);
});

// 3. ENDPOINT POST UNTUK MENERIMA GAMBAR
app.post('/upload-frame', (req, res) => {
    const gambarBuffer = req.body;

    if (!gambarBuffer || gambarBuffer.length === 0) {
        return res.status(400).send('Data kosong');
    }

    console.log(`Menerima gambar! Ukuran: ${gambarBuffer.length} bytes`);

    // Konversi biner ke Base64 untuk dikirim ke Web Browser via Socket.io
    const base64Image = gambarBuffer.toString('base64');
    io.emit('stream-kamera', `data:image/jpeg;base64,${base64Image}`);

    res.status(200).send('Sukses');
});

// Jalankan server di port 3000
server.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});