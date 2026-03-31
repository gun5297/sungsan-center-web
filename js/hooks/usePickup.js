// ===== usePickup: 저학년 픽업 일정표 (Firestore) =====
import { getWeekDates, isSameDay, escapeHtml } from '../utils.js';
import { getIsAdmin } from '../state.js';
import { subscribePickups, createPickup, deletePickup as deletePickupFS } from '../../firebase/services/pickupService.js';
import { on, onAll } from '../events.js';

let pickupWeekOffset = 0;
let pickupStudents = [];
let _unsubPickups = null;

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

  pickupStudents.forEach((s) => {
    html += `<tr><td class="pickup-name">${escapeHtml(s.name)}</td><td class="pickup-school">${escapeHtml(s.school)}</td>`;
    dayNames.forEach((day, i) => {
      const time = (s.times && s.times[day]) || '-';
      const d = dates[i];
      const isToday = isSameDay(d, today);
      const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      let status = '';
      if (isPast) status = '<br><span class="pickup-status done">완료</span>';
      else if (isToday) status = '<br><span class="pickup-status waiting">대기</span>';
      else status = '<br><span class="pickup-status scheduled">예정</span>';

      html += `<td><span class="pickup-time">${escapeHtml(time)}</span>${status}</td>`;
    });
    if (admin) html += `<td><button class="delete-btn" data-action="deletePickupStudent" data-id="${escapeHtml(s.id)}">삭제</button></td>`;
    html += '</tr>';
  });

  html += '</tbody>';
  document.getElementById('pickupTable').innerHTML = html;
}

export async function addPickupStudent() {
  const name = document.getElementById('pickupName').value.trim();
  const school = document.getElementById('pickupSchool').value.trim();
  if (!name || !school) { showToast('이름과 학교를 입력해주세요.', 'warning'); return; }
  if (pickupStudents.some(s => s.name === name && s.school === school)) {
    showToast('이미 등록된 아동입니다.', 'warning'); return;
  }

  await createPickup({
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
  // 실시간 구독이 자동으로 renderPickupTable() 호출
}

export async function deletePickupStudent(id) {
  if (!await showConfirm('이 아동을 픽업 목록에서 삭제하시겠습니까?')) return;
  await deletePickupFS(id);
  // 실시간 구독이 자동으로 renderPickupTable() 호출
}

export function initPickup() {
  if (_unsubPickups) { _unsubPickups(); _unsubPickups = null; }
  _unsubPickups = subscribePickups((data) => {
    pickupStudents = data;
    renderPickupTable();
  });
}

// 이벤트 위임 등록
on('changePickupWeek', (e, el) => changePickupWeek(parseInt(el.dataset.dir)));
on('addPickupStudent', () => addPickupStudent());
on('deletePickupStudent', (e, el) => deletePickupStudent(el.dataset.id));
