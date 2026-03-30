// ===== useAdmin: Firebase Auth + Firestore 역할 기반 관리자 =====
import { getIsAdmin, setIsAdmin, setCurrentUser, setUserRole, canManage } from '../state.js';
import { on } from '../events.js';
import { logout, onAuthChange } from '../../firebase/auth.js';
import { getUserDoc, createUserDoc, hasNoDirector, isAdminRole } from '../../firebase/services/userService.js';
import { subscribeTodayRecords } from '../../firebase/services/attendanceService.js';
import { getAllStudents } from '../../firebase/services/studentService.js';

// 인증 상태 초기화 헬퍼
function resetAuthState() {
  setIsAdmin(false);
  setCurrentUser(null);
  setUserRole(null);
  cleanupDashboard();
  document.body.classList.remove('admin-mode', 'logged-in');
  const btn = document.getElementById('toolbarAdminBtn');
  if (btn) { btn.textContent = '로그인'; btn.classList.remove('logged-in'); }
}

// 관리자 상태 변경 시 재렌더링할 콜백 목록
let renderCallbacks = [];

export function onAdminRender(fn) {
  renderCallbacks.push(fn);
}

function reRenderAll() {
  renderCallbacks.forEach(fn => fn());
}

export async function toggleAdminLogin() {
  if (getIsAdmin()) {
    await logout();
    resetAuthState();
    reRenderAll();
    return;
  }
  window.location.href = 'login.html';
}

export function initAdmin() {
  onAuthChange(async (user) => {
    const btn = document.getElementById('toolbarAdminBtn');

    if (user) {
      try {
        // Firestore에서 역할 조회
        let userDoc = await getUserDoc(user.uid);

        // Firestore 문서가 없으면 자동 생성 (Firebase Console에서 직접 만든 계정)
        if (!userDoc) {
          const noAdmin = await hasNoDirector();
          await createUserDoc(user.uid, {
            email: user.email,
            name: user.email.split('@')[0],
            role: noAdmin ? 'admin' : 'general',
            phone: ''
          });
          userDoc = await getUserDoc(user.uid);
        }

        // 미승인 계정 처리
        if (!userDoc.approved) {
          await logout();
          showToast('관리자의 승인을 기다리고 있습니다.', 'info');
          return;
        }

        const role = userDoc.role;
        const admin = isAdminRole(role);
        setIsAdmin(admin);
        setCurrentUser({ uid: user.uid, email: user.email, name: userDoc.name, role });
        setUserRole(role);

        // body 클래스 설정
        document.body.classList.add('logged-in');
        if (admin) {
          document.body.classList.add('admin-mode');
        }

        if (btn) {
          btn.textContent = `${userDoc.name} 로그아웃`;
          btn.classList.add('logged-in');
        }
      } catch (e) {
        console.error('관리자 상태 확인 실패:', e);
        await logout();
        resetAuthState();
      }
    } else {
      resetAuthState();
    }

    reRenderAll();
  });
}

// ===== 대시보드 데이터 로드 =====
let _dashboardCleanup = null;

function cleanupDashboard() {
  if (_dashboardCleanup) {
    _dashboardCleanup.forEach(fn => fn());
    _dashboardCleanup = null;
  }
}

function initDashboard() {
  cleanupDashboard();
  _dashboardCleanup = [];

  // 오늘 출석 실시간 구독 (등록된 학생만 카운트)
  let _dashStudentIds = new Set();
  getAllStudents().then(students => {
    _dashStudentIds = new Set(students.map(s => s.id));
  }).catch(() => {});

  const unsubRecords = subscribeTodayRecords((records) => {
    const el = document.getElementById('dashAttVal');
    if (el) {
      const count = Object.entries(records)
        .filter(([id, r]) => r.inTime && (_dashStudentIds.size === 0 || _dashStudentIds.has(id)))
        .length;
      el.textContent = count;
    }
  });
  _dashboardCleanup.push(unsubRecords);

  // 서류함 — inboxBadge 값을 대시보드에 복사
  const inboxObs = new MutationObserver(() => {
    const badge = document.getElementById('inboxBadge');
    const dashEl = document.getElementById('dashInboxVal');
    if (badge && dashEl) dashEl.textContent = badge.textContent || '0';
  });
  const badge = document.getElementById('inboxBadge');
  if (badge) {
    inboxObs.observe(badge, { childList: true, characterData: true, subtree: true });
    _dashboardCleanup.push(() => inboxObs.disconnect());
  }

  // 투약 중 — medSchedule의 자식 수 감시
  const medObs = new MutationObserver(() => {
    const medEl = document.getElementById('medSchedule');
    const dashMed = document.getElementById('dashMedVal');
    if (medEl && dashMed) {
      const cards = medEl.querySelectorAll('.med-card:not(.med-completed)');
      dashMed.textContent = cards.length;
    }
  });
  const medSchedule = document.getElementById('medSchedule');
  if (medSchedule) {
    medObs.observe(medSchedule, { childList: true, subtree: true });
    _dashboardCleanup.push(() => medObs.disconnect());
  }

  // 오늘 식단 — 있는지 여부
  const mealGrid = document.getElementById('mealGrid');
  const dashMeal = document.getElementById('dashMealVal');
  if (mealGrid && dashMeal) {
    const todayCard = mealGrid.querySelector('.meal-card.today');
    dashMeal.textContent = todayCard ? '등록됨' : '-';
    const mealObs = new MutationObserver(() => {
      const tc = mealGrid.querySelector('.meal-card.today');
      dashMeal.textContent = tc ? '등록됨' : '-';
    });
    mealObs.observe(mealGrid, { childList: true, subtree: true });
    _dashboardCleanup.push(() => mealObs.disconnect());
  }
}

// 관리자 로그인 완료 후 대시보드 초기화, 로그아웃 시 정리
onAdminRender(() => {
  if (getIsAdmin() && document.getElementById('dashboard')) {
    initDashboard();
  } else {
    cleanupDashboard();
  }
});

// 이벤트 위임 등록
on('toggleAdminLogin', () => toggleAdminLogin());
