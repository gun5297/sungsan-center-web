// ===== 화면 전환 & 히스토리 관리 =====

import { renderAdmin, startAdminRefresh, stopAdminRefresh, switchAdminTab } from './useAdmin.js';
import { on } from '../../js/events.js';
import { checkAttendancePassword } from '../../firebase/services/settingsService.js';

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

function goAdmin() {
  showScreen('screenAdmin');
  switchAdminTab('records');
}

async function promptPasswordAndNavigate(msg = '비밀번호를 입력하세요') {
  const pw = prompt(msg);
  if (pw === null) return;
  try {
    const ok = await checkAttendancePassword(pw);
    if (ok) {
      window.location.href = 'index.html';
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  } catch (e) {
    console.error('[useScreen] 비밀번호 확인 실패:', e);
    alert('비밀번호 확인에 실패했습니다.');
  }
}

export function initNavigation() {
  history.replaceState({ screen: 'lock' }, '');

  window.addEventListener('popstate', () => {
    const mainScreen = document.getElementById('screenMain');
    if (mainScreen && !mainScreen.classList.contains('hidden')) {
      history.pushState({ screen: 'main' }, '');
      promptPasswordAndNavigate('메인으로 돌아가려면 비밀번호를 입력하세요');
    }
  });
}

// 이벤트 위임 등록
on('goAdmin', () => goAdmin());
on('backToMain', () => promptPasswordAndNavigate());
on('showScreen', (e, el) => showScreen(el.dataset.screen));
