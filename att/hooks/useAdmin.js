// ===== 관리 화면 (출결 기록, 타임라인, CSV, 초기화) =====

import { getStudents, getTodayRecords, saveTodayRecords, deleteStudentRecord, resetTodayRecords, subscribeTodayRecords } from '../data.js';
import { on } from '../events.js';

let adminRefreshInterval = null;
let unsubscribeRecords = null;

export function startAdminRefresh() {
  if (adminRefreshInterval) return;
  // 1초마다 SMS 타이머 카운트다운용 렌더링
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
  document.getElementById('tabRecords').classList.toggle('active', tab === 'records');
  document.getElementById('tabManage').classList.toggle('active', tab === 'manage');
  document.getElementById('panelRecords').classList.toggle('hidden', tab !== 'records');
  document.getElementById('panelManage').classList.toggle('hidden', tab !== 'manage');

  if (tab === 'records') {
    renderAdmin();
  }
}

// 캐시된 데이터 (Firestore 구독 + 1초 렌더링에 사용)
let cachedStudents = null;
let cachedRecords = null;

export async function renderAdmin() {
  const now = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  document.getElementById('adminDate').textContent =
    `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 (${dayNames[now.getDay()]})`;

  try {
    const [students, records] = await Promise.all([getStudents(), getTodayRecords()]);
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
  if (!cachedStudents || !cachedRecords) return;
  renderSummary(cachedStudents, cachedRecords);
  renderTimeline(cachedStudents, cachedRecords);
}

// 캐시 기반 타임라인만 렌더 (1초 카운트다운용)
function renderTimelineFromCache() {
  if (!cachedStudents || !cachedRecords) return;
  renderTimeline(cachedStudents, cachedRecords);
}

function renderSummary(students, records) {
  let inCount = 0, outCount = 0, absentCount = 0;
  students.forEach(s => {
    const r = records[s.id];
    if (!r) absentCount++;
    else if (r.outTime) outCount++;
    else inCount++;
  });

  document.getElementById('adminSummary').innerHTML = `
    <div class="summary-card">
      <div class="summary-num in">${inCount}</div>
      <div class="summary-label">출석 중</div>
    </div>
    <div class="summary-card">
      <div class="summary-num out">${outCount}</div>
      <div class="summary-label">하원 완료</div>
    </div>
    <div class="summary-card">
      <div class="summary-num not">${absentCount}</div>
      <div class="summary-label">미출석</div>
    </div>
  `;
}

function renderTimeline(students, records) {
  const now = Date.now();

  const checkedIn = students
    .filter(s => records[s.id])
    .sort((a, b) => (records[a.id].inTs || 0) - (records[b.id].inTs || 0));

  if (checkedIn.length === 0) {
    document.getElementById('adminList').innerHTML =
      '<div class="timeline-empty">아직 출석한 아동이 없습니다</div>';
    return;
  }

  document.getElementById('adminList').innerHTML = checkedIn.map(s => {
    const r = records[s.id];
    const elapsed = r.inTs ? now - r.inTs : Infinity;
    const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
    const canCancel = elapsed < 60000;

    const smsHtml = canCancel
      ? `<div class="timeline-sms pending">📱 ${remaining}초 후 문자 발송 예정</div>`
      : `<div class="timeline-sms sent">📱 문자 발송 완료</div>`;

    const cancelBtn = canCancel
      ? `<button class="cancel-btn" data-action="cancelAttendance" data-id="${s.id}">출석 취소 (${remaining}초)</button>`
      : `<button class="cancel-btn disabled" disabled>취소 불가</button>`;

    const statusClass = r.outTime ? 'left' : 'present';
    const statusLabel = r.outTime ? '하원' : '출석 중';

    return `
      <div class="timeline-item">
        <div class="timeline-time">${r.inTime}</div>
        <div class="timeline-body">
          <div class="timeline-top">
            <div class="timeline-avatar">${s.id}</div>
            <div class="timeline-info">
              <div class="timeline-name">${s.name}</div>
              <div class="timeline-school">${s.school}</div>
            </div>
            <span class="att-row-status ${statusClass}">${statusLabel}</span>
          </div>
          ${smsHtml}
          <div class="timeline-actions">${cancelBtn}</div>
        </div>
      </div>
    `;
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

async function exportCSV() {
  try {
    const [students, records] = await Promise.all([getStudents(), getTodayRecords()]);
    const today = new Date().toISOString().split('T')[0];

    let csv = '번호,이름,학교,등원시간,하원시간,상태,보호자연락처\n';
    students.forEach(s => {
      const r = records[s.id];
      let status, inTime, outTime;
      if (!r) {
        status = '미출석'; inTime = ''; outTime = '';
      } else if (r.outTime) {
        status = '하원완료'; inTime = r.inTime; outTime = r.outTime;
      } else {
        status = '출석중'; inTime = r.inTime; outTime = '';
      }
      csv += `${s.id},${s.name},${s.school},${inTime},${outTime},${status},${s.parent}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `출결기록_${today}.csv`;
    link.click();
  } catch (e) {
    console.error('[useAdmin] exportCSV 실패:', e);
    alert('CSV 내보내기에 실패했습니다.');
  }
}

async function resetToday() {
  if (confirm('오늘 출결 기록을 모두 삭제하시겠습니까?')) {
    try {
      await resetTodayRecords();
      cachedRecords = {};
      await renderAdmin();
    } catch (e) {
      console.error('[useAdmin] resetToday 실패:', e);
      alert('초기화에 실패했습니다.');
    }
  }
}

// 이벤트 위임 등록
on('switchAdminTab', (e, el) => switchAdminTab(el.dataset.tab));
on('cancelAttendance', (e, el) => cancelAttendance(el.dataset.id));
on('exportCSV', () => exportCSV());
on('resetToday', () => resetToday());
