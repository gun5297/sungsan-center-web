// ===== useRecords: 출석기록 페이지 =====
import { onAuthChange } from '../../firebase/auth.js';
import { getUserDoc, isAdminRole } from '../../firebase/services/userService.js';
import { getRecordsByDate } from '../../firebase/services/attendanceService.js';
import { getAllStudents } from '../../firebase/services/studentService.js';
// [리뷰] 중복 todayKey 제거 → utils.js의 getDateKey 재사용
import { escapeHtml, escapeCSV, getDateKey } from '../utils.js';
// [보안] CSV 다운로드 감사 로그 기록
import { logAction } from '../../firebase/services/auditService.js';
import { on } from '../events.js';

// [보안] getDateKey로 로컬 시간대 기반 날짜 사용
let _currentDate = getDateKey(new Date());
let _students = [];
let _records = {};
let _filter = 'all';

// todayKey 제거됨 — getDateKey(new Date())를 직접 사용

function formatDateDisplay(dateKey) {
  const d = new Date(dateKey + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function initRecords() {
  const root = document.getElementById('recordsRoot');
  root.innerHTML = '<div class="loading-state mypage-loading-state">불러오는 중...</div>';

  onAuthChange(async (user) => {
    if (!user) { window.location.href = 'login.html'; return; }
    try {
      const userDoc = await getUserDoc(user.uid);
      if (!userDoc || !userDoc.approved || !isAdminRole(userDoc.role)) {
        window.location.href = 'login.html';
        return;
      }
      renderPage(root);
    } catch (e) {
      root.innerHTML = '<div class="empty-state mypage-loading-state">페이지를 불러올 수 없습니다.<br><a href="index.html">메인으로</a></div>';
    }
  });
}

function renderPage(root) {
  root.innerHTML = `
    <div class="mypage-header">
      <a href="index.html" class="mypage-back-link">← 메인으로</a>
      <h1 class="mypage-title">출석 기록</h1>
    </div>

    <div class="mypage-card date-nav">
      <!-- [리뷰] 접근성: aria-label 추가 -->
      <button class="records-date-btn" id="prevDate" aria-label="이전 날짜">◀</button>
      <span class="records-date-label" id="currentDateLabel">${formatDateDisplay(_currentDate)}</span>
      <button class="records-date-btn" id="nextDate" aria-label="다음 날짜">▶</button>
    </div>

    <div id="recordsSummary" class="records-summary"></div>
    <div id="recordsList"></div>

    <div class="mypage-card records-export-card">
      <button class="btn-upload" id="exportRecordsBtn">엑셀 다운로드</button>
    </div>
  `;

  document.getElementById('prevDate').addEventListener('click', () => changeDate(-1));
  document.getElementById('nextDate').addEventListener('click', () => changeDate(1));
  document.getElementById('exportRecordsBtn').addEventListener('click', exportCSV);

  loadAndRender();
}

async function loadAndRender() {
  document.getElementById('recordsList').innerHTML =
    '<div class="loading-state">불러오는 중...</div>';
  try {
    [_students, _records] = await Promise.all([
      getAllStudents(),
      getRecordsByDate(_currentDate),
    ]);
    renderSummary();
    renderTimeline();
  } catch (e) {
    console.error('[useRecords] 데이터 로드 실패:', e);
    document.getElementById('recordsList').innerHTML =
      '<div class="empty-state">불러오기에 실패했습니다.</div>';
  }
}

function changeDate(delta) {
  const d = new Date(_currentDate + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  _currentDate = getDateKey(d);
  _filter = 'all';
  document.getElementById('currentDateLabel').textContent = formatDateDisplay(_currentDate);
  loadAndRender();
}

function setRecordsFilter(filter) {
  _filter = _filter === filter ? 'all' : filter;
  renderSummary();
  renderTimeline();
}

on('setRecordsFilter', (e, el) => setRecordsFilter(el.dataset.filter));

function renderSummary() {
  let inCount = 0, outCount = 0, absentCount = 0;
  _students.forEach(s => {
    const r = _records[s.id];
    if (!r) absentCount++;
    else if (r.outTime) outCount++;
    else inCount++;
  });

  const active = (f) => _filter === f ? ' filter-active' : '';
  const dim = (f) => _filter !== 'all' && _filter !== f ? ' filter-dim' : '';
  const resetBtn = _filter !== 'all'
    ? `<div class="records-filter-reset-wrap"><button class="records-filter-reset-btn" data-action="setRecordsFilter" data-filter="all">✕ 전체보기</button></div>`
    : '';

  document.getElementById('recordsSummary').innerHTML = `
    <div class="records-summary-inner">
      <div class="records-summary-card${active('in')}${dim('in')}" data-action="setRecordsFilter" data-filter="in">
        <div class="records-summary-num in">${inCount}</div>
        <div class="records-summary-label">출석 중</div>
      </div>
      <div class="records-summary-card${active('out')}${dim('out')}" data-action="setRecordsFilter" data-filter="out">
        <div class="records-summary-num out">${outCount}</div>
        <div class="records-summary-label">하원 완료</div>
      </div>
      <div class="records-summary-card${active('absent')}${dim('absent')}" data-action="setRecordsFilter" data-filter="absent">
        <div class="records-summary-num absent">${absentCount}</div>
        <div class="records-summary-label">미출석</div>
      </div>
    </div>
    ${resetBtn}
  `;
}

function renderTimeline() {
  const allCheckedIn = _students
    .filter(s => _records[s.id])
    .sort((a, b) => (_records[a.id].inTs || 0) - (_records[b.id].inTs || 0));

  const allAbsent = _students.filter(s => !_records[s.id]);
  const listEl = document.getElementById('recordsList');

  if (_students.length === 0) {
    listEl.innerHTML = '<div class="empty-state">등록된 아동이 없습니다.</div>';
    return;
  }

  // 필터 적용
  let checkedIn, absent;
  if (_filter === 'in') {
    checkedIn = allCheckedIn.filter(s => !_records[s.id].outTime);
    absent = [];
  } else if (_filter === 'out') {
    checkedIn = allCheckedIn.filter(s => _records[s.id].outTime);
    absent = [];
  } else if (_filter === 'absent') {
    checkedIn = [];
    absent = allAbsent;
  } else {
    checkedIn = allCheckedIn;
    absent = allAbsent;
  }

  if (checkedIn.length === 0 && absent.length === 0) {
    listEl.innerHTML = '<div class="mypage-card records-timeline"><div class="empty-state">해당하는 아동이 없습니다.</div></div>';
    return;
  }

  let html = '<div class="mypage-card records-timeline">';

  if (checkedIn.length === 0 && _filter !== 'absent') {
    html += '<div class="empty-state">이 날 출석 기록이 없습니다.</div>';
  } else {
    html += checkedIn.map(s => {
      const r = _records[s.id];
      const statusClass = r.outTime ? 'left' : 'present';
      const statusLabel = r.outTime ? '하원' : '출석 중';
      const timeDisplay = r.outTime ? `${r.inTime} → ${r.outTime}` : r.inTime;
      return `
        <div class="records-item">
          <div class="records-item-time">${timeDisplay}</div>
          <div class="records-item-body">
            <div class="avatar-circle">${escapeHtml(s.id)}</div>
            <div class="records-info">
              <div class="records-name">${escapeHtml(s.name)}</div>
              <div class="records-school">${escapeHtml(s.school)}</div>
            </div>
            <span class="records-status ${statusClass}">${statusLabel}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  if (absent.length > 0) {
    html += `<div class="records-absent-title">미출석 (${absent.length}명)</div>`;
    html += `<div class="records-absent-list">`;
    html += absent.map(s => `
      <div class="records-absent-item">
        <div class="avatar-circle avatar-small">${escapeHtml(s.id)}</div>
        <span class="records-absent-name">${escapeHtml(s.name)}</span>
        <span class="records-absent-school">${escapeHtml(s.school)}</span>
      </div>
    `).join('');
    html += `</div>`;
  }

  html += '</div>';
  listEl.innerHTML = html;
}

async function exportCSV() {
  // [보안] 개인정보 다운로드 감사 로그 기록
  logAction('export', 'attendance', _currentDate, `출석 기록 CSV 다운로드 (${_currentDate})`);

  let csv = '번호,이름,학교,등원시간,하원시간,상태\n';
  _students.forEach(s => {
    const r = _records[s.id];
    let status, inTime, outTime;
    if (!r) { status = '미출석'; inTime = ''; outTime = ''; }
    else if (r.outTime) { status = '하원완료'; inTime = r.inTime; outTime = r.outTime; }
    else { status = '출석중'; inTime = r.inTime; outTime = ''; }
    csv += [s.id, s.name, s.school, inTime, outTime, status].map(escapeCSV).join(',') + '\n';
  });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `출석기록_${_currentDate}.csv`;
  link.click();
  // [보안] Blob URL 메모리 누수 방지
  URL.revokeObjectURL(link.href);
}
