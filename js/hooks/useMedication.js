// ===== useMedication: 투약 관리 =====
import { initialMedRecords } from '../data/sampleData.js';
import { formatDate } from '../utils.js';
import { getIsAdmin } from '../state.js';
import { addInboxItem, updateInboxBadge } from './useInbox.js';

let medRecords = [...initialMedRecords];

export function renderMedSchedule() {
  const el = document.getElementById('medSchedule');
  if (!el) return;
  const admin = getIsAdmin();
  el.innerHTML = medRecords.map((r, i) => `
    <div class="med-card">
      <div class="med-avatar">${r.name.charAt(0)}</div>
      <div class="med-info">
        <div class="med-child">${r.name}</div>
        <div class="med-detail">${r.drug} ${r.dose} · ${r.symptom} · ${r.storage}</div>
      </div>
      <div class="med-time-badge">${r.time}</div>
      <div class="med-period">${r.from} ~ ${r.to}</div>
      ${admin ? `<button class="delete-btn" onclick="deleteMed(${i})">삭제</button>` : ''}
    </div>
  `).join('');
}

export function deleteMed(index) {
  if (!confirm('이 투약 기록을 삭제하시겠습니까?')) return;
  medRecords.splice(index, 1);
  renderMedSchedule();
}

export function submitMedication() {
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

  const dateStr = formatDate(new Date());
  addInboxItem({
    type: 'medication', name: `${name} (${drug})`, summary: `${dose} · ${time} · ${from}~${to || from}`, date: dateStr,
    data: { name, drug, dose, time, symptom, from, to: to || from, storage, hospital, note },
    consents: ['부작용 안내 동의', '약 정보 책임 확인', '응급조치 동의']
  });
  updateInboxBadge();
  renderMedSchedule();
  alert('투약 의뢰서가 제출되었습니다.');
  c1.checked = false; c2.checked = false; c3.checked = false;
}

export function printMedication() {
  window.print();
}

export function initMedication() {
  renderMedSchedule();
}

// window에 노출
window.deleteMed = deleteMed;
window.submitMedication = submitMedication;
window.printMedication = printMedication;
