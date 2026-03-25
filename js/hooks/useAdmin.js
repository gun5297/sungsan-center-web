// ===== useAdmin: 관리자 인증 & 모드 토글 =====
import { getIsAdmin, setIsAdmin } from '../state.js';
import { ADMIN_PASSWORD } from '../data/sampleData.js';

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
    setIsAdmin(false);
    document.body.classList.remove('admin-mode');
    document.getElementById('toolbarAdminBtn').textContent = '선생님 로그인';
    document.getElementById('toolbarAdminBtn').classList.remove('logged-in');
    reRenderAll();
    return;
  }
  document.getElementById('adminLoginModal').classList.add('active');
  const input = document.getElementById('adminPwInput');
  input.value = '';
  setTimeout(() => input.focus(), 100);
}

export function doAdminLogin() {
  const pw = document.getElementById('adminPwInput').value;
  if (pw === ADMIN_PASSWORD) {
    setIsAdmin(true);
    document.body.classList.add('admin-mode');
    document.getElementById('toolbarAdminBtn').textContent = '선생님 로그아웃';
    document.getElementById('toolbarAdminBtn').classList.add('logged-in');
    closeAdminModal();
    reRenderAll();
  } else {
    alert('비밀번호가 틀렸습니다.');
    document.getElementById('adminPwInput').value = '';
    document.getElementById('adminPwInput').focus();
  }
}

export function closeAdminModal() {
  document.getElementById('adminLoginModal').classList.remove('active');
}

export function initAdmin() {
  const pwInput = document.getElementById('adminPwInput');
  if (pwInput) {
    pwInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doAdminLogin();
    });
  }
}

// window에 노출
window.toggleAdminLogin = toggleAdminLogin;
window.doAdminLogin = doAdminLogin;
window.closeAdminModal = closeAdminModal;
