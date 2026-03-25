// ===== 앱 엔트리포인트 =====
// 모든 훅을 임포트하고 초기화하는 메인 모듈

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

// 관리자 상태 변경 시 재렌더링할 모듈 등록
onAdminRender(renderNotices);
onAdminRender(renderMealGrid);
onAdminRender(renderAttendance);
onAdminRender(renderMedSchedule);
onAdminRender(renderAbsenceList);
onAdminRender(renderGallery);
onAdminRender(renderPickupTable);

// Fade-up 스크롤 애니메이션
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// 각 모듈 초기화
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
