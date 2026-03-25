// ===== useAdmin: 세션 기반 관리자 인증 & 모드 토글 =====
import { getIsAdmin, setIsAdmin, setCurrentUser } from '../state.js';
import { getSession, clearSession, seedUsersIfNeeded } from '../../auth/authData.js';

// 관리자 상태 변경 시 재렌더링할 콜백 목록
let renderCallbacks = [];

export function onAdminRender(fn) {
  renderCallbacks.push(fn);
}

function reRenderAll() {
  renderCallbacks.forEach(fn => fn());
}

export function toggleAdminLogin() {
  if (getIsAdmin()) {
    // 로그아웃
    clearSession();
    setIsAdmin(false);
    setCurrentUser(null);
    document.body.classList.remove('admin-mode');
    const btn = document.getElementById('toolbarAdminBtn');
    if (btn) {
      btn.textContent = '로그인';
      btn.classList.remove('logged-in');
    }
    reRenderAll();
    return;
  }
  // 로그인 페이지로 이동
  window.location.href = 'login.html';
}

export function initAdmin() {
  seedUsersIfNeeded();

  // localStorage에서 세션 복원
  const session = getSession();
  if (session && (session.role === 'teacher' || session.role === 'director')) {
    setIsAdmin(true);
    setCurrentUser(session);
    document.body.classList.add('admin-mode');
    const btn = document.getElementById('toolbarAdminBtn');
    if (btn) {
      btn.textContent = `${session.name} 로그아웃`;
      btn.classList.add('logged-in');
    }
  }
}

// window에 노출
window.toggleAdminLogin = toggleAdminLogin;
