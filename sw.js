// ===== Service Worker — 성산지역아동센터 PWA =====
const CACHE_NAME = 'sungsan-v4';

// JS/HTML은 항상 최신 버전 필요 → 네트워크 우선 전략
// 이미지/CSS만 캐시 우선 (오프라인 대응)
const CSS_IMAGE_CACHE = 'sungsan-static-v4';

// 설치: 즉시 활성화
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 활성화: 이전 버전 캐시 전부 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== CSS_IMAGE_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // http(s) 외 스킴 무시
  if (!request.url.startsWith('http')) return;

  // 외부 API/Firebase/CDN 제외 (동일 출처만)
  if (!request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);
  const isJS = url.pathname.endsWith('.js');
  const isHTML = request.mode === 'navigate' || url.pathname.endsWith('.html');
  const isCSS = url.pathname.endsWith('.css');
  const isImage = /\.(png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname);

  // JS/HTML: 네트워크 우선, 실패 시 캐시 (항상 최신 코드 보장)
  if (isJS || isHTML) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // CSS/이미지: 캐시 우선, 백그라운드 업데이트
  if (isCSS || isImage) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CSS_IMAGE_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
