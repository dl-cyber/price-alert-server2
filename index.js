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


