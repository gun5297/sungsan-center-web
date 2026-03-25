// ===== 화면 전환 & 히스토리 관리 =====

import { ATT_PASSWORD } from '../data.js';
import { renderAdmin, startAdminRefresh, stopAdminRefresh, switchAdminTab } from './useAdmin.js';

export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');

  const toggle = document.getElementById('adminToggle');
  toggle.style.display = (screenId === 'screenMain') ? 'block' : 'none';

  if (screenId === 'screenAdmin') {
    renderAdmin();
    startAdminRefresh();
  } else {
    stopAdminRefresh();
  }
}

export function goAdmin() {
  showScreen('screenAdmin');
  switchAdminTab('records');
}

export function backToMain() {
  const pw = prompt('비밀번호를 입력하세요');
  if (pw === ATT_PASSWORD) {
    window.location.href = 'index.html';
  } else if (pw !== null) {
    alert('비밀번호가 틀렸습니다.');
  }
}

export function initNavigation() {
  history.replaceState({ screen: 'lock' }, '');

  window.addEventListener('popstate', function() {
    const mainScreen = document.getElementById('screenMain');
    if (mainScreen && !mainScreen.classList.contains('hidden')) {
      history.pushState({ screen: 'main' }, '');
      const pw = prompt('메인으로 돌아가려면 비밀번호를 입력하세요');
      if (pw === ATT_PASSWORD) {
        window.location.href = 'index.html';
      }
    }
  });
}

// window 노출
window.goAdmin = goAdmin;
window.backToMain = backToMain;
