// ===== 승인 대기 페이지 진입점 =====
import { PendingPage } from './components/PendingPage.js';
import { initPending } from './hooks/usePending.js';
import { initEvents } from './events.js';

// 0단계: 이벤트 위임 초기화
initEvents();

// 1단계: 컴포넌트 마운트
document.getElementById('app').innerHTML = PendingPage();

// 2단계: 훅 초기화
initPending();
