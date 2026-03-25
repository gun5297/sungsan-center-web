// ===== 종소리 (Web Audio API) =====
function playBell(type) {
  const AudioCtx = window.AudioContext || window['webkitAudioContext'];
  const ctx = new AudioCtx();

  function playTone(freq, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const osc2 = ctx.createOscillator(); // 배음 (더 풍부한 종소리)
    const gain2 = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2.756; // 종 특유의 배음 비율

    // 메인 톤 엔벨로프: 빠른 어택, 긴 디케이
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // 배음 엔벨로프
    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
    osc2.start(startTime);
    osc2.stop(startTime + duration);
  }

  if (type === 'in') {
    // 등원: 솔→도 올라가는 맑은 두 음
    playTone(784.0, ctx.currentTime, 0.8);       // G5
    playTone(1046.5, ctx.currentTime + 0.22, 1.2); // C6
  } else {
    // 하원: 미→도 내려가는 부드러운 두 음
    playTone(659.3, ctx.currentTime, 0.8);        // E5
    playTone(523.3, ctx.currentTime + 0.22, 1.2); // C5
  }
}

// ===== 출결 시스템 비밀번호 =====
const ATT_PASSWORD = '1234';

// ===== 아동 데이터 (localStorage 저장) =====
const STUDENTS_KEY = 'att_students';

const DEFAULT_STUDENTS = [
  { id: '0001', name: '홍길동', school: '증산초 1학년', parent: '010-1234-5678' },
  { id: '0002', name: '홍길동', school: '증산초 2학년', parent: '010-2345-6789' },
  { id: '0003', name: '홍길동', school: '수색초 1학년', parent: '010-3456-7890' },
  { id: '0004', name: '홍길동', school: '수색초 2학년', parent: '010-4567-8901' },
  { id: '0005', name: '홍길동', school: '증산초 3학년', parent: '010-5678-9012' },
  { id: '0006', name: '홍길동', school: '증산중 1학년', parent: '010-6789-0123' },
  { id: '0007', name: '홍길동', school: '증산초 1학년', parent: '010-7890-1234' },
  { id: '0008', name: '홍길동', school: '수색초 3학년', parent: '010-8901-2345' },
  { id: '0009', name: '홍길동', school: '증산중 2학년', parent: '010-9012-3456' },
  { id: '0010', name: '홍길동', school: '증산초 2학년', parent: '010-0123-4567' },
];

function getStudents() {
  const saved = localStorage.getItem(STUDENTS_KEY);
  if (!saved) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(DEFAULT_STUDENTS));
    return [...DEFAULT_STUDENTS];
  }
  return JSON.parse(saved);
}

function saveStudents(list) {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
}

// ===== 오늘 출결 기록 (localStorage) =====
const TODAY_KEY = `att_${new Date().toISOString().split('T')[0]}`;

function getTodayRecords() {
  return JSON.parse(localStorage.getItem(TODAY_KEY) || '{}');
}

function saveTodayRecords(records) {
  localStorage.setItem(TODAY_KEY, JSON.stringify(records));
}

// ===== 시계 =====
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const el = document.getElementById('clock');
  if (el) el.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// ===== 잠금 화면 =====
let lockCode = '';

function pressLock(n) {
  if (lockCode.length >= 4) return;
  lockCode += n;
  updateLockDots();
}

function pressLockDelete() {
  lockCode = lockCode.slice(0, -1);
  updateLockDots();
  document.getElementById('lockError').classList.add('hidden');
}

function updateLockDots() {
  const dots = document.querySelectorAll('#lockDots .dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < lockCode.length);
  });
}

function pressLockConfirm() {
  if (lockCode.length === 0) return;

  if (lockCode === ATT_PASSWORD) {
    showScreen('screenMain');
    // 뒤로가기 방지: 히스토리에 상태 추가
    history.pushState({ screen: 'main' }, '');
    lockCode = '';
    updateLockDots();
    document.getElementById('lockError').classList.add('hidden');
  } else {
    document.getElementById('lockError').classList.remove('hidden');
    lockCode = '';
    updateLockDots();
    // 흔들림 효과
    const dots = document.getElementById('lockDots');
    dots.classList.add('shake');
    setTimeout(() => dots.classList.remove('shake'), 500);
  }
}

// ===== 번호 입력 =====
let inputCode = '';

function pressNum(n) {
  if (inputCode.length >= 4) return;
  inputCode += n;
  updateDisplay();
}

function pressDelete() {
  inputCode = inputCode.slice(0, -1);
  updateDisplay();
}

function updateDisplay() {
  document.getElementById('inputNumber').textContent = inputCode;
  const dots = document.querySelectorAll('#inputDots .dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < inputCode.length);
  });
}

function pressConfirm() {
  if (inputCode.length === 0) return;

  const code = inputCode.padStart(4, '0');
  const students = getStudents();
  const student = students.find(s => s.id === code);

  if (!student) {
    showError();
    return;
  }

  recordAttendance(student);
}

function showError() {
  const greeting = document.getElementById('greeting');
  greeting.textContent = '등록되지 않은 번호입니다';
  greeting.style.color = '#ef4444';
  inputCode = '';
  updateDisplay();

  setTimeout(() => {
    greeting.textContent = '번호를 입력하세요';
    greeting.style.color = '';
  }, 2000);
}

// ===== 출결 기록 =====
function recordAttendance(student) {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const records = getTodayRecords();

  let type, typeLabel;

  if (!records[student.id]) {
    records[student.id] = { inTime: timeStr, inTs: Date.now(), outTime: null, outTs: null };
    type = 'in';
    typeLabel = '등원 완료';
  } else if (!records[student.id].outTime) {
    records[student.id].outTime = timeStr;
    records[student.id].outTs = Date.now();
    type = 'out';
    typeLabel = '하원 완료';
  } else {
    records[student.id].outTime = timeStr;
    records[student.id].outTs = Date.now();
    type = 'out';
    typeLabel = '하원 시간 수정';
  }

  saveTodayRecords(records);
  playBell(type);
  showSuccess(student, type, typeLabel, timeStr);
}

// ===== 성공 화면 =====
function showSuccess(student, type, typeLabel, timeStr) {
  document.getElementById('successIcon').textContent = type === 'in' ? '✓' : '→';
  document.getElementById('successIcon').className = 'success-icon' + (type === 'out' ? ' out' : '');
  document.getElementById('successName').textContent = student.name;
  document.getElementById('successType').textContent = typeLabel;
  document.getElementById('successTime').textContent = timeStr;

  const action = type === 'in' ? '등원' : '하원';
  const smsMsg = `📱 ${student.parent} → "${student.name} 학생이 ${timeStr}에 ${action}하였습니다."`;
  document.getElementById('successSms').innerHTML =
    `${smsMsg}<br><span style="font-size:0.85em;opacity:0.8;">⏱ 1분 후 자동 발송 예정 · 1분 내 취소 가능</span>`;

  showScreen('screenSuccess');
  inputCode = '';
  updateDisplay();

  setTimeout(() => {
    showScreen('screenMain');
  }, 3000);
}

let adminRefreshInterval = null;

function startAdminRefresh() {
  if (adminRefreshInterval) return;
  adminRefreshInterval = setInterval(() => {
    const panel = document.getElementById('panelRecords');
    if (panel && !panel.classList.contains('hidden')) {
      renderTimeline();
    }
  }, 1000);
}

function stopAdminRefresh() {
  if (adminRefreshInterval) {
    clearInterval(adminRefreshInterval);
    adminRefreshInterval = null;
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');

  // 관리 버튼: 메인 화면에서만 표시
  const toggle = document.getElementById('adminToggle');
  toggle.style.display = (screenId === 'screenMain') ? 'block' : 'none';

  if (screenId === 'screenAdmin') {
    renderAdmin();
    startAdminRefresh();
  } else {
    stopAdminRefresh();
  }
}

// ===== 관리 화면 =====
function goAdmin() {
  showScreen('screenAdmin');
  switchAdminTab('records');
}

// 탭 전환
function switchAdminTab(tab) {
  document.getElementById('tabRecords').classList.toggle('active', tab === 'records');
  document.getElementById('tabManage').classList.toggle('active', tab === 'manage');
  document.getElementById('panelRecords').classList.toggle('hidden', tab !== 'records');
  document.getElementById('panelManage').classList.toggle('hidden', tab !== 'manage');

  if (tab === 'records') {
    renderAdmin();
  }
}

function renderAdmin() {
  const now = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  document.getElementById('adminDate').textContent =
    `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 (${dayNames[now.getDay()]})`;

  const students = getStudents();
  const records = getTodayRecords();

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

  renderTimeline();
}

function renderTimeline() {
  const students = getStudents();
  const records = getTodayRecords();
  const now = Date.now();

  // 출석한 학생만 inTs 기준 시간순 정렬
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
      ? `<button class="cancel-btn" onclick="cancelAttendance('${s.id}')">출석 취소 (${remaining}초)</button>`
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

function cancelAttendance(studentId) {
  const records = getTodayRecords();
  if (!records[studentId]) return;
  const elapsed = records[studentId].inTs ? Date.now() - records[studentId].inTs : Infinity;
  if (elapsed >= 60000) return;
  if (!confirm('출석을 취소하시겠습니까?\n문자 발송도 취소됩니다.')) return;
  delete records[studentId];
  saveTodayRecords(records);
  renderAdmin();
}

// ===== 아동 관리 (비밀번호 게이트) =====
let manageUnlocked = false;
let editingStudentId = null;

function unlockManage() {
  const pw = document.getElementById('managePw').value;
  if (pw === ATT_PASSWORD) {
    manageUnlocked = true;
    document.getElementById('manageLock').classList.add('hidden');
    document.getElementById('manageUnlocked').classList.remove('hidden');
    document.getElementById('managePw').value = '';
    document.getElementById('manageLockError').classList.add('hidden');
    renderStudentList();
  } else {
    document.getElementById('manageLockError').classList.remove('hidden');
  }
}

function renderStudentList() {
  const students = getStudents();
  const list = document.getElementById('manageStudentList');

  if (students.length === 0) {
    list.innerHTML = '<div class="manage-empty">등록된 아동이 없습니다</div>';
    return;
  }

  list.innerHTML = students.map(s => `
    <div class="manage-row">
      <div class="manage-row-id">${s.id}</div>
      <div class="manage-row-info">
        <div class="manage-row-name">${s.name}</div>
        <div class="manage-row-detail">${s.school} · ${s.parent}</div>
      </div>
      <div class="manage-row-actions">
        <button class="manage-edit-btn" onclick="editStudent('${s.id}')">수정</button>
        <button class="manage-del-btn" onclick="deleteStudent('${s.id}')">삭제</button>
      </div>
    </div>
  `).join('');
}

function addStudent() {
  const id = document.getElementById('stuId').value.trim().padStart(4, '0');
  const name = document.getElementById('stuName').value.trim();
  const school = document.getElementById('stuSchool').value.trim();
  const parent = document.getElementById('stuParent').value.trim();

  if (!id || !name || !school || !parent) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  const students = getStudents();

  if (editingStudentId) {
    // 수정 모드
    const idx = students.findIndex(s => s.id === editingStudentId);
    if (idx !== -1) {
      // 번호가 변경되었고 중복이면 거부
      if (id !== editingStudentId && students.some(s => s.id === id)) {
        alert('이미 사용 중인 번호입니다.');
        return;
      }
      students[idx] = { id, name, school, parent };
    }
    editingStudentId = null;
    document.getElementById('stuSubmitBtn').textContent = '추가';
    document.getElementById('stuCancelBtn').classList.add('hidden');
  } else {
    // 추가 모드
    if (students.some(s => s.id === id)) {
      alert('이미 사용 중인 번호입니다.');
      return;
    }
    students.push({ id, name, school, parent });
  }

  saveStudents(students);
  clearStudentForm();
  renderStudentList();
}

function editStudent(id) {
  const students = getStudents();
  const s = students.find(st => st.id === id);
  if (!s) return;

  editingStudentId = id;
  document.getElementById('stuId').value = s.id;
  document.getElementById('stuName').value = s.name;
  document.getElementById('stuSchool').value = s.school;
  document.getElementById('stuParent').value = s.parent;
  document.getElementById('stuSubmitBtn').textContent = '저장';
  document.getElementById('stuCancelBtn').classList.remove('hidden');

  // 폼으로 스크롤
  document.querySelector('.manage-form').scrollIntoView({ behavior: 'smooth' });
}

function cancelEditStudent() {
  editingStudentId = null;
  document.getElementById('stuSubmitBtn').textContent = '추가';
  document.getElementById('stuCancelBtn').classList.add('hidden');
  clearStudentForm();
}

function deleteStudent(id) {
  if (!confirm('이 아동을 삭제하시겠습니까?')) return;
  let students = getStudents();
  students = students.filter(s => s.id !== id);
  saveStudents(students);
  renderStudentList();
}

function clearStudentForm() {
  document.getElementById('stuId').value = '';
  document.getElementById('stuName').value = '';
  document.getElementById('stuSchool').value = '';
  document.getElementById('stuParent').value = '';
}

// ===== 엑셀 내보내기 =====
function exportCSV() {
  const students = getStudents();
  const records = getTodayRecords();
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
}

// ===== 메인으로 돌아가기 (비밀번호 필요) =====
function backToMain() {
  const pw = prompt('비밀번호를 입력하세요');
  if (pw === ATT_PASSWORD) {
    window.location.href = 'index.html';
  } else if (pw !== null) {
    alert('비밀번호가 틀렸습니다.');
  }
}

// ===== 초기화 =====
function resetToday() {
  if (confirm('오늘 출결 기록을 모두 삭제하시겠습니까?')) {
    localStorage.removeItem(TODAY_KEY);
    renderAdmin();
  }
}

// ===== 브라우저 뒤로가기 방지 =====
// 초기 히스토리 상태 설정
history.replaceState({ screen: 'lock' }, '');

window.addEventListener('popstate', function(e) {
  // 현재 메인(번호입력) 화면이면 뒤로가기 시 비밀번호 요구
  const mainScreen = document.getElementById('screenMain');
  if (mainScreen && !mainScreen.classList.contains('hidden')) {
    // 히스토리를 다시 push해서 실제로 뒤로 가지 않게 함
    history.pushState({ screen: 'main' }, '');
    const pw = prompt('메인으로 돌아가려면 비밀번호를 입력하세요');
    if (pw === ATT_PASSWORD) {
      window.location.href = 'index.html';
    }
  }
});
