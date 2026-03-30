// ===== 관리 화면 (출결 기록, 타임라인, CSV, 초기화) =====

import { getStudents, getTodayRecords, saveTodayRecords, deleteStudentRecord, resetTodayRecords, subscribeTodayRecords } from '../data.js';
import { on } from '../../js/events.js';
import { escapeHtml, escapeCSV } from '../../js/utils.js';
import { getCurrentUser } from '../../firebase/auth.js';

let adminRefreshInterval = null;
let unsubscribeRecords = null;
let currentFilter = 'all';

export function startAdminRefresh() {
  if (adminRefreshInterval) return;
  // 1초마다 취소 버튼 카운트다운용 렌더링
  adminRefreshInterval = setInterval(() => {
    const panel = document.getElementById('panelRecords');
    if (panel && !panel.classList.contains('hidden')) {
      renderTimelineFromCache();
    }
  }, 1000);

  // Firestore 실시간 구독 — 데이터 변경 시 자동 갱신
  if (!unsubscribeRecords) {
    try {
      unsubscribeRecords = subscribeTodayRecords((records) => {
        cachedRecords = records;
        renderAdminFromCache();
      });
    } catch (e) {
      console.warn('[useAdmin] Firestore 구독 실패:', e);
    }
  }
}

export function stopAdminRefresh() {
  if (adminRefreshInterval) {
    clearInterval(adminRefreshInterval);
    adminRefreshInterval = null;
  }
  if (unsubscribeRecords) {
    unsubscribeRecords();
    unsubscribeRecords = null;
  }
}

export function switchAdminTab(tab) {
  if (tab === 'records') {
    renderAdmin();
  }
}

// 캐시된 데이터 (Firestore 구독 + 1초 렌더링에 사용)
let cachedStudents = [];
let cachedRecords = {};

export async function renderAdmin() {
  const now = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  document.getElementById('adminDate').textContent =
    `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${dayNames[now.getDay()]})`;

  try {
    let students = [];
    try {
      students = await getStudents();
    } catch (err) {
      console.warn('[useAdmin] 학생 목록 조회 권한 없음 (비로그인). 빈 목록으로 대체:', err.code || err.message);
    }
    let records = {};
    try {
      records = await getTodayRecords();
    } catch (err) {
      console.warn('[useAdmin] 출결 기록 조회 실패. 빈 기록으로 대체:', err.code || err.message);
    }
    cachedStudents = students;
    cachedRecords = records;
    renderSummary(students, records);
    renderTimeline(students, records);
  } catch (e) {
    console.error('[useAdmin] renderAdmin 실패:', e);
  }
}

// 캐시 기반 렌더 (Firestore 구독 콜백용)
function renderAdminFromCache() {
  renderSummary(cachedStudents, cachedRecords);
  renderTimeline(cachedStudents, cachedRecords);
}

// 캐시 기반 타임라인만 렌더 (취소 버튼 카운트다운용)
function renderTimelineFromCache() {
  renderTimeline(cachedStudents, cachedRecords);
}

function renderSummary(students, records) {
  let inCount = 0, outCount = 0;

  // 등록된 학생의 기록만 카운트 (미등록 번호 제외)
  const registeredIds = new Set(students.map(st => st.id));
  Object.entries(records).forEach(([id, r]) => {
    if (!registeredIds.has(id)) return;
    if (r.outTime) outCount++;
    else inCount++;
  });

  const absentCount = Math.max(0, students.length - (inCount + outCount));

  const activeClass = (filter) => currentFilter === filter ? ' filter-active' : '';
  const dimClass = (filter) => currentFilter !== 'all' && currentFilter !== filter ? ' filter-dim' : '';

  const resetBtn = currentFilter !== 'all'
    ? `<div class="filter-reset-wrap"><button class="filter-reset-btn" data-action="setFilter" data-filter="all">✕ 전체보기</button></div>`
    : '';

  document.getElementById('adminSummary').innerHTML = `
    <div class="summary-card${activeClass('in')}${dimClass('in')}" data-action="setFilter" data-filter="in">
      <div class="summary-num in">${inCount}</div>
      <div class="summary-label">출석 중</div>
    </div>
    <div class="summary-card${activeClass('out')}${dimClass('out')}" data-action="setFilter" data-filter="out">
      <div class="summary-num out">${outCount}</div>
      <div class="summary-label">하원 완료</div>
    </div>
    <div class="summary-card${activeClass('absent')}${dimClass('absent')}" data-action="setFilter" data-filter="absent">
      <div class="summary-num not">${absentCount}</div>
      <div class="summary-label">미출석</div>
    </div>
  ` + resetBtn;
}

function renderTimeline(students, records) {
  const now = Date.now();
  const user = getCurrentUser();
  const isAdminLogged = user && !user.isAnonymous;

  // ── 필터링: currentFilter에 따라 표시할 ID 목록 결정 ──
  const checkedInIds = Object.keys(records)
    .sort((a, b) => (records[a].inTs || 0) - (records[b].inTs || 0));

  const allStudentIds = students.map(st => st.id);
  const absentIds = allStudentIds.filter(id => !records[id]);

  let targetIds;
  if (currentFilter === 'in') {
    targetIds = checkedInIds.filter(id => !records[id].outTime);
  } else if (currentFilter === 'out') {
    targetIds = checkedInIds.filter(id => records[id].outTime);
  } else if (currentFilter === 'absent') {
    // 미출석은 로그인 상태에서만 표시
    targetIds = isAdminLogged ? absentIds : [];
  } else {
    // 'all' — 출석 기록 + (로그인 시) 미출석
    targetIds = isAdminLogged ? [...checkedInIds, ...absentIds] : checkedInIds;
  }

  if (targetIds.length === 0) {
    const msg = currentFilter === 'absent'
      ? (isAdminLogged ? '미출석 아동이 없습니다' : '로그인 후 확인할 수 있습니다')
      : '해당하는 아동이 없습니다';
    document.getElementById('adminList').innerHTML =
      `<div class="timeline-empty">${msg}</div>`;
    return;
  }

  document.getElementById('adminList').innerHTML = targetIds.map(id => {
    const r = records[id];
    const s = students.find(st => st.id === id);

    // 미출석 아동 (기록 없음) — 등록된 학생만
    if (!r && s) {
      return `
        <div class="att-card">
          <div class="att-card-avatar status-absent">${escapeHtml(s.name.charAt(0))}</div>
          <div class="att-card-body">
            <div class="att-card-name">${escapeHtml(s.name)} <span class="att-card-id">(${escapeHtml(id)})</span></div>
            <div class="att-card-status"><span class="att-row-status absent">미출석</span></div>
          </div>
          <div class="att-card-right">
            <div class="att-card-school">${escapeHtml(s.school)}</div>
          </div>
        </div>
      `;
    }

    // 기록 없고 학생도 없으면 (미등록 + 미출석) — 표시하지 않음
    if (!r) return '';

    const elapsed = r.inTs ? now - r.inTs : Infinity;
    const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
    const canCancel = elapsed < 60000;

    const cancelBtn = canCancel
      ? `<button class="cancel-btn" data-action="cancelAttendance" data-id="${id}">취소 (${remaining}초)</button>`
      : `<button class="cancel-btn disabled" disabled>취소 불가</button>`;

    const statusClass = r.outTime ? 'left' : 'present';
    const statusLabel = r.outTime ? '하원' : '출석';
    const timeDisplay = r.outTime ? `${r.inTime} - ${r.outTime}` : `${r.inTime}`;
    const avatarStatusClass = r.outTime ? 'status-out' : 'status-in';

    if (isAdminLogged) {
      const displayName = s ? escapeHtml(s.name) : '미등록 번호';
      const avatarChar = s ? escapeHtml(s.name.charAt(0)) : '?';
      const schoolInfo = s ? `<div class="att-card-school">${escapeHtml(s.school)}</div>` : '';
      return `
        <div class="att-card">
          <div class="att-card-avatar ${avatarStatusClass}">${avatarChar}</div>
          <div class="att-card-body">
            <div class="att-card-name">${displayName} <span class="att-card-id">(${id})</span></div>
            <div class="att-card-status"><span class="att-row-status ${statusClass}">${statusLabel}</span> ${timeDisplay}</div>
          </div>
          <div class="att-card-right">
            ${schoolInfo}
            <div class="timeline-actions">${cancelBtn}</div>
          </div>
        </div>
      `;
    } else {
      // 비로그인: 동일 카드뷰 레이아웃, 개인정보 제거
      return `
        <div class="att-card">
          <div class="att-card-avatar ${avatarStatusClass}">${escapeHtml(id.slice(-2))}</div>
          <div class="att-card-body">
            <div class="att-card-name">아동 <span class="att-card-id">(${escapeHtml(id)})</span></div>
            <div class="att-card-status"><span class="att-row-status ${statusClass}">${statusLabel}</span> ${timeDisplay}</div>
          </div>
          <div class="att-card-right">
            <div class="timeline-actions">${cancelBtn}</div>
          </div>
        </div>
      `;
    }
  }).join('');
}

async function cancelAttendance(studentId) {
  try {
    const records = await getTodayRecords();
    if (!records[studentId]) return;
    const elapsed = records[studentId].inTs ? Date.now() - records[studentId].inTs : Infinity;
    if (elapsed >= 60000) return;
    if (!confirm('출석을 취소하시겠습니까?\n문자 발송도 취소됩니다.')) return;
    await deleteStudentRecord(studentId);
    await renderAdmin();
  } catch (e) {
    console.error('[useAdmin] cancelAttendance 실패:', e);
    alert('출석 취소에 실패했습니다.');
  }
}


// 이벤트 위임 등록
on('cancelAttendance', (e, el) => cancelAttendance(el.dataset.id));
on('setFilter', (e, el) => {
  const filter = el.dataset.filter;
  currentFilter = currentFilter === filter ? 'all' : filter; // 토글
  renderAdminFromCache();
});
