// 캐시 버전을 올려줍니다. 코드를 수정할 때마다 이 숫자를 v2, v3...으로 바꾸면 즉시 업데이트돼!
const CACHE_NAME = 'tier-maker-v2'; 
const FILES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// 1. 앱 설치 시: 새로운 파일을 캐시하고 즉시 대기열 통과
self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// 2. 앱 실행 시: 옛날 캐시(기억)는 싹 지워버리기 (이게 핵심!)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] 오래된 캐시 삭제', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim(); // 즉시 새 서비스 워커가 제어권 가져오기
});

// 3. 데이터 가져오기: 인터넷에서 먼저 찾고, 없으면 저장된 캐시 쓰기 (Network First)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});