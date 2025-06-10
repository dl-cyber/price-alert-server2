import WebSocket from 'ws';
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY))
});

const ws = new WebSocket(
  'wss://stream.binance.com:9443/ws/btcusdt@miniTicker'
);

ws.on('message', async (msg) => {
  const price = JSON.parse(msg).c * 1;         // 현재가
  const target = 110000;                       // 목표가(예시)

  if (Math.abs(price - target) / target <= 0.002) {   // ±0.2 % 안이면
    await admin.messaging().send({
      topic: 'price_alert',
      data: { symbol: 'BTCUSDT', price: price.toString() }
    });
  }
});
// --- dummy HTTP server so Render detects an open port ---
import http from 'http';
const PORT = process.env.PORT || 10000;      // Render가 제공하는 포트
http.createServer((req, res) => res.end('OK')).listen(PORT);
console.log('Dummy HTTP server listening on', PORT);
