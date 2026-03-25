// ===== 아동 데이터 (데모용 — 나중에 DB로 교체) =====
const students = [
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
  document.getElementById('clock').textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

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
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < inputCode.length);
  });
}

function pressConfirm() {
  if (inputCode.length === 0) return;

  const code = inputCode.padStart(4, '0');
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
    // 첫 번째 태그 = 등원
    records[student.id] = { inTime: timeStr, outTime: null };
    type = 'in';
    typeLabel = '등원 완료';
  } else if (!records[student.id].outTime) {
    // 두 번째 태그 = 하원
    records[student.id].outTime = timeStr;
    type = 'out';
    typeLabel = '하원 완료';
  } else {
    // 이미 등하원 모두 완료 — 하원 시간 갱신
    records[student.id].outTime = timeStr;
    type = 'out';
    typeLabel = '하원 시간 수정';
  }

  saveTodayRecords(records);
  showSuccess(student, type, typeLabel, timeStr);
}

// ===== 성공 화면 =====
function showSuccess(student, type, typeLabel, timeStr) {
  document.getElementById('successIcon').textContent = type === 'in' ? '✓' : '→';
  document.getElementById('successIcon').className = 'success-icon' + (type === 'out' ? ' out' : '');
  document.getElementById('successName').textContent = student.name;
  document.getElementById('successType').textContent = typeLabel;
  document.getElementById('successTime').textContent = timeStr;

  // 문자 발송 시뮬레이션
  const smsMsg = type === 'in'
    ? `📱 ${student.parent} → "${student.name} 학생이 ${timeStr}에 등원하였습니다."`
    : `📱 ${student.parent} → "${student.name} 학생이 ${timeStr}에 하원하였습니다."`;
  document.getElementById('successSms').textContent = smsMsg;

  showScreen('screenSuccess');
  inputCode = '';
  updateDisplay();

  // 3초 후 메인으로
  setTimeout(() => {
    showScreen('screenMain');
  }, 3000);
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');

  // 관리 버튼 숨기기
  const toggle = document.getElementById('adminToggle');
  toggle.style.display = screenId === 'screenAdmin' ? 'none' : 'block';

  if (screenId === 'screenAdmin') {
    renderAdmin();
  }
}

// ===== 관리자 화면 =====
function toggleAdmin() {
  const pw = prompt('관리자 비밀번호를 입력하세요');
  if (pw === '1234') {
    showScreen('screenAdmin');
  } else if (pw !== null) {
    alert('비밀번호가 틀렸습니다.');
  }
}

function renderAdmin() {
  const now = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  document.getElementById('adminDate').textContent =
    `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 (${dayNames[now.getDay()]})`;

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

  document.getElementById('adminList').innerHTML = students.map(s => {
    const r = records[s.id];
    let status, statusClass, inTime, outTime;

    if (!r) {
      status = '미출석';
      statusClass = 'absent';
      inTime = '-';
      outTime = '-';
    } else if (r.outTime) {
      status = '하원';
      statusClass = 'left';
      inTime = r.inTime;
      outTime = r.outTime;
    } else {
      status = '출석 중';
      statusClass = 'present';
      inTime = r.inTime;
      outTime = '-';
    }

    return `
      <div class="att-row">
        <div class="att-row-avatar">${s.id}</div>
        <div class="att-row-info">
          <div class="att-row-name">${s.name}</div>
          <div class="att-row-school">${s.school}</div>
        </div>
        <div class="att-row-times">
          <div class="att-row-time in">등원 ${inTime}</div>
          <div class="att-row-time out">하원 ${outTime}</div>
        </div>
        <span class="att-row-status ${statusClass}">${status}</span>
      </div>
    `;
  }).join('');
}

// ===== 엑셀 내보내기 =====
function exportCSV() {
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

// ===== 초기화 =====
function resetToday() {
  if (confirm('오늘 출결 기록을 모두 삭제하시겠습니까?')) {
    localStorage.removeItem(TODAY_KEY);
    renderAdmin();
  }
}
