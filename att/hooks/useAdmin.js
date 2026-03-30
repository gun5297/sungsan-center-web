// ===== 관리 화면 (출결 기록, 타임라인, CSV, 초기화) =====

import { getStudents, getTodayRecords, saveTodayRecords, deleteStudentRecord, resetTodayRecords, subscribeTodayRecords } from '../data.js';
import { on } from '../../js/events.js';
import { escapeHtml, escapeCSV } from '../../js/utils.js';
import { getCurrentUser } from '../../firebase/auth.js';

let adminRefreshInterval = null;
let unsubscribeRecords = null;

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
let cachedStudents = null;
let cachedRecords = null;

export async function renderAdmin() {
  const now = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  document.getElementById('adminDate').textContent =
    `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${dayNames[now.getDay()]})`;

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

// 캐시 기반 타임라인만 렌더 (취소 버튼 카운트다운용)
function renderTimelineFromCache() {
  if (!cachedStudents || !cachedRecords) return;
  renderTimeline(cachedStudents, cachedRecords);
}

function renderSummary(students, records) {
  let inCount = 0, outCount = 0;

  Object.values(records).forEach(r => {
    if (r.outTime) outCount++;
    else inCount++;
  });

  const absentCount = Math.max(0, students.length - (inCount + outCount));

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
  const user = getCurrentUser();
  const isAdminLogged = user && !user.isAnonymous; // 익명이 아닌 정식 로그인

  const checkedInIds = Object.keys(records)
    .sort((a, b) => (records[a].inTs || 0) - (records[b].inTs || 0));

  if (checkedInIds.length === 0) {
    document.getElementById('adminList').innerHTML =
      '<div class="timeline-empty">오늘 출석한 아동이 없습니다</div>';
    return;
  }

  document.getElementById('adminList').innerHTML = checkedInIds.map(id => {
    const r = records[id];
    const s = students.find(st => st.id === id) || { name: '미등록 아동', school: '' };

    const elapsed = r.inTs ? now - r.inTs : Infinity;
    const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
    const canCancel = elapsed < 60000;

    const cancelBtn = canCancel
      ? `<button class="cancel-btn" data-action="cancelAttendance" data-id="${id}">취소 (${remaining}초)</button>`
      : `<button class="cancel-btn disabled" disabled>취소 불가</button>`;

    const statusClass = r.outTime ? 'left' : 'present';
    const statusLabel = r.outTime ? '하원' : '출석';
    const timeDisplay = r.outTime ? `${r.inTime} - ${r.outTime}` : `${r.inTime}`;

    if (isAdminLogged) {
      // 관리자 로그인 상태: 메인 화면과 같은 CSS 디자인 + 취소버튼(모든 기능)
      const avatarBg = r.outTime ? 'var(--primary-light, #ffeae6)' : 'var(--success-light, #e8f5e9)';
      const avatarColor = r.outTime ? 'var(--primary, #ff5722)' : 'var(--success, #4caf50)';

      return `
        <div class="timeline-item" style="display:flex; align-items:center; gap:16px; padding: 16px; background:var(--bg-card, #fff); border-radius:12px; margin-bottom:12px; border:1px solid var(--border, #eee); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <div class="att-avatar" style="width:44px; height:44px; border-radius:50%; background:${avatarBg}; color:${avatarColor}; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.1rem; flex-shrink:0;">
            ${escapeHtml(s.name.charAt(0))}
          </div>
          <div class="att-info" style="flex:1; display:flex; flex-direction:column; gap:4px;">
            <div class="att-name" style="font-weight:800; font-size:1.05rem; color:var(--text-main, #333);">${escapeHtml(s.name)} <span style="font-size:0.8rem; font-weight:600; color:var(--text-sub); margin-left:4px;">(${id})</span></div>
            <div class="att-status" style="font-size:0.85rem; color:var(--text-sub, #666);">
              <span class="att-row-status ${statusClass}" style="margin-right:4px;">${statusLabel}</span>
              ${timeDisplay}
            </div>
          </div>
          <div class="att-right-area" style="display:flex; flex-direction:column; align-items:flex-end; gap:10px;">
            <div class="att-school" style="font-size:0.8rem; font-weight:600; color:var(--text-sub);">${escapeHtml(s.school)}</div>
            <div class="timeline-actions">${cancelBtn}</div>
          </div>
        </div>
      `;
    } else {
      // 일반 기기 모드: 단순 시간 + 번호만 표시
      return `
        <div class="timeline-item">
          <div class="timeline-time" style="font-size: 0.95rem;">${timeDisplay}</div>
          <div class="timeline-body" style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:12px; align-items:center;">
              <div class="timeline-avatar">${id}</div>
              <span class="att-row-status ${statusClass}">${statusLabel}</span>
            </div>
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
