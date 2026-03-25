// ===== usePickup: 저학년 픽업 일정표 =====
import { initialPickupStudents } from '../data/sampleData.js';
import { getWeekDates, isSameDay } from '../utils.js';
import { getIsAdmin } from '../state.js';

let pickupWeekOffset = 0;
const pickupStudents = [...initialPickupStudents];

export function changePickupWeek(delta) {
  pickupWeekOffset += delta;
  renderPickupTable();
}

export function renderPickupTable() {
  const dates = getWeekDates(pickupWeekOffset);
  const dayNames = ['월', '화', '수', '목', '금'];
  const today = new Date();
  const admin = getIsAdmin();

  const startDate = dates[0];
  const endDate = dates[4];
  document.getElementById('pickupWeekLabel').textContent =
    `${startDate.getMonth()+1}/${startDate.getDate()} ~ ${endDate.getMonth()+1}/${endDate.getDate()}`;

  let html = '<thead><tr><th>아동</th><th>학교</th>';
  dates.forEach((d, i) => {
    const isToday = isSameDay(d, today);
    html += `<th${isToday ? ' class="today"' : ''}>${dayNames[i]} (${d.getDate()}일)</th>`;
  });
  if (admin) html += '<th></th>';
  html += '</tr></thead><tbody>';

  pickupStudents.forEach((s, idx) => {
    html += `<tr><td class="pickup-name">${s.name}</td><td class="pickup-school">${s.school}</td>`;
    dayNames.forEach((day, i) => {
      const time = s.times[day] || '-';
      const d = dates[i];
      const isToday = isSameDay(d, today);
      const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      let status = '';
      if (isPast) status = '<br><span class="pickup-status done">완료</span>';
      else if (isToday) status = '<br><span class="pickup-status waiting">대기</span>';
      else status = '<br><span class="pickup-status scheduled">예정</span>';

      html += `<td><span class="pickup-time">${time}</span>${status}</td>`;
    });
    if (admin) html += `<td><button class="delete-btn" onclick="deletePickupStudent(${idx})">삭제</button></td>`;
    html += '</tr>';
  });

  html += '</tbody>';
  document.getElementById('pickupTable').innerHTML = html;
}

export function addPickupStudent() {
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

export function deletePickupStudent(idx) {
  if (!confirm('이 아동을 픽업 목록에서 삭제하시겠습니까?')) return;
  pickupStudents.splice(idx, 1);
  renderPickupTable();
}

export function initPickup() {
  renderPickupTable();
}

// window에 노출
window.changePickupWeek = changePickupWeek;
window.addPickupStudent = addPickupStudent;
window.deletePickupStudent = deletePickupStudent;
