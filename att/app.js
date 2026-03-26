// ===== 출결 시스템 진입점 =====

// 이벤트 위임 시스템
import { initEvents } from './events.js';

// 컴포넌트
import { LockScreen } from './components/LockScreen.js';
import { MainScreen } from './components/MainScreen.js';
import { SuccessScreen } from './components/SuccessScreen.js';
import { AdminScreen } from './components/AdminScreen.js';

// 데이터 초기화 (Firestore 마이그레이션)
import { initData } from './data.js';

// 훅 (import하면 이벤트 위임 자동 등록)
import './hooks/useScreen.js';
import './hooks/useLock.js';
import './hooks/useInput.js';
import './hooks/useAdmin.js';
import './hooks/useManage.js';
import { initClock } from './hooks/useClock.js';
import { initNavigation } from './hooks/useScreen.js';

// 이벤트 위임 초기화 (핸들러 등록 후 실행)
initEvents();

// DOM 조립
document.getElementById('app').innerHTML =
  LockScreen() +
  MainScreen() +
  SuccessScreen() +
  AdminScreen() +
  '<button class="admin-toggle" id="adminToggle" data-action="goAdmin">관리</button>';

// 초기화
initData().then(() => {
  console.log('[att/app] Firestore 데이터 초기화 완료');
}).catch(e => {
  console.warn('[att/app] Firestore 초기화 실패 (localStorage 폴백 사용):', e);
});
initClock();
initNavigation();
