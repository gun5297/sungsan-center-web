// ===== useSystemStatus: 시스템 상태 모니터링 + 오류 안내 =====
import { on } from '../events.js';
import { escapeHtml } from '../utils.js';

// --- 오류 버퍼 ---
const MAX_ERRORS = 50;
const recentErrors = [];

// Firebase 에러코드 → 한국어 매핑
const ERROR_MAP = {
  'permission-denied': { desc: '접근 권한이 없습니다.', action: '로그아웃 후 다시 로그인해 주세요.' },
  'unavailable': { desc: '서버에 연결할 수 없습니다.', action: '인터넷 연결을 확인해 주세요.' },
  'unauthenticated': { desc: '인증이 만료되었습니다.', action: '로그인 페이지로 이동해 주세요.' },
  'not-found': { desc: '요청한 데이터를 찾을 수 없습니다.', action: '페이지를 새로고침해 주세요.' },
  'resource-exhausted': { desc: '일일 요청 한도를 초과했습니다.', action: '내일 다시 시도하거나 Firebase 요금제를 확인하세요.' },
  'deadline-exceeded': { desc: '요청 시간이 초과되었습니다.', action: '인터넷 속도를 확인해 주세요.' },
  'already-exists': { desc: '이미 존재하는 데이터입니다.', action: '중복 확인 후 다시 시도해 주세요.' },
  'cancelled': { desc: '요청이 취소되었습니다.', action: '다시 시도해 주세요.' },
  'data-loss': { desc: '데이터 손실이 발생했습니다.', action: '관리자에게 문의해 주세요.' },
  'internal': { desc: '서버 내부 오류가 발생했습니다.', action: '잠시 후 다시 시도해 주세요.' },
  'failed-precondition': { desc: '작업 조건이 충족되지 않았습니다.', action: '페이지를 새로고침 후 다시 시도해 주세요.' },
  'auth/wrong-password': { desc: '비밀번호가 틀렸습니다.', action: '비밀번호를 확인 후 다시 시도해 주세요.' },
  'auth/user-not-found': { desc: '등록되지 않은 계정입니다.', action: '이메일을 확인하거나 회원가입을 해 주세요.' },
  'auth/too-many-requests': { desc: '로그인 시도가 너무 많습니다.', action: '잠시 후 다시 시도해 주세요.' },
  'auth/network-request-failed': { desc: '네트워크 오류입니다.', action: '인터넷 연결을 확인해 주세요.' },
  'storage/unauthorized': { desc: '파일 접근 권한이 없습니다.', action: '로그인 상태를 확인해 주세요.' },
  'storage/quota-exceeded': { desc: '저장소 용량을 초과했습니다.', action: '불필요한 파일을 삭제하거나 Firebase 요금제를 확인하세요.' },
};

export function captureError(error, context = '') {
  let code = '';
  let message = '';

  if (error && typeof error === 'object') {
    code = error.code || '';
    message = error.message || String(error);
  } else {
    message = String(error);
  }

  const mapped = ERROR_MAP[code] || null;

  recentErrors.unshift({
    timestamp: new Date(),
    code,
    message,
    context,
    desc: mapped ? mapped.desc : message,
    action: mapped ? mapped.action : '페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.'
  });

  if (recentErrors.length > MAX_ERRORS) recentErrors.pop();

  // 대시보드 업데이트
  updateDashboardStatus();
}

export function getRecentErrors() { return [...recentErrors]; }
export function getErrorCount() { return recentErrors.length; }

function updateDashboardStatus() {
  const valEl = document.getElementById('dashSystemVal');
  if (!valEl) return;

  const online = navigator.onLine;
  const errorCount = recentErrors.length;

  if (!online) {
    valEl.innerHTML = '<span class="status-dot status-offline"></span> 오프라인';
  } else if (errorCount > 0) {
    valEl.innerHTML = `<span class="status-dot status-warn"></span> 오류 ${errorCount}건`;
  } else {
    valEl.innerHTML = '<span class="status-dot status-online"></span> 정상';
  }
}

// 온라인/오프라인 감지
window.addEventListener('online', updateDashboardStatus);
window.addEventListener('offline', updateDashboardStatus);

// --- 시스템 상태 모달 ---
function openSystemStatusModal() {
  const existing = document.getElementById('systemStatusOverlay');
  if (existing) existing.remove();

  const online = navigator.onLine;
  const errors = getRecentErrors();

  const overlay = document.createElement('div');
  overlay.id = 'systemStatusOverlay';
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal system-status-modal">
      <div class="modal-title">시스템 상태</div>
      <button class="modal-close-x" data-action="closeSystemStatus"></button>

      <div class="ss-status-row">
        <span class="ss-label">인터넷 연결</span>
        <span class="ss-value"><span class="status-dot ${online ? 'status-online' : 'status-offline'}"></span> ${online ? '연결됨' : '연결 끊김'}</span>
      </div>
      <div class="ss-status-row">
        <span class="ss-label">최근 오류</span>
        <span class="ss-value">${errors.length}건</span>
      </div>

      ${errors.length > 0 ? `
        <div class="ss-error-list">
          ${errors.slice(0, 20).map(e => {
            const time = e.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
            return `
              <div class="ss-error-item">
                <span class="ss-error-time">${escapeHtml(time)}</span>
                <div class="ss-error-info">
                  <div class="ss-error-desc">${escapeHtml(e.desc)}</div>
                  <div class="ss-error-action">${escapeHtml(e.action)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : '<div class="empty-state">오류가 없습니다</div>'}

      <div class="ss-actions">
        <button class="btn-secondary-sm" data-action="clearCacheAndSW">캐시 초기화</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSystemStatus(); });
}

function closeSystemStatus() {
  const overlay = document.getElementById('systemStatusOverlay');
  if (overlay) overlay.remove();
}

// 캐시 초기화
async function clearCacheAndSW() {
  if (!await window.showConfirm('캐시를 초기화하시겠습니까?\n\n페이지가 새로고침됩니다.')) return;
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) await reg.unregister();
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) await caches.delete(key);
    }
    if (window.showToast) showToast('캐시가 초기화되었습니다. 새로고침합니다.', 'success');
    setTimeout(() => location.reload(), 1500);
  } catch (e) {
    console.error('캐시 초기화 실패:', e);
    if (window.showToast) showToast('캐시 초기화에 실패했습니다.', 'error');
  }
}

// 이벤트 위임 등록
on('openSystemStatusModal', () => openSystemStatusModal());
on('closeSystemStatus', () => closeSystemStatus());
on('clearCacheAndSW', () => clearCacheAndSW());

// 초기화 시 대시보드 상태 업데이트
setTimeout(updateDashboardStatus, 1000);
