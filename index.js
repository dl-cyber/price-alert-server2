ws.on('message', async (msg) => {
  // ① 원본 메시지 확인
  console.log('🚀 raw msg:', msg);

  // ② 가격 파싱 및 로그
  const price = JSON.parse(msg).c * 1;
  console.log(`💰 BTCUSDT price: ${price}`);

  // ③ 목표 도달 시 푸시 전송 로그
  const target = 110000; // 목표가(예시)
  if (Math.abs(price - target) / target <= 0.002) { // ±0.2% 안이면
    console.log('🔔 price reached, sending push');
    await admin.messaging().send({
      topic: 'price_alert',
      data: { symbol: 'BTCUSDT', price: price.toString() }
    });
  }
});
