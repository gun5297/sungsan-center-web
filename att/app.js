// ===== 출결 시스템 진입점 =====

// 컴포넌트
import { LockScreen } from './components/LockScreen.js';
import { MainScreen } from './components/MainScreen.js';
import { SuccessScreen } from './components/SuccessScreen.js';
import { AdminScreen } from './components/AdminScreen.js';

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
initClock();
initNavigation();
