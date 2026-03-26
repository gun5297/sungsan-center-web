// ===== useAttendance: 출석 현황 (메인 페이지 표시용) — Firestore 실시간 구독 =====

import { on } from '../events.js';
import { skeletonRows, escapeHtml } from '../utils.js';
import { subscribeTodayRecords } from '../../firebase/services/attendanceService.js';
import { subscribeStudents } from '../../firebase/services/studentService.js';
import { getCurrentUser, getUserRole, isLoggedIn } from '../state.js';
import { getMyChildren } from '../../firebase/services/childLinkService.js';

let cachedStudents = [];
let cachedRecords = {};
let unsubStudents = null;
let unsubRecords = null;

// 내 아이 출결 렌더링
async function renderMyChildAttendance() {
  const container = document.getElementById('myChildList');
  if (!container) return;

  const user = getCurrentUser();
  const role = getUserRole();

  // 로그인하지 않았거나 관리자이면 표시하지 않음
  if (!user || role === 'admin') {
    container.innerHTML = '';
    return;
  }

  try {
    const children = await getMyChildren(user.uid);

    if (children.length === 0) {
      container.innerHTML = '<div class="empty-state">연결된 아동이 없습니다. 마이페이지에서 아이를 연결해 주세요.</div>';
      return;
    }

    // 연결된 아동의 출결 정보를 학생 목록에서 이름으로 매칭
    const cards = children.map(link => {
      // 학생 목록에서 이름으로 매칭 (childId가 있으면 ID로, 없으면 이름으로)
      const student = link.childId
        ? cachedStudents.find(s => s.id === link.childId)
        : cachedStudents.find(s => s.name === link.childName);

      const record = student ? cachedRecords[student.id] : null;

      let statusClass, statusLabel, timeInfo;
      if (!student) {
        statusClass = 'absent';
        statusLabel = '미등록';
        timeInfo = '출결 시스템에 등록되지 않은 아동입니다';
      } else if (!record) {
        statusClass = 'absent';
        statusLabel = '미출석';
        timeInfo = '아직 등원하지 않았습니다';
      } else if (record.outTime) {
        statusClass = 'late';
        statusLabel = '하원 완료';
        timeInfo = `등원 ${record.inTime} · 하원 ${record.outTime}`;
      } else {
        statusClass = 'present';
        statusLabel = '출석 중';
        timeInfo = `등원 ${record.inTime}`;
      }

      return `
        <div class="my-child-card">
          <div class="my-child-avatar ${statusClass}">${escapeHtml(link.childName.charAt(0))}</div>
          <div class="my-child-info">
            <div class="my-child-name">${escapeHtml(link.childName)}${link.relation ? ` <span class="my-child-relation">(${escapeHtml(link.relation)})</span>` : ''}</div>
            <div class="my-child-status ${statusClass}">${statusLabel}</div>
            <div class="my-child-time">${timeInfo}</div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = cards;
  } catch (e) {
    console.warn('[useAttendance] 내 아이 출결 조회 실패:', e);
    container.innerHTML = '<div class="empty-state">출결 정보를 불러올 수 없습니다</div>';
  }
}

function renderFromCache() {
  const attStudents = cachedStudents;
  const records = cachedRecords;

  if (attStudents.length === 0) {
    document.getElementById('attendanceSummary').innerHTML = '';
    document.getElementById('attendanceList').innerHTML =
      '<div class="empty-state">출결 시스템에 등록된 아동이 없습니다</div>';
  } else {
    let presentCount = 0, leftCount = 0, absentCount = 0;
    attStudents.forEach(s => {
      const r = records[s.id];
      if (!r) absentCount++;
      else if (r.outTime) leftCount++;
      else presentCount++;
    });

    document.getElementById('attendanceSummary').innerHTML = `
      <div class="att-summary-card">
        <div class="att-summary-number present">${presentCount}</div>
        <div class="att-summary-label">출석 중</div>
      </div>
      <div class="att-summary-card">
        <div class="att-summary-number late">${leftCount}</div>
        <div class="att-summary-label">하원</div>
      </div>
      <div class="att-summary-card">
        <div class="att-summary-number absent">${absentCount}</div>
        <div class="att-summary-label">미출석</div>
      </div>
    `;

    document.getElementById('attendanceList').innerHTML = attStudents.map(s => {
      const r = records[s.id];
      let statusClass, statusLabel, timeInfo;

      if (!r) {
        statusClass = 'absent';
        statusLabel = '미출석';
        timeInfo = '';
      } else if (r.outTime) {
        statusClass = 'late';
        statusLabel = '하원';
        timeInfo = `등원 ${r.inTime} · 하원 ${r.outTime}`;
      } else {
        statusClass = 'present';
        statusLabel = '출석 중';
        timeInfo = `등원 ${r.inTime}`;
      }

      return `
        <div class="att-item">
          <div class="att-avatar ${statusClass}">${escapeHtml(s.name.charAt(0))}</div>
          <div class="att-info">
            <div class="att-name">${escapeHtml(s.name)}</div>
            <div class="att-status">${statusLabel}${timeInfo ? ` · ${timeInfo}` : ''}</div>
          </div>
          <div class="att-school">${escapeHtml(s.school)}</div>
        </div>
      `;
    }).join('');
  }

  // 내 아이 출결도 갱신
  renderMyChildAttendance();
}

export function renderAttendance() {
  renderFromCache();
}

export function initAttendance() {
  // 로그인 전에는 구독하지 않음 (Firestore rules: students — isApproved)
  if (!isLoggedIn()) {
    if (unsubStudents) { unsubStudents(); unsubStudents = null; }
    if (unsubRecords) { unsubRecords(); unsubRecords = null; }
    cachedStudents = [];
    cachedRecords = {};
    renderFromCache();
    return;
  }

  // 이미 구독 중이면 re-render만
  if (unsubStudents) {
    renderFromCache();
    return;
  }

  // 스켈레톤 로딩 표시
  const attList = document.getElementById('attendanceList');
  if (attList) attList.innerHTML = skeletonRows(4);

  // Firestore 실시간 구독 — 학생 목록
  try {
    unsubStudents = subscribeStudents((students) => {
      cachedStudents = students;
      renderFromCache();
    });
  } catch (e) {
    console.warn('[useAttendance] 학생 구독 실패:', e);
    cachedStudents = JSON.parse(localStorage.getItem('att_students') || '[]');
    renderFromCache();
  }

  // Firestore 실시간 구독 — 오늘 출결 기록
  try {
    unsubRecords = subscribeTodayRecords((records) => {
      cachedRecords = records;
      renderFromCache();
    });
  } catch (e) {
    console.warn('[useAttendance] 출결 구독 실패:', e);
    const key = `att_${new Date().toISOString().split('T')[0]}`;
    cachedRecords = JSON.parse(localStorage.getItem(key) || '{}');
    renderFromCache();
  }
}

// window에 노출
// 이벤트 위임 등록
on('renderAttendance', () => renderAttendance());
