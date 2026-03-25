// ===== useAdmin: Firebase Auth 기반 관리자 인증 & 모드 토글 =====
import { getIsAdmin, setIsAdmin, setCurrentUser } from '../state.js';
import { logout, onAuthChange } from '../../firebase/auth.js';

// 관리자 상태 변경 시 재렌더링할 콜백 목록
let renderCallbacks = [];

export function onAdminRender(fn) {
  renderCallbacks.push(fn);
}

function reRenderAll() {
  renderCallbacks.forEach(fn => fn());
}

export async function toggleAdminLogin() {
  if (getIsAdmin()) {
    // 로그아웃
    await logout();
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
  // Firebase Auth 상태 변경 구독
  onAuthChange((user) => {
    const btn = document.getElementById('toolbarAdminBtn');
    if (user) {
      setIsAdmin(true);
      setCurrentUser({ email: user.email, uid: user.uid });
      document.body.classList.add('admin-mode');
      if (btn) {
        btn.textContent = '로그아웃';
        btn.classList.add('logged-in');
      }
    } else {
      setIsAdmin(false);
      setCurrentUser(null);
      document.body.classList.remove('admin-mode');
      if (btn) {
        btn.textContent = '로그인';
        btn.classList.remove('logged-in');
      }
    }
    reRenderAll();
  });
}

// window에 노출
window.toggleAdminLogin = toggleAdminLogin;
