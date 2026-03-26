// ===== Service Worker — 성산지역아동센터 PWA =====
const CACHE_NAME = 'sungsan-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './js/app.js',
  './css/base.css',
  './css/nav.css',
  './css/hero.css',
  './css/notice.css',
  './css/calendar.css',
  './css/meal.css',
  './css/gallery.css',
  './css/form.css',
  './css/contact.css',
  './css/toolbar.css',
  './css/inbox.css',
  './css/attendance.css',
  './css/toast.css',
  './css/responsive.css'
];

// 설치: 정적 자산 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // 일부 파일 실패해도 설치 진행
        console.warn('일부 정적 자산 캐싱 실패');
      });
    })
  );
  self.skipWaiting();
});

// 활성화: 이전 버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

const VALID_CACHE_TYPES = ['text/', 'application/javascript', 'application/json', 'image/'];

// 요청 가로채기: 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // http(s) 외 스킴(chrome-extension 등)은 캐시 불가 — 무시
  if (!request.url.startsWith('http')) return;

  // 동일 출처만 캐시 — 외부 API/Firebase/CDN 제외
  if (!request.url.startsWith(self.location.origin)) return;

  // HTML 요청: 네트워크 우선
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // 정적 자산: 캐시 우선, 백그라운드 업데이트
  const isSameOrigin = true;
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (isSameOrigin && response && response.status === 200 && response.type !== 'opaque') {
          const ct = response.headers.get('content-type') || '';
          if (VALID_CACHE_TYPES.some(t => ct.includes(t))) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
