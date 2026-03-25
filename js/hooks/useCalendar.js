// ===== useCalendar: 캘린더 & 학사일정 & 시간표 =====
import { schoolEvents as baseEvents } from '../data/schoolEvents.js';
import { getHolidays, mergeHolidays } from '../data/holidays.js';
import { getDateKey } from '../utils.js';
import { getIsAdmin } from '../state.js';

let currentDate = new Date();
let selectedDate = new Date();
let schoolEvents = { ...baseEvents };

// ===== 시간표 저장 구조 =====
// weekdaySchedule: { 1: [...], 2: [...], ... 5: [...] } — 요일별 기본
// dateSchedule: { "2026-03-25": [...], ... } — 날짜별 오버라이드 (기간 설정 시)

const DEFAULT_SCHEDULE = { 1: [], 2: [], 3: [], 4: [], 5: [] };

function loadWeekdaySchedule() {
  try {
    const saved = localStorage.getItem('weekdaySchedule');
    if (!saved) return JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
    const parsed = JSON.parse(saved);
    for (const key of Object.keys(parsed)) {
      parsed[key] = (parsed[key] || []).filter(s => s.name !== '자유시간');
    }
    return parsed;
  } catch { return JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)); }
}

function saveWeekdaySchedule() {
  localStorage.setItem('weekdaySchedule', JSON.stringify(weekdaySchedule));
}

function loadDateSchedule() {
  try {
    const saved = localStorage.getItem('dateSchedule');
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveDateSchedule() {
  localStorage.setItem('dateSchedule', JSON.stringify(dateSchedule));
}

let weekdaySchedule = loadWeekdaySchedule();
let dateSchedule = loadDateSchedule();

// 특정 날짜의 시간표 가져오기 (날짜별 우선 → 요일별 폴백)
function getScheduleForDate(date) {
  const key = getDateKey(date);
  if (dateSchedule[key]) return dateSchedule[key];
  const dow = date.getDay();
  return weekdaySchedule[dow] || null;
}

// ===== 캘린더 렌더링 =====

export async function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();

  const year = currentDate.getFullYear();
  try {
    const holidays = await getHolidays(year);
    schoolEvents = mergeHolidays(schoolEvents, holidays);
    renderCalendar();
  } catch (e) { /* 실패해도 기존 데이터 유지 */ }
}

export function selectDay(day) {
  selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
  renderCalendar();
  renderDaySchedule();
}

export function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  document.getElementById('monthLabel').textContent = `${year}년 ${month + 1}월`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  let html = '';
  const headers = ['일', '월', '화', '수', '목', '금', '토'];
  headers.forEach(h => { html += `<div class="cal-header">${h}</div>`; });

  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="cal-day other-month"><span class="cal-num">${daysInPrev - i}</span></div>`;
  }

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
          const shortName = ev.replace(/\[.*?\]\s*/g, '');
          return `<span class="${tagClass} 증산초">${shortName}</span><span class="${tagClass} 수색초">${shortName}</span>`;
        } else if (ev.includes('증산초')) { tagClass += ' 증산초';
        } else if (ev.includes('수색초')) { tagClass += ' 수색초';
        } else if (ev.includes('증산중')) { tagClass += ' 증산중';
        } else { tagClass += ' holiday'; }
        const shortName = ev.replace(/\[.*?\]\s*/g, '');
        return `<span class="${tagClass}">${shortName}</span>`;
      }).join('') + '</div>';
    }

    html += `<div class="${classes}" onclick="selectDay(${d})"><span class="cal-num">${d}</span>${eventsHtml}</div>`;
  }

  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="cal-day other-month"><span class="cal-num">${i}</span></div>`;
  }

  document.getElementById('calendar').innerHTML = html;
}

// ===== 일별 시간표 렌더링 =====

export function renderDaySchedule() {
  const dayOfWeek = selectedDate.getDay();
  const dateStr = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dateKey = getDateKey(selectedDate);

  document.getElementById('dayTitle').textContent = `${dateStr} (${dayNames[dayOfWeek]})`;

  const timetable = document.getElementById('timetable');
  let html = '';

  // 날짜별 오버라이드 표시
  const hasDateOverride = !!dateSchedule[dateKey];

  const events = schoolEvents[dateKey];
  if (events) {
    html += events.map(ev => `
      <div class="time-slot time-slot-event">
        <div class="time-dot special"></div>
        <div class="time-name">${ev}</div>
      </div>
    `).join('');
  }

  const schedule = getScheduleForDate(selectedDate);
  if (!schedule) {
    html += '<div class="empty-state">주말은 휴원입니다</div>';
  } else if (schedule.length === 0) {
    html += '<div class="empty-state">등록된 시간표가 없습니다</div>';
  } else {
    if (hasDateOverride) {
      html += '<div style="font-size:0.72rem;color:var(--primary);font-weight:700;margin-bottom:6px;">이 날짜에 별도 시간표가 적용되어 있습니다</div>';
    }
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

// ===== 시간표 수정 모달 =====

const TYPE_OPTIONS = `
  <option value="">기본</option>
  <option value="meal">식사</option>
  <option value="snack">간식</option>
  <option value="special">특별활동</option>
  <option value="rest">휴식</option>
`;

export function openScheduleEditor() {
  const dayOfWeek = selectedDate.getDay();
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    alert('주말은 휴원입니다. 평일을 선택해 주세요.');
    return;
  }

  const schedule = getScheduleForDate(selectedDate) || [];
  const todayStr = getDateKey(new Date());

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal" style="max-width:540px;">
      <div class="modal-title">시간표 수정</div>
      <button class="modal-close-x" onclick="closeScheduleEditor(this)"></button>

      <div id="scheduleEditorRows">
        ${schedule.map((s, i) => scheduleRowHTML(s, i)).join('')}
      </div>
      <button class="btn-secondary-sm" onclick="addScheduleRow()" style="width:100%;">+ 시간 추가</button>

      <!-- 적용 범위 설정 -->
      <div style="margin-top:16px;padding:16px;background:var(--bg-sub);border-radius:10px;">
        <div style="font-size:0.82rem;font-weight:700;color:var(--text-sub);margin-bottom:10px;">적용 범위</div>

        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;font-weight:600;cursor:pointer;margin-bottom:8px;">
          <input type="radio" name="applyMode" value="weekday" checked onchange="toggleApplyMode()" />
          요일별 기본 시간표로 적용
        </label>
        <div id="applyWeekdayOptions" style="margin-left:22px;margin-bottom:12px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${[1,2,3,4,5].map(d => `
              <label style="display:flex;align-items:center;gap:4px;font-size:0.85rem;font-weight:600;cursor:pointer;">
                <input type="checkbox" class="apply-day-check" value="${d}" ${d === dayOfWeek ? 'checked' : ''} />
                ${['','월','화','수','목','금'][d]}
              </label>
            `).join('')}
          </div>
        </div>

        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;font-weight:600;cursor:pointer;margin-bottom:8px;">
          <input type="radio" name="applyMode" value="period" onchange="toggleApplyMode()" />
          특정 기간에만 적용
        </label>
        <div id="applyPeriodOptions" style="margin-left:22px;display:none;">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <input type="date" id="scheduleFrom" class="input-field" value="${getDateKey(selectedDate)}" style="flex:1;margin-bottom:0;min-width:130px;" />
            <span style="font-weight:600;color:var(--text-sub);">~</span>
            <input type="date" id="scheduleTo" class="input-field" value="${getDateKey(selectedDate)}" style="flex:1;margin-bottom:0;min-width:130px;" />
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
            ${[1,2,3,4,5].map(d => `
              <label style="display:flex;align-items:center;gap:4px;font-size:0.85rem;font-weight:600;cursor:pointer;">
                <input type="checkbox" class="period-day-check" value="${d}" ${d === dayOfWeek ? 'checked' : ''} />
                ${['','월','화','수','목','금'][d]}
              </label>
            `).join('')}
          </div>
          <div style="font-size:0.72rem;color:var(--text-sub);margin-top:4px;">체크한 요일에만 적용됩니다</div>
        </div>
      </div>

      <div style="display:flex;gap:12px;margin-top:16px;align-items:center;">
        <button class="btn-upload" style="margin-top:0;" onclick="saveScheduleEdit()">저장</button>
        <button class="modal-close" onclick="closeScheduleEditor(this)">취소</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeScheduleEditor(overlay.querySelector('.modal-close'));
  });
}

function scheduleRowHTML(s, i) {
  return `
    <div class="schedule-edit-row" data-idx="${i}">
      <input type="text" class="input-field" placeholder="09:00 ~ 10:00" value="${s ? s.time : ''}" data-field="time" style="flex:1;" />
      <input type="text" class="input-field" placeholder="활동명" value="${s ? s.name : ''}" data-field="name" style="flex:1;" />
      <select class="input-field select-field" data-field="type" style="width:80px;">
        ${TYPE_OPTIONS.replace(`value="${s ? s.type : ''}"`, `value="${s ? s.type : ''}" selected`)}
      </select>
      <button class="delete-btn" onclick="removeScheduleRow(this)" style="flex-shrink:0;">삭제</button>
    </div>
  `;
}

function toggleApplyMode() {
  const mode = document.querySelector('input[name="applyMode"]:checked').value;
  document.getElementById('applyWeekdayOptions').style.display = mode === 'weekday' ? 'block' : 'none';
  document.getElementById('applyPeriodOptions').style.display = mode === 'period' ? 'block' : 'none';
}

function closeScheduleEditor(btn) {
  const overlay = btn.closest('.modal-overlay');
  overlay.classList.remove('active');
  setTimeout(() => overlay.remove(), 300);
}

function addScheduleRow() {
  const container = document.getElementById('scheduleEditorRows');
  const row = document.createElement('div');
  row.className = 'schedule-edit-row';
  row.innerHTML = `
    <input type="text" class="input-field" placeholder="09:00 ~ 10:00" data-field="time" style="flex:1;" />
    <input type="text" class="input-field" placeholder="활동명" data-field="name" style="flex:1;" />
    <select class="input-field select-field" data-field="type" style="width:80px;">${TYPE_OPTIONS}</select>
    <button class="delete-btn" onclick="removeScheduleRow(this)" style="flex-shrink:0;">삭제</button>
  `;
  container.appendChild(row);
}

function removeScheduleRow(btn) {
  btn.closest('.schedule-edit-row').remove();
}

function saveScheduleEdit() {
  const rows = document.querySelectorAll('#scheduleEditorRows .schedule-edit-row');
  const newSchedule = [];
  rows.forEach(row => {
    const time = row.querySelector('[data-field="time"]').value.trim();
    const name = row.querySelector('[data-field="name"]').value.trim();
    const type = row.querySelector('[data-field="type"]').value;
    if (time && name) newSchedule.push({ time, name, type });
  });

  const mode = document.querySelector('input[name="applyMode"]:checked').value;

  if (mode === 'weekday') {
    // 요일별 기본 시간표에 저장
    const checkedDays = [...document.querySelectorAll('.apply-day-check:checked')].map(c => parseInt(c.value));
    if (checkedDays.length === 0) { alert('적용할 요일을 최소 1개 선택해 주세요.'); return; }

    checkedDays.forEach(day => {
      weekdaySchedule[day] = JSON.parse(JSON.stringify(newSchedule));
    });
    saveWeekdaySchedule();

    const dayLabels = checkedDays.map(d => ['','월','화','수','목','금'][d]).join(', ');
    closeAndRefresh();
    alert(`${dayLabels}요일 기본 시간표가 저장되었습니다.`);

  } else {
    // 특정 기간에 날짜별로 저장
    const from = document.getElementById('scheduleFrom').value;
    const to = document.getElementById('scheduleTo').value;
    if (!from || !to) { alert('기간을 설정해 주세요.'); return; }

    const checkedDays = [...document.querySelectorAll('.period-day-check:checked')].map(c => parseInt(c.value));
    if (checkedDays.length === 0) { alert('적용할 요일을 최소 1개 선택해 주세요.'); return; }

    const startDate = new Date(from);
    const endDate = new Date(to);
    if (startDate > endDate) { alert('시작일이 종료일보다 늦습니다.'); return; }

    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const dow = current.getDay();
      if (checkedDays.includes(dow)) {
        const key = getDateKey(current);
        dateSchedule[key] = JSON.parse(JSON.stringify(newSchedule));
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    saveDateSchedule();

    closeAndRefresh();
    alert(`${from} ~ ${to} 기간의 ${count}일에 시간표가 적용되었습니다.`);
  }
}

function closeAndRefresh() {
  renderDaySchedule();
  const overlay = document.querySelector('.modal-overlay.active');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }
}

// ===== 초기화 =====

export async function initCalendar() {
  renderCalendar();
  renderDaySchedule();

  const year = new Date().getFullYear();
  try {
    const [thisYear, nextYear] = await Promise.all([
      getHolidays(year),
      getHolidays(year + 1)
    ]);
    schoolEvents = mergeHolidays(baseEvents, { ...thisYear, ...nextYear });
    renderCalendar();
    renderDaySchedule();
  } catch (e) {
    console.warn('공휴일 자동 갱신 실패 (기본 데이터 사용):', e);
  }
}

// window에 노출
window.changeMonth = changeMonth;
window.selectDay = selectDay;
window.openScheduleEditor = openScheduleEditor;
window.closeScheduleEditor = closeScheduleEditor;
window.addScheduleRow = addScheduleRow;
window.removeScheduleRow = removeScheduleRow;
window.saveScheduleEdit = saveScheduleEdit;
window.toggleApplyMode = toggleApplyMode;
