// ===== useAttendance: 출석 현황 (메인 페이지 표시용) — Firestore 실시간 구독 =====

import { on } from '../events.js';
import { skeletonRows, escapeHtml, getDateKey } from '../utils.js';
import { subscribeTodayRecords } from '../../firebase/services/attendanceService.js';
import { subscribeStudents } from '../../firebase/services/studentService.js';
import { isLoggedIn } from '../state.js';

let cachedStudents = [];
let cachedRecords = {};
let unsubStudents = null;
let unsubRecords = null;
let _attFilter = 'all';

function setAttFilter(filter) {
  _attFilter = _attFilter === filter ? 'all' : filter;
  renderFromCache();
}

on('setAttFilter', (e, el) => setAttFilter(el.dataset.filter));

function renderFromCache() {
  const authWall = document.getElementById('attAuthWall');
  const content = document.getElementById('attLoggedContent');
  if (!authWall || !content) return;

  if (!isLoggedIn()) {
    authWall.style.display = '';
    content.style.display = 'none';
    return;
  }
  authWall.style.display = 'none';
  content.style.display = '';

  const attStudents = cachedStudents;
  const records = cachedRecords;

  if (attStudents.length === 0) {
    document.getElementById('attendanceSummary').innerHTML = '';
    document.getElementById('attendanceList').innerHTML =
      '<div class="empty-state">출결 시스템에 등록된 아동이 없습니다</div>';
    return;
  }

  let presentCount = 0, leftCount = 0, absentCount = 0;
  attStudents.forEach(s => {
    const r = records[s.id];
    if (!r) absentCount++;
    else if (r.outTime) leftCount++;
    else presentCount++;
  });

  const active = (f) => _attFilter === f ? ' filter-active' : '';
  const dim = (f) => _attFilter !== 'all' && _attFilter !== f ? ' filter-dim' : '';
  const resetBtn = _attFilter !== 'all'
    ? `<div class="att-filter-reset-wrap"><button class="att-filter-reset-btn" data-action="setAttFilter" data-filter="all">✕ 전체보기</button></div>`
    : '';

  document.getElementById('attendanceSummary').innerHTML = `
    <div class="att-summary-grid">
      <div class="att-summary-card${active('present')}${dim('present')}" data-action="setAttFilter" data-filter="present">
        <div class="att-summary-number present">${presentCount}</div>
        <div class="att-summary-label">출석 중</div>
      </div>
      <div class="att-summary-card${active('left')}${dim('left')}" data-action="setAttFilter" data-filter="left">
        <div class="att-summary-number late">${leftCount}</div>
        <div class="att-summary-label">하원</div>
      </div>
      <div class="att-summary-card${active('absent')}${dim('absent')}" data-action="setAttFilter" data-filter="absent">
        <div class="att-summary-number absent">${absentCount}</div>
        <div class="att-summary-label">미출석</div>
      </div>
    </div>
    ${resetBtn}
  `;

  // 필터 적용
  let filtered;
  if (_attFilter === 'present') {
    filtered = attStudents.filter(s => records[s.id] && !records[s.id].outTime);
  } else if (_attFilter === 'left') {
    filtered = attStudents.filter(s => records[s.id] && records[s.id].outTime);
  } else if (_attFilter === 'absent') {
    filtered = attStudents.filter(s => !records[s.id]);
  } else {
    filtered = attStudents;
  }

  if (filtered.length === 0) {
    document.getElementById('attendanceList').innerHTML =
      '<div class="empty-state">해당하는 아동이 없습니다.</div>';
    return;
  }

  document.getElementById('attendanceList').innerHTML = filtered.map(s => {
    const r = records[s.id];
    let statusClass, statusLabel, timeInfo;

    if (!r) {
      statusClass = 'absent';
      statusLabel = '미출석';
      timeInfo = '';
    } else if (r.outTime) {
      statusClass = 'late';
      statusLabel = '하원';
      timeInfo = `<span class="att-time-detail">등원 ${r.inTime} · 하원 ${r.outTime}</span>`;
    } else {
      statusClass = 'present';
      statusLabel = '출석 중';
      timeInfo = `<span class="att-time-detail">등원 ${r.inTime}</span>`;
    }

    return `
      <div class="att-item">
        <div class="att-avatar ${statusClass}">${escapeHtml(s.name.charAt(0))}</div>
        <div class="att-info">
          <div class="att-name">${escapeHtml(s.name)}</div>
          <div class="att-status"><span class="att-status-badge ${statusClass}">${statusLabel}</span>${timeInfo}</div>
        </div>
        <div class="att-school">${escapeHtml(s.school)}</div>
      </div>
    `;
  }).join('');
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
    _attFilter = 'all';
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
    // [보안] getDateKey로 로컬 시간대 기반 날짜 사용
    const key = `att_${getDateKey(new Date())}`;
    cachedRecords = JSON.parse(localStorage.getItem(key) || '{}');
    renderFromCache();
  }
}

// 이벤트 위임 등록
on('renderAttendance', () => renderAttendance());
