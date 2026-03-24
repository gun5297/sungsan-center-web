// ===== 관리자 모드 =====
const ADMIN_PASSWORD = '1234';
let isAdmin = false;

function toggleAdminLogin() {
  if (isAdmin) {
    // 로그아웃
    isAdmin = false;
    document.body.classList.remove('admin-mode');
    document.getElementById('toolbarAdminBtn').textContent = '선생님 로그인';
    document.getElementById('toolbarAdminBtn').classList.remove('logged-in');
    renderNotices();
    renderGallery();
    renderPickupTable();
    renderMedSchedule();
    return;
  }
  // 로그인 모달 열기
  document.getElementById('adminLoginModal').classList.add('active');
  const input = document.getElementById('adminPwInput');
  input.value = '';
  setTimeout(() => input.focus(), 100);
}

function doAdminLogin() {
  const pw = document.getElementById('adminPwInput').value;
  if (pw === ADMIN_PASSWORD) {
    isAdmin = true;
    document.body.classList.add('admin-mode');
    document.getElementById('toolbarAdminBtn').textContent = '선생님 로그아웃';
    document.getElementById('toolbarAdminBtn').classList.add('logged-in');
    closeAdminModal();
    renderNotices();
    renderMealGrid();
    renderAttendance();
    renderMedSchedule();
    renderAbsenceList();
    renderGallery();
    renderPickupTable();
  } else {
    alert('비밀번호가 틀렸습니다.');
    document.getElementById('adminPwInput').value = '';
    document.getElementById('adminPwInput').focus();
  }
}

function closeAdminModal() {
  document.getElementById('adminLoginModal').classList.remove('active');
}

// 엔터키로 로그인
document.addEventListener('DOMContentLoaded', () => {
  const pwInput = document.getElementById('adminPwInput');
  if (pwInput) {
    pwInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doAdminLogin();
    });
  }
});

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
      <div class="notice-actions">
        <button class="edit-btn" onclick="event.stopPropagation(); editNotice(${n.id})">수정</button>
        <button class="delete-btn" onclick="event.stopPropagation(); deleteNotice(${n.id})">삭제</button>
      </div>
    </div>
  `).join('');
}

function deleteNotice(id) {
  if (!confirm('이 공지를 삭제하시겠습니까?')) return;
  notices = notices.filter(n => n.id !== id);
  renderNotices();
}

function editNotice(id) {
  const notice = notices.find(n => n.id === id);
  if (!notice) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">공지 수정</div>
      <input type="text" class="input-field" id="editNoticeTitle" value="${notice.title}" />
      <textarea class="input-field textarea" id="editNoticeContent">${notice.content}</textarea>
      <select class="input-field select-field" id="editNoticeCategory">
        <option value="공지" ${notice.category === '공지' ? 'selected' : ''}>공지사항</option>
        <option value="통신문" ${notice.category === '통신문' ? 'selected' : ''}>가정통신문</option>
        <option value="긴급" ${notice.category === '긴급' ? 'selected' : ''}>긴급 안내</option>
      </select>
      <button class="btn-upload" onclick="saveEditNotice(${id})" style="margin-top:12px;">저장</button>
      <button class="modal-close" onclick="closeModal(this)">취소</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

function saveEditNotice(id) {
  const notice = notices.find(n => n.id === id);
  if (!notice) return;
  notice.title = document.getElementById('editNoticeTitle').value;
  notice.content = document.getElementById('editNoticeContent').value;
  notice.category = document.getElementById('editNoticeCategory').value;
  document.querySelector('.modal-overlay.active .modal-close').click();
  renderNotices();
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

  document.getElementById('attendanceList').innerHTML = students.map((s, i) => `
    <div class="att-item">
      <div class="att-avatar ${s.status}">${s.name.charAt(0)}</div>
      <div>
        <div class="att-name">${s.name}</div>
        <div class="att-status">${statusLabel[s.status]}</div>
      </div>
      ${isAdmin ? `<select class="input-field" style="width:auto;padding:6px 10px;margin:0;font-size:0.75rem;" onchange="changeAttStatus(${i}, this.value)">
        <option value="present" ${s.status==='present'?'selected':''}>출석</option>
        <option value="absent" ${s.status==='absent'?'selected':''}>결석</option>
        <option value="late" ${s.status==='late'?'selected':''}>지각</option>
      </select>` : ''}
    </div>
  `).join('');
}

function changeAttStatus(index, status) {
  students[index].status = status;
  renderAttendance();
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

  const guardian = document.getElementById('absGuardian').value.trim();
  const phone = document.getElementById('absPhone').value.trim();
  const absDate = document.getElementById('absDate').value;
  const consent = document.getElementById('absConsent');
  if (!consent.checked) { alert('동의 항목에 체크해주세요.'); return; }

  absenceRecords.unshift({ type, name, school, reason, from, to, date: dateStr });
  inboxItems.unshift({
    type: 'absence', name: `${name} (${type})`, summary: `${reason} | ${from} ~ ${to}`, date: dateStr,
    data: { type, name, school, guardian, phone, reason, from, to, absDate },
    consents: ['운영규정 안내 동의']
  });
  updateInboxBadge();
  renderAbsenceList();
  alert('신청서가 제출되었습니다.');
  consent.checked = false;
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
  el.innerHTML = medRecords.map((r, i) => `
    <div class="med-card">
      <div class="med-avatar">${r.name.charAt(0)}</div>
      <div class="med-info">
        <div class="med-child">${r.name}</div>
        <div class="med-detail">${r.drug} ${r.dose} · ${r.symptom} · ${r.storage}</div>
      </div>
      <div class="med-time-badge">${r.time}</div>
      <div class="med-period">${r.from} ~ ${r.to}</div>
      ${isAdmin ? `<button class="delete-btn" onclick="deleteMed(${i})">삭제</button>` : ''}
    </div>
  `).join('');
}

function deleteMed(index) {
  if (!confirm('이 투약 기록을 삭제하시겠습니까?')) return;
  medRecords.splice(index, 1);
  renderMedSchedule();
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

  const hospital = document.getElementById('medHospital') ? document.getElementById('medHospital').value.trim() : '';
  const note = document.getElementById('medNote') ? document.getElementById('medNote').value.trim() : '';
  const c1 = document.getElementById('medConsent1');
  const c2 = document.getElementById('medConsent2');
  const c3 = document.getElementById('medConsent3');
  if (!c1.checked || !c2.checked || !c3.checked) { alert('모든 동의 항목에 체크해주세요.'); return; }

  medRecords.unshift({ name, drug, dose, time, symptom, from, to: to || from, storage });

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
  inboxItems.unshift({
    type: 'medication', name: `${name} (${drug})`, summary: `${dose} · ${time} · ${from}~${to || from}`, date: dateStr,
    data: { name, drug, dose, time, symptom, from, to: to || from, storage, hospital, note },
    consents: ['부작용 안내 동의', '약 정보 책임 확인', '응급조치 동의']
  });
  updateInboxBadge();
  renderMedSchedule();
  alert('투약 의뢰서가 제출되었습니다.');
  c1.checked = false; c2.checked = false; c3.checked = false;
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

  if (isAdmin) html += '<th></th>';
  html += '</tr></thead><tbody>';

  pickupStudents.forEach((s, idx) => {
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
    if (isAdmin) html += `<td><button class="delete-btn" onclick="deletePickupStudent(${idx})">삭제</button></td>`;
    html += '</tr>';
  });

  html += '</tbody>';
  document.getElementById('pickupTable').innerHTML = html;
}

function addPickupStudent() {
  const name = document.getElementById('pickupName').value.trim();
  const school = document.getElementById('pickupSchool').value.trim();
  if (!name || !school) { alert('이름과 학교를 입력해주세요.'); return; }
  pickupStudents.push({
    name, school,
    times: {
      월: document.getElementById('pickupMon').value.trim() || '-',
      화: document.getElementById('pickupTue').value.trim() || '-',
      수: document.getElementById('pickupWed').value.trim() || '-',
      목: document.getElementById('pickupThu').value.trim() || '-',
      금: document.getElementById('pickupFri').value.trim() || '-',
    }
  });
  ['pickupName','pickupSchool','pickupMon','pickupTue','pickupWed','pickupThu','pickupFri'].forEach(id => document.getElementById(id).value = '');
  renderPickupTable();
}

function deletePickupStudent(idx) {
  if (!confirm('이 아동을 픽업 목록에서 삭제하시겠습니까?')) return;
  pickupStudents.splice(idx, 1);
  renderPickupTable();
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

  const c1 = document.getElementById('regConsent1');
  const c2 = document.getElementById('regConsent2');
  const c3 = document.getElementById('regConsent3');
  if (!c1.checked || !c2.checked) { alert('필수 동의 항목에 체크해주세요.'); return; }

  const birth = document.getElementById('regChildBirth').value;
  const gender = document.getElementById('regGender').value;
  const school = document.getElementById('regSchool').value.trim();
  const relation = document.getElementById('regRelation').value;
  const emergency = document.getElementById('regEmergency').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  const note = document.getElementById('regNote').value.trim();
  const days = [...document.querySelectorAll('#regDays input:checked')].map(c => c.value).join(', ');

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
  inboxItems.unshift({
    type: 'register', name: `${name} (신규등록)`, summary: `${school} · 보호자: ${guardian}`, date: dateStr,
    data: { name, birth, gender, school, guardian, relation, phone, emergency, address, days, note },
    consents: ['이용규정 동의', '개인정보 수집 동의', c3.checked ? '사진촬영 동의' : '사진촬영 미동의']
  });
  updateInboxBadge();
  alert(`${name} 아동의 이용 신청이 접수되었습니다.\n담당자 확인 후 연락드리겠습니다.`);
  c1.checked = false; c2.checked = false; c3.checked = false;
}

function submitConsult() {
  const guardian = document.getElementById('conGuardian').value.trim();
  const child = document.getElementById('conChild').value.trim();
  const detail = document.getElementById('conDetail').value.trim();

  if (!guardian || !child || !detail) {
    alert('보호자 성명, 아동 성명, 상담 내용을 모두 입력해주세요.');
    return;
  }

  const conConsent = document.getElementById('conConsent');
  if (!conConsent.checked) { alert('동의 항목에 체크해주세요.'); return; }

  const conPhone = document.getElementById('conPhone').value.trim();
  const conDate = document.getElementById('conDate').value;
  const topic = document.getElementById('conTopic').value;

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
  inboxItems.unshift({
    type: 'consult', name: `${child} (상담)`, summary: `${topic} · 보호자: ${guardian}`, date: dateStr,
    data: { guardian, phone: conPhone, child, dateTime: conDate, topic, detail },
    consents: ['상담기록 보관 동의']
  });
  updateInboxBadge();
  alert(`상담 신청이 접수되었습니다.\n담당 선생님이 확인 후 연락드리겠습니다.`);
  conConsent.checked = false;
}

// ===== 갤러리 =====
const GALLERY_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
];

let galleryItems = [
  { title: '봄맞이 미술 수업', category: '미술 활동', date: '2026.03.20', photo: null },
  { title: '실내 체육 시간', category: '체육 활동', date: '2026.03.18', photo: null },
  { title: '봄 현장학습', category: '현장학습', date: '2026.03.15', photo: null },
  { title: '쿠키 만들기', category: '요리 활동', date: '2026.03.12', photo: null },
];

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = galleryItems.map((item, i) => {
    const bg = item.photo
      ? `background-image:url('${item.photo}'); background-size:cover; background-position:center;`
      : `background: ${GALLERY_GRADIENTS[i % GALLERY_GRADIENTS.length]};`;
    return `
      <div class="gallery-card">
        <div class="gallery-img" style="${bg}">
          <span>${item.category}</span>
        </div>
        <div class="gallery-info">
          <div class="gallery-title">${item.title}</div>
          <div class="gallery-date">${item.date}</div>
          ${isAdmin ? `<div class="notice-actions" style="display:flex;"><button class="delete-btn" onclick="deleteGalleryItem(${i})">삭제</button></div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function addGalleryItem() {
  const title = document.getElementById('galTitle').value.trim();
  const category = document.getElementById('galCategory').value.trim();
  const dateVal = document.getElementById('galDate').value;
  const fileInput = document.getElementById('galPhoto');

  if (!title || !category) { alert('제목과 카테고리를 입력해주세요.'); return; }

  const dateStr = dateVal ? dateVal.replace(/-/g, '.') : new Date().toISOString().split('T')[0].replace(/-/g, '.');

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      galleryItems.unshift({ title, category, date: dateStr, photo: e.target.result });
      renderGallery();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    galleryItems.unshift({ title, category, date: dateStr, photo: null });
    renderGallery();
  }

  document.getElementById('galTitle').value = '';
  document.getElementById('galCategory').value = '';
  document.getElementById('galDate').value = '';
  fileInput.value = '';
}

function deleteGalleryItem(idx) {
  if (!confirm('이 활동을 삭제하시겠습니까?')) return;
  galleryItems.splice(idx, 1);
  renderGallery();
}

renderGallery();

// ===== 서류함 시스템 =====
let inboxItems = [];
let currentInboxFilter = 'all';

function updateInboxBadge() {
  const badge = document.getElementById('inboxBadge');
  if (badge) badge.textContent = inboxItems.length;
}

function openInbox() {
  document.getElementById('inboxModal').classList.add('active');
  renderInbox();
}

function closeInbox() {
  document.getElementById('inboxModal').classList.remove('active');
}

function switchInboxTab(type) {
  currentInboxFilter = type;
  document.querySelectorAll('.inbox-tab').forEach(t => {
    t.classList.toggle('active', t.textContent.includes(
      type === 'all' ? '전체' : type === 'absence' ? '결석' : type === 'medication' ? '투약' : type === 'register' ? '등록' : '상담'
    ));
  });
  renderInbox();
}

function renderInbox() {
  const list = document.getElementById('inboxList');
  if (!list) return;
  const filtered = currentInboxFilter === 'all' ? inboxItems : inboxItems.filter(i => i.type === currentInboxFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<div class="inbox-empty">제출된 서류가 없습니다</div>';
    return;
  }

  const typeLabels = { absence: '결석/조퇴', medication: '투약 의뢰', register: '신규 등록', consult: '상담 신청' };

  list.innerHTML = filtered.map((item) => {
    const idx = inboxItems.indexOf(item);
    const consentStr = item.consents ? item.consents.map(c => `<span class="inbox-consent-tag">✓ ${c}</span>`).join(' ') : '';
    return `
      <div class="inbox-item" onclick="printInboxItem(${idx})">
        <span class="inbox-type ${item.type}">${typeLabels[item.type]}</span>
        <div class="inbox-info">
          <div class="inbox-name">${item.name}</div>
          <div class="inbox-detail">${item.summary}</div>
          ${consentStr ? `<div class="inbox-consents">${consentStr}</div>` : ''}
        </div>
        <span class="inbox-date">${item.date}</span>
        <button class="inbox-print-btn" onclick="event.stopPropagation(); printInboxItem(${idx})">출력</button>
      </div>
    `;
  }).join('');
}

// 출력 양식 생성
function printInboxItem(idx) {
  const item = inboxItems[idx];
  if (!item) return;

  const printArea = document.getElementById('printArea');
  let html = '';

  if (item.type === 'absence') {
    html = `
      <div class="print-header">
        <div class="print-org">성산지역아동센터</div>
        <div class="print-title">${item.data.type} 신청서</div>
      </div>
      <table>
        <tr><th>신청 구분</th><td>${item.data.type}</td></tr>
        <tr><th>아동 성명</th><td>${item.data.name}</td></tr>
        <tr><th>소속 학교/학년</th><td>${item.data.school}</td></tr>
        <tr><th>보호자 성명</th><td>${item.data.guardian || '-'}</td></tr>
        <tr><th>보호자 연락처</th><td>${item.data.phone || '-'}</td></tr>
        <tr><th>사유</th><td>${item.data.reason}</td></tr>
        <tr><th>기간</th><td>${item.data.from} ~ ${item.data.to || item.data.from}</td></tr>
        <tr><th>신청일</th><td>${item.data.absDate || item.date}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 본인은 아동의 보호자로서 위 내용이 사실임을 확인하며, 센터 운영규정에 따라 사전 통보 없는 결석이 반복될 경우 이용에 제한이 있을 수 있음을 안내받았습니다.</p>
        <p>위와 같은 사유로 ${item.data.type}을(를) 신청합니다.</p>
      </div>
      <div class="print-sign">
        <p>${item.date}</p>
        <p>신청인(보호자): ${item.data.guardian || '___________'} (서명)</p>
      </div>
      <div class="print-to">성산지역아동센터장 귀하</div>
    `;
  } else if (item.type === 'medication') {
    html = `
      <div class="print-header">
        <div class="print-org">성산지역아동센터</div>
        <div class="print-title">투약 의뢰서</div>
      </div>
      <table>
        <tr><th>아동 성명</th><td>${item.data.name}</td></tr>
        <tr><th>증상/진단명</th><td>${item.data.symptom}</td></tr>
        <tr><th>처방 병원</th><td>${item.data.hospital || '-'}</td></tr>
        <tr><th>약 이름</th><td>${item.data.drug}</td></tr>
        <tr><th>투약 용량</th><td>${item.data.dose}</td></tr>
        <tr><th>투약 시간</th><td>${item.data.time}</td></tr>
        <tr><th>투약 기간</th><td>${item.data.from} ~ ${item.data.to || item.data.from}</td></tr>
        <tr><th>보관 방법</th><td>${item.data.storage}</td></tr>
        <tr><th>특이사항</th><td>${item.data.note || '-'}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 투약 시 발생할 수 있는 부작용에 대해 안내 받았으며, 부작용 발생 시 투약 중단에 동의합니다.</p>
        <p>※ 정확한 약 정보를 기재하였으며, 잘못된 정보 기재로 인한 책임은 보호자에게 있음을 확인합니다.</p>
        <p>※ 건강 상태 변화 시 119 신고 및 응급 조치를 취할 수 있음에 동의합니다.</p>
        <p>위 아동에 대한 투약을 의뢰하며, 상기 안내사항을 모두 확인하였습니다.</p>
      </div>
      <div class="print-sign">
        <p>${item.date}</p>
        <p>의뢰인(보호자): ___________ (서명)</p>
      </div>
      <div class="print-to">성산지역아동센터장 귀하</div>
    `;
  } else if (item.type === 'register') {
    html = `
      <div class="print-header">
        <div class="print-org">성산지역아동센터</div>
        <div class="print-title">이용 신청서</div>
      </div>
      <table>
        <tr><th>아동 성명</th><td>${item.data.name}</td></tr>
        <tr><th>생년월일</th><td>${item.data.birth || '-'}</td></tr>
        <tr><th>성별</th><td>${item.data.gender || '-'}</td></tr>
        <tr><th>소속 학교/학년</th><td>${item.data.school || '-'}</td></tr>
        <tr><th>보호자 성명</th><td>${item.data.guardian}</td></tr>
        <tr><th>관계</th><td>${item.data.relation || '-'}</td></tr>
        <tr><th>보호자 연락처</th><td>${item.data.phone}</td></tr>
        <tr><th>비상 연락처</th><td>${item.data.emergency || '-'}</td></tr>
        <tr><th>주소</th><td>${item.data.address || '-'}</td></tr>
        <tr><th>이용 희망 요일</th><td>${item.data.days || '-'}</td></tr>
        <tr><th>특이사항</th><td>${item.data.note || '-'}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 기재 내용이 사실임을 확인하며, 센터 이용규정 및 안전수칙을 준수할 것에 동의합니다.</p>
        <p>※ 아동의 개인정보를 센터 운영 목적으로 수집·이용하는 것에 동의합니다. (보유기간: 퇴소 후 3년)</p>
      </div>
      <div class="print-sign">
        <p>${item.date}</p>
        <p>신청인(보호자): ${item.data.guardian || '___________'} (서명)</p>
      </div>
      <div class="print-to">성산지역아동센터장 귀하</div>
    `;
  } else if (item.type === 'consult') {
    html = `
      <div class="print-header">
        <div class="print-org">성산지역아동센터</div>
        <div class="print-title">상담 신청서</div>
      </div>
      <table>
        <tr><th>신청자(보호자)</th><td>${item.data.guardian}</td></tr>
        <tr><th>연락처</th><td>${item.data.phone || '-'}</td></tr>
        <tr><th>아동 성명</th><td>${item.data.child}</td></tr>
        <tr><th>희망 상담 일시</th><td>${item.data.dateTime || '-'}</td></tr>
        <tr><th>상담 주제</th><td>${item.data.topic || '-'}</td></tr>
        <tr><th>상담 내용</th><td style="white-space:pre-wrap;">${item.data.detail}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 상담 내용은 아동 지도 및 센터 운영 개선 목적으로만 활용되며, 상담 기록이 보관될 수 있습니다.</p>
      </div>
      <div class="print-sign">
        <p>${item.date}</p>
        <p>신청인(보호자): ${item.data.guardian || '___________'} (서명)</p>
      </div>
      <div class="print-to">성산지역아동센터장 귀하</div>
    `;
  }

  printArea.innerHTML = html;
  setTimeout(() => window.print(), 100);
}

updateInboxBadge();
