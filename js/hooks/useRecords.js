// ===== useRecords: 출석기록 페이지 =====
import { onAuthChange } from '../../firebase/auth.js';
import { getUserDoc, isAdminRole } from '../../firebase/services/userService.js';
import { getRecordsByDate } from '../../firebase/services/attendanceService.js';
import { getAllStudents } from '../../firebase/services/studentService.js';
import { escapeHtml, escapeCSV } from '../utils.js';

let _currentDate = todayKey();
let _students = [];
let _records = {};

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

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
      <h1 class="mypage-title">출석기록</h1>
    </div>

    <div class="mypage-card date-nav">
      <button class="records-date-btn" id="prevDate">◀</button>
      <span class="records-date-label" id="currentDateLabel">${formatDateDisplay(_currentDate)}</span>
      <button class="records-date-btn" id="nextDate">▶</button>
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
  _currentDate = d.toISOString().split('T')[0];
  document.getElementById('currentDateLabel').textContent = formatDateDisplay(_currentDate);
  loadAndRender();
}

function renderSummary() {
  let inCount = 0, outCount = 0, absentCount = 0;
  _students.forEach(s => {
    const r = _records[s.id];
    if (!r) absentCount++;
    else if (r.outTime) outCount++;
    else inCount++;
  });
  document.getElementById('recordsSummary').innerHTML = `
    <div class="records-summary-inner">
      <div class="records-summary-card">
        <div class="records-summary-num in">${inCount}</div>
        <div class="records-summary-label">출석 중</div>
      </div>
      <div class="records-summary-card">
        <div class="records-summary-num out">${outCount}</div>
        <div class="records-summary-label">하원 완료</div>
      </div>
      <div class="records-summary-card">
        <div class="records-summary-num absent">${absentCount}</div>
        <div class="records-summary-label">미출석</div>
      </div>
    </div>
  `;
}

function renderTimeline() {
  const checkedIn = _students
    .filter(s => _records[s.id])
    .sort((a, b) => (_records[a.id].inTs || 0) - (_records[b.id].inTs || 0));

  const absent = _students.filter(s => !_records[s.id]);
  const listEl = document.getElementById('recordsList');

  if (_students.length === 0) {
    listEl.innerHTML = '<div class="empty-state">등록된 아동이 없습니다.</div>';
    return;
  }

  let html = '<div class="mypage-card records-timeline">';

  if (checkedIn.length === 0) {
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
  link.download = `출결기록_${_currentDate}.csv`;
  link.click();
}
