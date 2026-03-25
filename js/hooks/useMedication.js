// ===== useMedication: 투약 관리 (Firestore) =====
import { formatDate } from '../utils.js';
import { getIsAdmin } from '../state.js';
import { subscribeMedications, createMedication, deleteMedication as deleteMedicationFS } from '../../firebase/services/medicationService.js';
import { addInboxItem } from '../../firebase/services/inboxService.js';

let medRecords = [];

export function renderMedSchedule() {
  const el = document.getElementById('medSchedule');
  if (!el) return;
  const admin = getIsAdmin();
  if (medRecords.length === 0) {
    el.innerHTML = '<div class="empty-state">투약 중인 아동이 없습니다</div>';
    return;
  }
  el.innerHTML = medRecords.map((r) => `
    <div class="med-card">
      <div class="med-avatar">${r.name.charAt(0)}</div>
      <div class="med-info">
        <div class="med-child">${r.name}</div>
        <div class="med-detail">${r.drug} ${r.dose} · ${r.symptom} · ${r.storage}</div>
      </div>
      <div class="med-time-badge">${r.time}</div>
      <div class="med-period">${r.from} ~ ${r.to}</div>
      ${admin ? `<button class="delete-btn" onclick="deleteMed('${r.id}')">삭제</button>` : ''}
    </div>
  `).join('');
}

export async function deleteMed(id) {
  if (!confirm('이 투약 기록을 삭제하시겠습니까?')) return;
  try {
    await deleteMedicationFS(id);
    // 실시간 구독이 자동으로 renderMedSchedule() 호출
  } catch (e) {
    console.error('삭제 오류:', e);
    alert('삭제 중 오류가 발생했습니다. 다시 시도해 주세요.');
  }
}

export async function submitMedication() {
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

  try {
    await createMedication({ name, drug, dose, time, symptom, hospital, from, to: to || from, storage, note });

    const dateStr = formatDate(new Date());
    await addInboxItem({
      type: 'medication', name: `${name} (${drug})`, summary: `${dose} · ${time} · ${from}~${to || from}`, date: dateStr,
      data: { name, drug, dose, time, symptom, from, to: to || from, storage, hospital, note },
      consents: ['부작용 안내 동의', '약 정보 책임 확인', '응급조치 동의']
    });

    alert('투약 의뢰서가 제출되었습니다.');
    c1.checked = false; c2.checked = false; c3.checked = false;
    // 폼 초기화
    ['medName', 'medDrug', 'medDose', 'medSymptom', 'medHospital', 'medNote'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  } catch (e) {
    console.error('제출 오류:', e);
    alert('제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
  }
}

export function printMedication() {
  window.print();
}

export function initMedication() {
  // 로딩 표시
  const el = document.getElementById('medSchedule');
  if (el) el.innerHTML = '<div class="loading-state">투약 일정 불러오는 중</div>';

  // Firestore 실시간 구독
  subscribeMedications((data) => {
    medRecords = data;
    renderMedSchedule();
  });
}

// window에 노출
window.deleteMed = deleteMed;
window.submitMedication = submitMedication;
window.printMedication = printMedication;
