// ===== Fade-up animation on scroll =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ===== 공지사항 / 가정통신문 =====
let notices = [
  {
    id: 0,
    title: '3월 30일(월) 특식 안내 - 돈까스',
    content: '안녕하세요, 성산지역아동센터입니다.\n\n3월 30일(월) 아이들과 함께 외식을 나갑니다!\n\n🍽️ 메뉴: 돈까스\n📍 장소: 추후 안내\n🕐 시간: 점심시간\n\n맛있는 돈까스 먹으러 가요! 기대해 주세요.\n\n감사합니다.',
    category: '통신문',
    date: '2026.03.25',
    file: null
  },
  {
    id: 1,
    title: '3월 현장학습 안내',
    content: '안녕하세요, 성산지역아동센터입니다.\n\n3월 28일(금) 봄맞이 현장학습을 진행합니다.\n\n장소: OO공원\n시간: 오전 10시 ~ 오후 2시\n준비물: 도시락, 물, 돗자리\n\n참가 동의서를 3월 25일까지 제출해 주세요.\n\n감사합니다.',
    category: '통신문',
    date: '2026.03.22',
    file: '현장학습_동의서.pdf'
  },
  {
    id: 2,
    title: '4월 특별활동 프로그램 변경 안내',
    content: '안녕하세요.\n\n4월부터 특별활동 프로그램이 아래와 같이 변경됩니다.\n\n문의사항은 담임 선생님께 연락 주세요.',
    category: '공지',
    date: '2026.03.20',
    file: null
  },
  {
    id: 3,
    title: '수족구병 주의 안내',
    content: '최근 수족구병이 유행하고 있습니다.\n\n아이에게 발열, 입안 물집, 손발 발진 등의 증상이 있을 경우 등원을 자제하시고 병원 진료를 받아주세요.\n\n센터 내 소독을 강화하고 있으며, 손씻기 지도를 철저히 하겠습니다.',
    category: '긴급',
    date: '2026.03.18',
    file: null
  }
];

// 선생님 비밀번호 (원하는 걸로 변경하세요)
const TEACHER_PASSWORD = '1234';

function showPasswordPrompt() {
  const lockDiv = document.getElementById('teacherLock');
  const btn = lockDiv.querySelector('.btn-teacher-login');
  btn.style.display = 'none';

  const prompt = document.createElement('div');
  prompt.className = 'password-prompt';
  prompt.innerHTML = `
    <input type="password" id="pwInput" placeholder="비밀번호를 입력하세요" />
    <button onclick="checkPassword()">확인</button>
  `;
  lockDiv.appendChild(prompt);

  const input = document.getElementById('pwInput');
  input.focus();
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPassword();
  });
}

function checkPassword() {
  const input = document.getElementById('pwInput');
  if (input.value === TEACHER_PASSWORD) {
    document.getElementById('teacherLock').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
  } else {
    alert('비밀번호가 틀렸습니다.');
    input.value = '';
    input.focus();
  }
}

// 파일 선택
document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    document.getElementById('fileName').textContent = file.name;
  }
});

function addNotice() {
  const title = document.getElementById('noticeTitle').value.trim();
  const content = document.getElementById('noticeContent').value.trim();
  const category = document.getElementById('noticeCategory').value;
  const fileInput = document.getElementById('fileInput');
  const fileName = fileInput.files[0] ? fileInput.files[0].name : null;

  if (!title || !content) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  notices.unshift({
    id: Date.now(),
    title,
    content,
    category,
    date: dateStr,
    file: fileName
  });

  document.getElementById('noticeTitle').value = '';
  document.getElementById('noticeContent').value = '';
  document.getElementById('fileName').textContent = '';
  fileInput.value = '';

  renderNotices();
}

function renderNotices() {
  const list = document.getElementById('noticeList');
  list.innerHTML = notices.map(n => `
    <div class="notice-card" onclick="openNotice(${n.id})">
      <div class="notice-header">
        <span class="notice-badge type-${n.category}">${n.category}</span>
        <span class="notice-date">${n.date}</span>
      </div>
      <div class="notice-title">${n.title}</div>
      <div class="notice-preview">${n.content}</div>
      ${n.file ? `<div class="notice-file">📎 ${n.file}</div>` : ''}
    </div>
  `).join('');
}

function openNotice(id) {
  const notice = notices.find(n => n.id === id);
  if (!notice) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${notice.title}</div>
      <div class="modal-meta">
        <span class="notice-badge type-${notice.category}">${notice.category}</span>
        <span class="notice-date">${notice.date}</span>
      </div>
      <div class="modal-body">${notice.content}</div>
      ${notice.file ? `<div class="notice-file" style="margin-top:16px">📎 ${notice.file}</div>` : ''}
      <button class="modal-close" onclick="closeModal(this)">닫기</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.querySelector('.modal-close'));
  });
}

function closeModal(btn) {
  const overlay = btn.closest('.modal-overlay');
  overlay.classList.remove('active');
  setTimeout(() => overlay.remove(), 300);
}

renderNotices();

// ===== 캘린더 / 시간표 =====
let currentDate = new Date();
let selectedDate = new Date();

// 학사일정 이벤트 (증산중학교 + 증산초등학교 + 수색초등학교 2026학년도)
// 날짜 키: 'YYYY-MM-DD'
const schoolEvents = {
  // === 3월 ===
  '2026-03-02': ['[증산초/수색초] 개학식·입학식', '[증산중] 개학식·입학식'],
  '2026-03-09': ['[증산중] 학급임원선거'],
  '2026-03-13': ['[증산초/수색초] 학부모 상담주간 시작'],
  '2026-03-20': ['[증산초/수색초] 학부모 상담주간 종료'],

  // === 4월 ===
  '2026-04-06': ['[증산초/수색초] 과학의 날 행사'],
  '2026-04-17': ['[증산중] 학부모 상담주간 시작'],
  '2026-04-24': ['[증산중] 학부모 상담주간 종료'],
  '2026-04-27': ['[증산중] 1학기 중간고사 시작'],
  '2026-04-29': ['[증산중] 1학기 중간고사 종료'],

  // === 5월 ===
  '2026-05-05': ['어린이날 (휴일)'],
  '2026-05-15': ['스승의 날'],
  '2026-05-24': ['[증산중] 석가탄신일 (휴일)'],
  '2026-05-25': ['[증산초/수색초] 봄 현장체험학습'],

  // === 6월 ===
  '2026-06-06': ['현충일 (휴일)'],
  '2026-06-15': ['[증산초/수색초] 학예회'],
  '2026-06-29': ['[증산중] 1학기 기말고사 시작'],

  // === 7월 ===
  '2026-07-01': ['[증산중] 1학기 기말고사 종료'],
  '2026-07-10': ['[증산초/수색초] 여름 방학식'],
  '2026-07-15': ['[증산중] 여름 방학식'],
  '2026-07-17': ['제헌절'],

  // === 8월 ===
  '2026-08-15': ['광복절 (휴일)'],
  '2026-08-24': ['[증산초/수색초] 2학기 개학식'],
  '2026-08-26': ['[증산중] 2학기 개학식'],

  // === 9월 ===
  '2026-09-14': ['[증산초/수색초] 가을 현장체험학습'],
  '2026-09-24': ['추석연휴 시작 (휴일)'],
  '2026-09-25': ['추석 (휴일)'],
  '2026-09-26': ['추석연휴 종료 (휴일)'],

  // === 10월 ===
  '2026-10-03': ['개천절 (휴일)'],
  '2026-10-05': ['[증산초/수색초] 운동회'],
  '2026-10-09': ['한글날 (휴일)'],
  '2026-10-19': ['[증산중] 2학기 중간고사 시작'],
  '2026-10-21': ['[증산중] 2학기 중간고사 종료'],

  // === 11월 ===
  '2026-11-19': ['수능일 (휴일/자율)'],
  '2026-11-30': ['[증산중] 2학기 기말고사 시작'],

  // === 12월 ===
  '2026-12-02': ['[증산중] 2학기 기말고사 종료'],
  '2026-12-18': ['[증산초/수색초] 겨울 방학식'],
  '2026-12-22': ['[증산중] 겨울 방학식'],
  '2026-12-25': ['성탄절 (휴일)'],

  // === 2027년 1~2월 ===
  '2027-01-05': ['[증산중] 졸업식'],
  '2027-02-10': ['[증산초/수색초] 졸업식'],
  '2027-02-12': ['[증산초/수색초] 수료식'],
};

// 일별 시간표: 평일은 자유시간
const weekdaySchedule = {
  1: [{ time: '09:00 ~ 19:00', name: '자유시간', type: '' }],
  2: [{ time: '09:00 ~ 19:00', name: '자유시간', type: '' }],
  3: [{ time: '09:00 ~ 19:00', name: '자유시간', type: '' }],
  4: [{ time: '09:00 ~ 19:00', name: '자유시간', type: '' }],
  5: [{ time: '09:00 ~ 19:00', name: '자유시간', type: '' }],
};

function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  document.getElementById('monthLabel').textContent = `${year}년 ${month + 1}월`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  let html = '';
  const headers = ['일', '월', '화', '수', '목', '금', '토'];
  headers.forEach(h => {
    html += `<div class="cal-header">${h}</div>`;
  });

  // 이전 달
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="cal-day other-month"><span class="cal-num">${daysInPrev - i}</span></div>`;
  }

  // 이번 달
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isSelected = d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
    const dateKey = getDateKey(date);
    const events = schoolEvents[dateKey];

    let classes = 'cal-day';
    if (isToday) classes += ' today';
    if (isSelected && !isToday) classes += ' selected';
    if (dayOfWeek === 0) classes += ' sunday';
    if (dayOfWeek === 6) classes += ' saturday';

    let eventsHtml = '';
    if (events) {
      eventsHtml = '<div class="cal-events">' + events.map(ev => {
        let tagClass = 'cal-event-tag';
        if (ev.includes('휴일') || ev.includes('성탄절') || ev.includes('제헌절')) {
          tagClass += ' holiday';
        } else if (ev.includes('증산초') && ev.includes('수색초')) {
          // 두 초등학교 공통이면 각각 태그 생성
          const shortName = ev.replace(/\[.*?\]\s*/g, '');
          return `<span class="${tagClass} 증산초">${shortName}</span><span class="${tagClass} 수색초">${shortName}</span>`;
        } else if (ev.includes('증산초')) {
          tagClass += ' 증산초';
        } else if (ev.includes('수색초')) {
          tagClass += ' 수색초';
        } else if (ev.includes('증산중')) {
          tagClass += ' 증산중';
        } else {
          tagClass += ' holiday';
        }
        const shortName = ev.replace(/\[.*?\]\s*/g, '');
        return `<span class="${tagClass}">${shortName}</span>`;
      }).join('') + '</div>';
    }

    html += `<div class="${classes}" onclick="selectDay(${d})"><span class="cal-num">${d}</span>${eventsHtml}</div>`;
  }

  // 다음 달
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="cal-day other-month"><span class="cal-num">${i}</span></div>`;
  }

  document.getElementById('calendar').innerHTML = html;
}

function selectDay(day) {
  selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
  renderCalendar();
  renderDaySchedule();
}

function renderDaySchedule() {
  const dayOfWeek = selectedDate.getDay();
  const dateStr = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dateKey = getDateKey(selectedDate);

  document.getElementById('dayTitle').textContent = `${dateStr} (${dayNames[dayOfWeek]})`;

  const timetable = document.getElementById('timetable');
  let html = '';

  // 학사일정 이벤트 표시
  const events = schoolEvents[dateKey];
  if (events) {
    html += events.map(ev => `
      <div class="time-slot" style="border-left: 3px solid var(--primary);">
        <div class="time-dot special"></div>
        <div class="time-name">${ev}</div>
      </div>
    `).join('');
  }

  // 시간표
  const schedule = weekdaySchedule[dayOfWeek];
  if (!schedule) {
    html += '<div style="text-align:center;padding:32px;color:var(--text-sub);font-weight:600;">주말은 휴원입니다</div>';
  } else {
    html += schedule.map(s => `
      <div class="time-slot">
        <div class="time-text">${s.time}</div>
        <div class="time-dot ${s.type}"></div>
        <div class="time-name">${s.name}</div>
      </div>
    `).join('');
  }

  timetable.innerHTML = html;
}

renderCalendar();
renderDaySchedule();

// ===== 식단표 =====
let mealWeekOffset = 0;

const sampleMeals = {
  lunch: [
    '쌀밥\n된장찌개\n제육볶음\n시금치나물\n깍두기',
    '잡곡밥\n미역국\n생선구이\n콩나물무침\n배추김치',
    '쌀밥\n소고기무국\n계란말이\n오이무침\n깍두기',
    '카레라이스\n유부장국\n과일샐러드\n단무지\n배추김치',
    '비빔밥\n콩나물국\n돈까스\n양배추샐러드\n깍두기'
  ],
  snack: [
    '우유\n고구마',
    '딸기\n식빵',
    '바나나\n요거트',
    '우유\n쿠키',
    '귤\n떡'
  ]
};

function getWeekDates(offset) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);

  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function changeMealWeek(delta) {
  mealWeekOffset += delta;
  renderMealGrid();
}

function renderMealGrid() {
  const dates = getWeekDates(mealWeekOffset);
  const dayNames = ['월', '화', '수', '목', '금'];
  const today = new Date();

  const startDate = dates[0];
  const endDate = dates[4];
  document.getElementById('mealWeekLabel').textContent =
    `${startDate.getMonth() + 1}/${startDate.getDate()} ~ ${endDate.getMonth() + 1}/${endDate.getDate()}`;

  document.getElementById('mealGrid').innerHTML = dates.map((d, i) => {
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    return `
      <div class="meal-card ${isToday ? 'today' : ''}">
        <div class="meal-day">${dayNames[i]}</div>
        <div class="meal-date">${d.getDate()}</div>
        <div class="meal-type">점심</div>
        <div class="meal-menu">${sampleMeals.lunch[i].replace(/\n/g, '<br>')}</div>
        <div class="meal-type">간식</div>
        <div class="meal-menu">${sampleMeals.snack[i].replace(/\n/g, '<br>')}</div>
      </div>
    `;
  }).join('');
}

renderMealGrid();

// ===== 출석 현황 =====
const students = [
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'absent' },
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'late' },
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'absent' },
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'present' },
  { name: '홍길동', status: 'late' },
  { name: '홍길동', status: 'present' },
];

function renderAttendance() {
  const present = students.filter(s => s.status === 'present').length;
  const absent = students.filter(s => s.status === 'absent').length;
  const late = students.filter(s => s.status === 'late').length;

  document.getElementById('attendanceSummary').innerHTML = `
    <div class="att-summary-card">
      <div class="att-summary-number present">${present}</div>
      <div class="att-summary-label">출석</div>
    </div>
    <div class="att-summary-card">
      <div class="att-summary-number absent">${absent}</div>
      <div class="att-summary-label">결석</div>
    </div>
    <div class="att-summary-card">
      <div class="att-summary-number late">${late}</div>
      <div class="att-summary-label">지각</div>
    </div>
  `;

  const statusLabel = { present: '출석', absent: '결석', late: '지각' };

  document.getElementById('attendanceList').innerHTML = students.map(s => `
    <div class="att-item">
      <div class="att-avatar ${s.status}">${s.name.charAt(0)}</div>
      <div>
        <div class="att-name">${s.name}</div>
        <div class="att-status">${statusLabel[s.status]}</div>
      </div>
    </div>
  `).join('');
}

renderAttendance();

// ===== 조퇴·결석 신청서 =====
let absenceRecords = [
  { type: '결석', name: '홍길동', school: '증산초 3학년', reason: '독감 (OO소아과 진료)', from: '2026-03-20', to: '2026-03-21', date: '2026.03.19' },
  { type: '조퇴', name: '홍길동', school: '수색초 2학년', reason: '치과 정기검진', from: '2026-03-18', to: '2026-03-18', date: '2026.03.18' },
];

// 날짜 초기 세팅
(function() {
  const today = new Date().toISOString().split('T')[0];
  const dateFields = ['absDate', 'absFrom', 'absTo'];
  dateFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });
  const formDateEl = document.getElementById('absFormDate');
  if (formDateEl) {
    const d = new Date();
    formDateEl.textContent = `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;
  }
  const medFormDateEl = document.getElementById('medFormDate');
  if (medFormDateEl) {
    const d = new Date();
    medFormDateEl.textContent = `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;
  }
})();

function renderAbsenceList() {
  const list = document.getElementById('absenceList');
  if (!list) return;
  list.innerHTML = absenceRecords.map(r => `
    <div class="notice-card">
      <div class="notice-header">
        <span class="notice-badge type-${r.type === '결석' ? '긴급' : '공지'}">${r.type}</span>
        <span class="notice-date">${r.date}</span>
      </div>
      <div class="notice-title">${r.name} (${r.school})</div>
      <div class="notice-preview">사유: ${r.reason} | 기간: ${r.from} ~ ${r.to}</div>
    </div>
  `).join('');
}

function submitAbsence() {
  const type = document.getElementById('absType').value;
  const name = document.getElementById('absName').value.trim();
  const school = document.getElementById('absSchool').value.trim();
  const reason = document.getElementById('absReason').value.trim();
  const from = document.getElementById('absFrom').value;
  const to = document.getElementById('absTo').value;

  if (!name || !reason || !from) {
    alert('아동 성명, 사유, 기간을 모두 입력해주세요.');
    return;
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

  absenceRecords.unshift({ type, name, school, reason, from, to, date: dateStr });
  renderAbsenceList();
  alert('신청서가 제출되었습니다.');
}

function printAbsence() {
  window.print();
}

renderAbsenceList();

// ===== 투약 관리 =====
let medRecords = [
  { name: '홍길동', drug: '아목시실린', dose: '1포', time: '점심 식후', symptom: '중이염', from: '2026-03-22', to: '2026-03-28', storage: '실온 보관' },
  { name: '홍길동', drug: '타이레놀시럽', dose: '5ml', time: '오후 간식 후', symptom: '감기/발열', from: '2026-03-24', to: '2026-03-26', storage: '실온 보관' },
];

function renderMedSchedule() {
  const el = document.getElementById('medSchedule');
  if (!el) return;
  el.innerHTML = medRecords.map(r => `
    <div class="med-card">
      <div class="med-avatar">${r.name.charAt(0)}</div>
      <div class="med-info">
        <div class="med-child">${r.name}</div>
        <div class="med-detail">${r.drug} ${r.dose} · ${r.symptom} · ${r.storage}</div>
      </div>
      <div class="med-time-badge">${r.time}</div>
      <div class="med-period">${r.from} ~ ${r.to}</div>
    </div>
  `).join('');
}

function submitMedication() {
  const name = document.getElementById('medName').value.trim();
  const drug = document.getElementById('medDrug').value.trim();
  const dose = document.getElementById('medDose').value.trim();
  const time = document.getElementById('medTime').value;
  const symptom = document.getElementById('medSymptom').value.trim();
  const from = document.getElementById('medFrom').value;
  const to = document.getElementById('medTo').value;
  const storage = document.getElementById('medStorage').value;

  if (!name || !drug || !from) {
    alert('아동 성명, 약 이름, 투약 기간을 입력해주세요.');
    return;
  }

  medRecords.unshift({ name, drug, dose, time, symptom, from, to: to || from, storage });
  renderMedSchedule();
  alert('투약 의뢰서가 제출되었습니다.');
}

function printMedication() {
  window.print();
}

renderMedSchedule();

// ===== 픽업 일정표 =====
let pickupWeekOffset = 0;

const pickupStudents = [
  { name: '홍길동', school: '증산초 1학년', times: { 월: '13:00', 화: '13:00', 수: '12:30', 목: '13:00', 금: '12:30' } },
  { name: '홍길동', school: '수색초 1학년', times: { 월: '13:10', 화: '13:10', 수: '12:40', 목: '13:10', 금: '12:40' } },
  { name: '홍길동', school: '증산초 2학년', times: { 월: '13:30', 화: '14:00', 수: '13:00', 목: '14:00', 금: '13:00' } },
  { name: '홍길동', school: '수색초 2학년', times: { 월: '13:30', 화: '14:00', 수: '13:00', 목: '14:00', 금: '13:00' } },
  { name: '홍길동', school: '증산초 1학년', times: { 월: '13:00', 화: '13:00', 수: '12:30', 목: '13:00', 금: '12:30' } },
];

function changePickupWeek(delta) {
  pickupWeekOffset += delta;
  renderPickupTable();
}

function renderPickupTable() {
  const dates = getWeekDates(pickupWeekOffset);
  const dayNames = ['월', '화', '수', '목', '금'];
  const today = new Date();

  const startDate = dates[0];
  const endDate = dates[4];
  document.getElementById('pickupWeekLabel').textContent =
    `${startDate.getMonth()+1}/${startDate.getDate()} ~ ${endDate.getMonth()+1}/${endDate.getDate()}`;

  let html = '<thead><tr><th>아동</th><th>학교</th>';
  dates.forEach((d, i) => {
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    html += `<th style="${isToday ? 'color:var(--primary)' : ''}">${dayNames[i]} (${d.getDate()}일)</th>`;
  });
  html += '</tr></thead><tbody>';

  pickupStudents.forEach(s => {
    html += `<tr><td class="pickup-name">${s.name}</td><td class="pickup-school">${s.school}</td>`;
    dayNames.forEach((day, i) => {
      const time = s.times[day] || '-';
      const d = dates[i];
      const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      let status = '';
      if (isPast) status = '<br><span class="pickup-status done">완료</span>';
      else if (isToday) status = '<br><span class="pickup-status waiting">대기</span>';
      else status = '<br><span class="pickup-status scheduled">예정</span>';

      html += `<td><span class="pickup-time">${time}</span>${status}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody>';
  document.getElementById('pickupTable').innerHTML = html;
}

renderPickupTable();

// ===== 신규 등록 / 상담 =====
function switchRegTab(tabId) {
  document.getElementById('regTab').style.display = tabId === 'regTab' ? 'block' : 'none';
  document.getElementById('consultTab').style.display = tabId === 'consultTab' ? 'block' : 'none';
  document.querySelectorAll('.register-tabs .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
}

function submitRegister() {
  const name = document.getElementById('regChildName').value.trim();
  const guardian = document.getElementById('regGuardian').value.trim();
  const phone = document.getElementById('regPhone').value.trim();

  if (!name || !guardian || !phone) {
    alert('아동 성명, 보호자 성명, 연락처를 모두 입력해주세요.');
    return;
  }

  alert(`${name} 아동의 이용 신청이 접수되었습니다.\n담당자 확인 후 연락드리겠습니다.`);
}

function submitConsult() {
  const guardian = document.getElementById('conGuardian').value.trim();
  const child = document.getElementById('conChild').value.trim();
  const detail = document.getElementById('conDetail').value.trim();

  if (!guardian || !child || !detail) {
    alert('보호자 성명, 아동 성명, 상담 내용을 모두 입력해주세요.');
    return;
  }

  alert(`상담 신청이 접수되었습니다.\n담당 선생님이 확인 후 연락드리겠습니다.`);
}
