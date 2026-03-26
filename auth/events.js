// ===== 이벤트 위임 시스템 (auth) =====
// onclick="func()" 인라인 핸들러 대신 data-action 어트리뷰트 + 이벤트 위임 사용
// CSP script-src에서 'unsafe-inline' 제거 가능

const handlers = {
  click: {},
  change: {},
  input: {},
  keyup: {},
  keydown: {}
};

/**
 * 이벤트 핸들러 등록
 * @param {string} action - data-action 값
 * @param {Function} handler - (e, el) => void
 * @param {string} [event='click'] - 이벤트 타입
 */
export function on(action, handler, event = 'click') {
  if (!handlers[event]) handlers[event] = {};
  handlers[event][action] = handler;
}

/**
 * 여러 핸들러를 한번에 등록
 * @param {Object} map - { actionName: handler, ... }
 * @param {string} [event='click'] - 이벤트 타입
 */
export function onAll(map, event = 'click') {
  Object.entries(map).forEach(([action, handler]) => on(action, handler, event));
}

/**
 * 이벤트 위임 초기화 — app-*.js에서 1회 호출
 */
export function initEvents() {
  Object.keys(handlers).forEach(eventType => {
    document.addEventListener(eventType, (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;

      const action = el.dataset.action;
      const map = handlers[eventType];
      if (map && map[action]) {
        map[action](e, el);
      }
    });
  });
}
