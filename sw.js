self.addEventListener('install', (e) => {
  console.log('서비스 워커 설치 완료');
});

self.addEventListener('fetch', (e) => {
  // 오프라인 캐싱 로직이 들어가는 곳
});