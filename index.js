// 1) WebSocket + Firebase Admin 초기화
import WebSocket from 'ws';
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_KEY)
  )
});

// 2) 메인 WebSocket 연결 (1초마다 가격 데이터 스트림)
const ws = new WebSocket(
  'wss://stream.binance.com:9443/ws/btcusdt@miniTicker'
);

// 3) 메시지 수신 → 가격 로그 + 조건 만족 시 푸시 전송
ws.on('message', async (msg) => {
  console.log('🚀 raw msg:', msg);  
  const price = JSON.parse(msg).c * 1;
  console.log(`💰 BTCUSDT price: ${price}`);

  const target = 110000;   
  if (Math.abs(price - target) / target <= 0.002) {
    console.log('🔔 price reached, sending push');
    await admin.messaging().send({
      topic: 'price_alert',
      data: { symbol: 'BTCUSDT', price: price.toString() }
    });
  }
});

// 4) dummy HTTP 서버 추가 (Free Web Service용 포트 바인딩)
import http from 'http';
const PORT = process.env.PORT || 10000;
http
  .createServer((req, res) => res.end('OK'))
  .listen(PORT, () =>
    console.log('Dummy HTTP server listening on', PORT)
  );

// 5) 시작 완료 로그
console.log('서비스가 시작 되었습니다 🎉');
