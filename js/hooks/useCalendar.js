// ===== useCalendar: 캘린더 & 학사일정 & 시간표 =====
import { schoolEvents } from '../data/schoolEvents.js';
import { getDateKey } from '../utils.js';

let currentDate = new Date();
let selectedDate = new Date();

const weekdaySchedule = {
  1: [{ time: '09:00 ~ 19:00', name: '자유시간', type: '' }],
  2: [{ time: '09:00 ~ 19:00', name: '자유시간', type: '' }],
  3: [{ time: '09:00 ~ 19:00', name: '자유시간', type: '' }],
  4: [{ time: '09:00 ~ 19:00', name: '자유시간', type: '' }],
  5: [{ time: '09:00 ~ 19:00', name: '자유시간', type: '' }],
};

export function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
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
  headers.forEach(h => {
    html += `<div class="cal-header">${h}</div>`;
  });

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

  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="cal-day other-month"><span class="cal-num">${i}</span></div>`;
  }

  document.getElementById('calendar').innerHTML = html;
}

export function renderDaySchedule() {
  const dayOfWeek = selectedDate.getDay();
  const dateStr = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dateKey = getDateKey(selectedDate);

  document.getElementById('dayTitle').textContent = `${dateStr} (${dayNames[dayOfWeek]})`;

  const timetable = document.getElementById('timetable');
  let html = '';

  const events = schoolEvents[dateKey];
  if (events) {
    html += events.map(ev => `
      <div class="time-slot time-slot-event">
        <div class="time-dot special"></div>
        <div class="time-name">${ev}</div>
      </div>
    `).join('');
  }

  const schedule = weekdaySchedule[dayOfWeek];
  if (!schedule) {
    html += '<div class="empty-state">주말은 휴원입니다</div>';
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

export function initCalendar() {
  renderCalendar();
  renderDaySchedule();
}

// window에 노출
window.changeMonth = changeMonth;
window.selectDay = selectDay;
