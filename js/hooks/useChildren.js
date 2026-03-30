// ===== useChildren: 아동관리 페이지 =====
import { onAuthChange } from '../../firebase/auth.js';
import { getUserDoc, isAdminRole } from '../../firebase/services/userService.js';
import { getAllStudentsWithContacts, createStudent, updateStudent, deleteStudent } from '../../firebase/services/studentService.js';
import { getRecordsByDate, getRecordsByMonth } from '../../firebase/services/attendanceService.js';
// [리뷰] 중복 todayKey 제거 → utils.js의 getDateKey 재사용
import { escapeHtml, getDateKey } from '../utils.js';

let _students = [];
let _editingDocId = null;
let _selectedStudentId = null;
// [보안] getDateKey로 로컬 시간대 기반 날짜 사용
let _attDate = getDateKey(new Date());

function formatDateDisplay(dateKey) {
  const d = new Date(dateKey + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function initChildren() {
  const root = document.getElementById('childrenRoot');
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
      <h1 class="mypage-title">아동 관리</h1>
    </div>

    <!-- 아동 등록/수정 폼 -->
    <div class="mypage-card ch-form-card">
      <div class="mypage-section-title" id="chFormTitle">아동 등록</div>
      <div class="ch-form">
        <div class="ch-form-row">
          <div class="ch-form-group">
            <label class="ch-label">번호 (4자리)</label>
            <input type="text" id="chId" class="input-field" maxlength="4" placeholder="0001" />
          </div>
          <div class="ch-form-group">
            <label class="ch-label">이름</label>
            <input type="text" id="chName" class="input-field" placeholder="홍길동" />
          </div>
        </div>
        <div class="ch-form-row">
          <div class="ch-form-group">
            <label class="ch-label">학교/학년</label>
            <input type="text" id="chSchool" class="input-field" placeholder="증산초 1학년" />
          </div>
          <div class="ch-form-group">
            <label class="ch-label">보호자 연락처</label>
            <input type="text" id="chParent" class="input-field" placeholder="010-1234-5678" />
          </div>
        </div>
        <div class="ch-form-actions">
          <button class="btn-upload" id="chSubmitBtn">추가</button>
          <button class="btn-secondary-sm ch-cancel-btn hidden" id="chCancelBtn">취소</button>
        </div>
      </div>
    </div>

    <!-- 날짜 선택 (출석 현황용) -->
    <div class="mypage-card date-nav ch-date-nav">
      <!-- [리뷰] 접근성: aria-label 추가 -->
      <button class="records-date-btn" id="chPrevDate" aria-label="이전 날짜">◀</button>
      <span class="records-date-label" id="chDateLabel">${formatDateDisplay(_attDate)}</span>
      <button class="records-date-btn" id="chNextDate" aria-label="다음 날짜">▶</button>
    </div>

    <!-- 아동 목록 -->
    <div class="mypage-card ch-list-card">
      <div class="mypage-section-title">아동 목록</div>
      <div id="chStudentList"><div class="loading-state">불러오는 중...</div></div>
    </div>

    <!-- 출석 이력 모달 -->
    <div class="modal-overlay" id="chHistoryOverlay">
      <div class="modal ch-history-modal">
        <div class="modal-title" id="chHistoryTitle">출석 이력</div>
        <button class="modal-close-x" id="chHistoryClose"></button>
        <div id="chHistoryContent"></div>
      </div>
    </div>
  `;

  document.getElementById('chSubmitBtn').addEventListener('click', saveStudent);
  document.getElementById('chCancelBtn').addEventListener('click', cancelEdit);
  document.getElementById('chPrevDate').addEventListener('click', () => changeAttDate(-1));
  document.getElementById('chNextDate').addEventListener('click', () => changeAttDate(1));
  document.getElementById('chHistoryClose').addEventListener('click', closeHistory);
  document.getElementById('chHistoryOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('chHistoryOverlay')) closeHistory();
  });

  loadStudents();
}

async function loadStudents() {
  try {
    const [students, records] = await Promise.all([
      getAllStudentsWithContacts(),
      getRecordsByDate(_attDate),
    ]);
    _students = students;
    renderStudentList(records);
  } catch (e) {
    console.error('[useChildren] 데이터 로드 실패:', e);
    document.getElementById('chStudentList').innerHTML =
      '<div class="empty-state">불러오기에 실패했습니다.</div>';
  }
}

function renderStudentList(records) {
  const el = document.getElementById('chStudentList');
  if (_students.length === 0) {
    el.innerHTML = '<div class="empty-state">등록된 아동이 없습니다.</div>';
    return;
  }
  el.innerHTML = _students.map(s => {
    const r = records ? records[s.id] : null;
    let attBadge = '<span class="ch-att-badge absent">미출석</span>';
    if (r) {
      if (r.outTime) {
        attBadge = `<span class="ch-att-badge left">하원 ${r.outTime}</span>`;
      } else {
        attBadge = `<span class="ch-att-badge present">출석 ${r.inTime}</span>`;
      }
    }
    return `
      <div class="ch-row">
        <div class="avatar-circle">${escapeHtml(s.id)}</div>
        <div class="ch-row-info">
          <div class="ch-row-name">${escapeHtml(s.name)}</div>
          <div class="ch-row-detail">${escapeHtml(s.school)} · ${escapeHtml(s.parent || '-')}</div>
        </div>
        <div class="ch-row-right">
          ${attBadge}
          <div class="ch-row-actions">
            <button class="btn-action-sm ch-history-btn" data-id="${escapeHtml(s.id)}" data-name="${escapeHtml(s.name)}">이력</button>
            <button class="btn-action-sm ch-edit-btn" data-docid="${escapeHtml(s.docId)}" data-id="${escapeHtml(s.id)}">수정</button>
            <button class="btn-action-sm ch-del-btn" data-docid="${escapeHtml(s.docId)}" data-name="${escapeHtml(s.name)}">삭제</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 이벤트 바인딩
  el.querySelectorAll('.ch-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => startEdit(btn.dataset.docid, btn.dataset.id));
  });
  el.querySelectorAll('.ch-del-btn').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete(btn.dataset.docid, btn.dataset.name));
  });
  el.querySelectorAll('.ch-history-btn').forEach(btn => {
    btn.addEventListener('click', () => openHistory(btn.dataset.id, btn.dataset.name));
  });
}

function changeAttDate(delta) {
  const d = new Date(_attDate + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  // [보안] getDateKey로 로컬 시간대 기반 날짜 생성
  _attDate = getDateKey(d);
  document.getElementById('chDateLabel').textContent = formatDateDisplay(_attDate);
  loadStudentsWithRecords();
}

// ===== 등록/수정 =====

async function saveStudent() {
  const submitBtn = document.getElementById('chSubmitBtn');
  if (submitBtn) submitBtn.disabled = true;
  try { await _doSaveStudent(); } finally { if (submitBtn) submitBtn.disabled = false; }
}

async function _doSaveStudent() {
  const id = document.getElementById('chId').value.trim().padStart(4, '0');
  const name = document.getElementById('chName').value.trim();
  const school = document.getElementById('chSchool').value.trim();
  const parent = document.getElementById('chParent').value.trim();

  if (!id || !name || !school || !parent) {
    showToast('모든 항목을 입력해주세요.', 'warning');
    return;
  }

  try {
    if (_editingDocId) {
      // 수정
      const dup = _students.find(s => s.id === id && s.docId !== _editingDocId);
      if (dup) { showToast('이미 사용 중인 번호입니다.', 'warning'); return; }
      await updateStudent(_editingDocId, { id, name, school, parent });
      showToast('수정되었습니다.', 'success');
      cancelEdit();
    } else {
      // 추가
      if (_students.some(s => s.id === id)) {
        showToast('이미 사용 중인 번호입니다.', 'warning');
        return;
      }
      await createStudent({ id, name, school, parent });
      showToast('추가되었습니다.', 'success');
      clearForm();
    }
    setTimeout(() => loadStudents(), 500);
  } catch (e) {
    console.error('[useChildren] 저장 실패:', e);
    showToast('저장에 실패했습니다.', 'error');
  }
}

function startEdit(docId, studentId) {
  const s = _students.find(st => st.docId === docId);
  if (!s) return;
  _editingDocId = docId;
  document.getElementById('chId').value = s.id;
  document.getElementById('chName').value = s.name;
  document.getElementById('chSchool').value = s.school;
  document.getElementById('chParent').value = s.parent || '';
  document.getElementById('chFormTitle').textContent = '아동 수정';
  document.getElementById('chSubmitBtn').textContent = '저장';
  document.getElementById('chCancelBtn').classList.remove('hidden');
  document.querySelector('.ch-form-card').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  _editingDocId = null;
  clearForm();
  document.getElementById('chFormTitle').textContent = '아동 등록';
  document.getElementById('chSubmitBtn').textContent = '추가';
  document.getElementById('chCancelBtn').classList.add('hidden');
}

function clearForm() {
  ['chId', 'chName', 'chSchool', 'chParent'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

async function confirmDelete(docId, name) {
  if (!await showConfirm(`'${escapeHtml(name)}' 아동을 삭제하시겠습니까?`)) return;
  try {
    await deleteStudent(docId);
    showToast('삭제되었습니다.', 'success');
    setTimeout(() => loadStudents(), 500);
  } catch (e) {
    console.error('[useChildren] 삭제 실패:', e);
    showToast('삭제에 실패했습니다.', 'error');
  }
}

// ===== 출석 이력 모달 =====

async function openHistory(studentId, name) {
  const overlay = document.getElementById('chHistoryOverlay');
  const content = document.getElementById('chHistoryContent');
  document.getElementById('chHistoryTitle').textContent = `${name} 출석 이력`;
  content.innerHTML = '<div class="loading-state">불러오는 중...</div>';
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  try {
    const now = new Date();
    const monthRecords = await getRecordsByMonth(now.getFullYear(), now.getMonth() + 1);

    const days = Object.keys(monthRecords).sort().reverse();
    if (days.length === 0) {
      content.innerHTML = '<div class="empty-state">이번 달 출석 기록이 없습니다.</div>';
      return;
    }

    const rows = days.map(dateKey => {
      const r = monthRecords[dateKey][studentId];
      if (!r) return null;
      const d = new Date(dateKey + 'T00:00:00');
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const label = `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()]})`;
      const status = r.outTime ? '하원완료' : '출석중';
      const statusClass = r.outTime ? 'left' : 'present';
      return `
        <div class="ch-history-row">
          <span class="ch-history-date">${label}</span>
          <span class="ch-history-time">${r.inTime}${r.outTime ? ` → ${r.outTime}` : ''}</span>
          <span class="records-status ${statusClass}">${status}</span>
        </div>
      `;
    }).filter(Boolean);

    content.innerHTML = rows.length > 0
      ? rows.join('')
      : '<div class="empty-state">이번 달 출석 기록이 없습니다.</div>';
  } catch (e) {
    console.error('[useChildren] 이력 로드 실패:', e);
    content.innerHTML = '<div class="empty-state">불러오기에 실패했습니다.</div>';
  }
}

function closeHistory() {
  document.getElementById('chHistoryOverlay').classList.remove('active');
  document.body.style.overflow = '';
}
