// ===== useAbsence: 조퇴/결석 신청서 =====
import { initialAbsenceRecords } from '../data/sampleData.js';
import { formatDate, todayString } from '../utils.js';
import { addInboxItem, updateInboxBadge } from './useInbox.js';

let absenceRecords = [...initialAbsenceRecords];

export function renderAbsenceList() {
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

export function submitAbsence() {
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

  const dateStr = formatDate(new Date());
  const guardian = document.getElementById('absGuardian').value.trim();
  const phone = document.getElementById('absPhone').value.trim();
  const absDate = document.getElementById('absDate').value;
  const consent = document.getElementById('absConsent');
  if (!consent.checked) { alert('동의 항목에 체크해주세요.'); return; }

  absenceRecords.unshift({ type, name, school, reason, from, to, date: dateStr });
  addInboxItem({
    type: 'absence', name: `${name} (${type})`, summary: `${reason} | ${from} ~ ${to}`, date: dateStr,
    data: { type, name, school, guardian, phone, reason, from, to, absDate },
    consents: ['운영규정 안내 동의']
  });
  updateInboxBadge();
  renderAbsenceList();
  alert('신청서가 제출되었습니다.');
  consent.checked = false;
}

export function printAbsence() {
  window.print();
}

function initDates() {
  const today = todayString();
  ['absDate', 'absFrom', 'absTo'].forEach(id => {
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
}

export function initAbsence() {
  initDates();
  renderAbsenceList();
}

// window에 노출
window.submitAbsence = submitAbsence;
window.printAbsence = printAbsence;
