// ===== useAbsence: 조퇴/결석 신청서 (Firestore) =====
import { formatDate, todayString } from '../utils.js';
import { subscribeAbsences, createAbsence } from '../../firebase/services/absenceService.js';
import { addInboxItem } from '../../firebase/services/inboxService.js';

let absenceRecords = [];

export function renderAbsenceList() {
  const list = document.getElementById('absenceList');
  if (!list) return;
  if (absenceRecords.length === 0) {
    list.innerHTML = '<div class="empty-state">제출된 신청서가 없습니다</div>';
    return;
  }
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

export async function submitAbsence() {
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

  await createAbsence({ type, name, school, guardian, reason, from, to, phone, date: dateStr });
  await addInboxItem({
    type: 'absence', name: `${name} (${type})`, summary: `${reason} | ${from} ~ ${to}`, date: dateStr,
    data: { type, name, school, guardian, phone, reason, from, to, absDate },
    consents: ['운영규정 안내 동의']
  });

  alert('신청서가 제출되었습니다.');
  consent.checked = false;
  // 실시간 구독이 자동으로 renderAbsenceList() 호출
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

  // 로딩 표시
  const list = document.getElementById('absenceList');
  if (list) list.innerHTML = '<div class="loading-state">신청 내역 불러오는 중</div>';

  // Firestore 실시간 구독
  subscribeAbsences((data) => {
    absenceRecords = data;
    renderAbsenceList();
  });
}

// window에 노출
window.submitAbsence = submitAbsence;
window.printAbsence = printAbsence;
