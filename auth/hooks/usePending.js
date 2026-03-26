// ===== usePending: 승인 대기 페이지 로직 =====
import { logout } from '../../firebase/auth.js';

export function initPending() {
  document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
    window.location.href = 'login.html';
  });
}
