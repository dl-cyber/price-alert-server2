// index.js

import WebSocket from 'ws';
import admin from 'firebase-admin';
import http from 'http';

// 1) Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_KEY)
  )
});

// 2) Binance WebSocket (HTTPS 포트 443) 연결
const ws = new WebSocket(
  'wss://stream.binance.com/ws/btcusdt@miniTicker'
);

// 3) 메시지 수신 → 로그 출력 + 조건 만족 시 FCM 푸시 전송
ws.on('message', async (msg) => {
  console.log('🚀 raw msg:', msg);

  const price = JSON.parse(msg).c * 1;
  console.log(`💰 BTCUSDT price: ${price}`);

  const target = 110000; // 목표가 샘플
  if (Math.abs(price - target) / target <= 0.002) { // ±0.2%
    console.log('🔔 price reached, sending push');
    await admin.messaging().send({
      topic: 'price_alert',
      data: { symbol: 'BTCUSDT', price: price.toString() }
    });
  }
});

// 4) 더미 HTTP 서버 (Render에서 포트 바인딩 인식용)
const PORT = process.env.PORT || 10000;
http
  .createServer((req, res) => res.end('OK'))
  .listen(PORT, () =>
    console.log('Dummy HTTP server listening on', PORT)
  );

// 5) 서비스 시작 로그
console.log('서비스가 시작 되었습니다 🎉');
