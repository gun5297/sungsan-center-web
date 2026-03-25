// ===== 출결 시스템 진입점 =====

// 컴포넌트
import { LockScreen } from './components/LockScreen.js';
import { MainScreen } from './components/MainScreen.js';
import { SuccessScreen } from './components/SuccessScreen.js';
import { AdminScreen } from './components/AdminScreen.js';

// 데이터 초기화 (Firestore 마이그레이션)
import { initData } from './data.js';

// 훅 (import하면 window 노출 자동 등록)
import { showScreen } from './hooks/useScreen.js';
import './hooks/useLock.js';
import './hooks/useInput.js';
import './hooks/useAdmin.js';
import './hooks/useManage.js';
import { initClock } from './hooks/useClock.js';
import { initNavigation } from './hooks/useScreen.js';

// showScreen을 window에 노출 (AdminScreen의 돌아가기 버튼에서 사용)
window.showScreen = showScreen;

// DOM 조립
document.getElementById('app').innerHTML =
  LockScreen() +
  MainScreen() +
  SuccessScreen() +
  AdminScreen() +
  '<button class="admin-toggle" id="adminToggle" onclick="goAdmin()">관리</button>';

// 초기화
initData().then(() => {
  console.log('[att/app] Firestore 데이터 초기화 완료');
}).catch(e => {
  console.warn('[att/app] Firestore 초기화 실패 (localStorage 폴백 사용):', e);
});
initClock();
initNavigation();
