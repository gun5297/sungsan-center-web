// ===== 앱 엔트리포인트 =====
// 컴포넌트 조합 → DOM 마운트 → 훅 초기화

// --- 컴포넌트 임포트 ---
import { Nav } from './components/Nav.js';
import { Toolbar } from './components/Toolbar.js';
import { Hero } from './components/Hero.js';
import { Notice } from './components/Notice.js';
import { Calendar } from './components/Calendar.js';
import { Meal } from './components/Meal.js';
import { Attendance } from './components/Attendance.js';
import { Gallery } from './components/Gallery.js';
import { Absence } from './components/Absence.js';
import { Medication } from './components/Medication.js';
import { Pickup } from './components/Pickup.js';
import { Register } from './components/Register.js';
import { Contact } from './components/Contact.js';
import { Footer } from './components/Footer.js';

// --- 이벤트 위임 초기화 ---
import { initEvents, on } from './events.js';
initEvents();

// --- 토스트 & 확인 모달 & 전자서명 ---
import './toast.js';
import './confirm.js';
import './signature.js';

// --- 훅 임포트 ---
import { initAdmin, onAdminRender } from './hooks/useAdmin.js';
import { initNotices, renderNotices } from './hooks/useNotices.js';
import { initCalendar } from './hooks/useCalendar.js';
import { initMeal, renderMealGrid } from './hooks/useMeal.js';
import { initAttendance } from './hooks/useAttendance.js';
import { initAbsence } from './hooks/useAbsence.js';
import { initMedication } from './hooks/useMedication.js';
import { initPickup, renderPickupTable } from './hooks/usePickup.js';
import './hooks/useRegister.js';
import './hooks/useDailyLog.js';
import './hooks/useAttReport.js';
import './hooks/useMealUpload.js';
import './hooks/useDataExport.js';
import { initGallery } from './hooks/useGallery.js';
import { initInbox } from './hooks/useInbox.js';
import { initSessionTimeout } from '../firebase/auth.js';

// --- 글로벌 에러 핸들러 ---
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error || e.message);
  if (window.showToast) showToast('예기치 않은 오류가 발생했습니다.', 'error');
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
  if (window.showToast) showToast('작업 중 오류가 발생했습니다.', 'error');
});

// --- 오프라인/온라인 감지 ---
window.addEventListener('offline', () => {
  if (window.showToast) showToast('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.', 'warning');
});
window.addEventListener('online', () => {
  if (window.showToast) showToast('인터넷에 다시 연결되었습니다.', 'success');
});

// --- 1단계: 컴포넌트 조합 → DOM 마운트 ---
document.getElementById('app').innerHTML = [
  Nav(),
  Toolbar(),
  Hero(),
  Notice(),
  Calendar(),
  Meal(),
  Attendance(),
  Gallery(),
  Absence(),
  Medication(),
  Pickup(),
  Register(),
  Contact(),
  Footer(),
].join('');

// --- 2단계: 인증 상태 변경 시 콜백 등록 ---
// 재렌더링 (항상)
onAdminRender(renderNotices);
onAdminRender(renderMealGrid);
onAdminRender(renderPickupTable);
// 인증 필요 구독 — 로그인/로그아웃 시 재구독/해제
onAdminRender(initAttendance);
onAdminRender(initGallery);
onAdminRender(initAbsence);
onAdminRender(initMedication);
onAdminRender(initInbox);

// --- 3단계: Fade-up 스크롤 애니메이션 ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// --- FAB 메뉴 토글 (모바일) ---
on('toggleToolbarMenu', () => {
  document.getElementById('fixedToolbar').classList.toggle('open');
});

// 모바일에서 메뉴 버튼 클릭 시 메뉴 닫기
document.querySelectorAll('.toolbar-menu .toolbar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('fixedToolbar').classList.remove('open');
  });
});

// --- 4단계: 각 훅 초기화 (DOM이 이미 마운트된 후 실행) ---
initAdmin();
initNotices();
initCalendar();
initMeal();
initAttendance();
initAbsence();
initMedication();
initPickup();
initGallery();
initInbox();
initSessionTimeout();

// --- 5단계: 하단 탭 바 스크롤 추적 ---
const tabSections = ['hero', 'notice', 'schedule', 'meal', 'gallery'];
const tabItems = document.querySelectorAll('.tab-item');

function updateActiveTab() {
  const scrollY = window.scrollY + 200;
  let activeId = 'hero';
  for (const id of tabSections) {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) activeId = id;
  }
  tabItems.forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === activeId);
  });
}

window.addEventListener('scroll', updateActiveTab, { passive: true });
tabItems.forEach(tab => {
  tab.addEventListener('click', () => {
    tabItems.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});
