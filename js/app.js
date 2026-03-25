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

// --- 훅 임포트 ---
import { initAdmin, onAdminRender } from './hooks/useAdmin.js';
import { initNotices, renderNotices } from './hooks/useNotices.js';
import { initCalendar } from './hooks/useCalendar.js';
import { initMeal, renderMealGrid } from './hooks/useMeal.js';
import { initAttendance, renderAttendance } from './hooks/useAttendance.js';
import { initAbsence, renderAbsenceList } from './hooks/useAbsence.js';
import { initMedication, renderMedSchedule } from './hooks/useMedication.js';
import { initPickup, renderPickupTable } from './hooks/usePickup.js';
import './hooks/useRegister.js';
import { initGallery, renderGallery } from './hooks/useGallery.js';
import { initInbox } from './hooks/useInbox.js';

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

// --- 2단계: 관리자 상태 변경 시 재렌더링 콜백 등록 ---
onAdminRender(renderNotices);
onAdminRender(renderMealGrid);
onAdminRender(renderAttendance);
onAdminRender(renderMedSchedule);
onAdminRender(renderAbsenceList);
onAdminRender(renderGallery);
onAdminRender(renderPickupTable);

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
window.toggleToolbarMenu = function() {
  document.getElementById('fixedToolbar').classList.toggle('open');
};

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
