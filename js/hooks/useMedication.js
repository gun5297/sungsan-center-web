// ===== useMedication: 투약 관리 (Firestore) =====
import { formatDate, resetFields, escapeHtml, validateMaxLength, canSubmit } from '../utils.js';
import { getIsAdmin, getCurrentUser, isLoggedIn } from '../state.js';
import { subscribeMedications, createMedication, deleteMedication as deleteMedicationFS, completeMedication as completeMedicationFS } from '../../firebase/services/medicationService.js';
import { addInboxItem } from '../../firebase/services/inboxService.js';
import { uploadSignature } from '../../firebase/services/signatureService.js';
import { on, onAll } from '../events.js';
import { openSignaturePad } from '../signature.js';

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
    <div class="med-card${r.completed ? ' med-completed' : ''}">
      <div class="med-avatar">${escapeHtml(r.name.charAt(0))}</div>
      <div class="med-info">
        <div class="med-child">${escapeHtml(r.name)}</div>
        <div class="med-detail">${escapeHtml(r.drug)} ${escapeHtml(r.dose)} · ${escapeHtml(r.symptom)} · ${escapeHtml(r.storage)}</div>
        ${r.completed ? `<div class="med-completed-info">✓ 투약 완료 · ${escapeHtml(r.completedBy || '')} · ${r.completedAt ? new Date(r.completedAt.seconds * 1000).toLocaleString('ko-KR') : ''}</div>` : ''}
      </div>
      <div class="med-time-badge">${escapeHtml(r.time)}</div>
      <div class="med-period">${escapeHtml(r.from)} ~ ${escapeHtml(r.to)}</div>
      ${admin && !r.completed ? `<button class="med-complete-btn" data-action="completeMed" data-id="${escapeHtml(r.id)}">투약 완료</button>` : ''}
      ${admin && r.completed ? `<span class="med-complete-check">✓</span>` : ''}
      ${admin ? `<button class="delete-btn" data-action="deleteMed" data-id="${escapeHtml(r.id)}">삭제</button>` : ''}
    </div>
  `).join('');
}

export async function deleteMed(id) {
  if (!await showConfirm('이 투약 기록을 삭제하시겠습니까?')) return;
  try {
    await deleteMedicationFS(id);
    // 실시간 구독이 자동으로 renderMedSchedule() 호출
  } catch (e) {
    console.error('삭제 오류:', e);
    showToast('삭제 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
  }
}

export async function submitMedication() {
  if (!canSubmit('medication')) { showToast('잠시 후 다시 시도해 주세요.', 'warning'); return; }
  const name = document.getElementById('medName').value.trim();
  const drug = document.getElementById('medDrug').value.trim();
  const dose = document.getElementById('medDose').value.trim();
  const time = document.getElementById('medTime').value;
  const symptom = document.getElementById('medSymptom').value.trim();
  const from = document.getElementById('medFrom').value;
  const to = document.getElementById('medTo').value;
  const storage = document.getElementById('medStorage').value;

  if (!name || !drug || !from) {
    showToast('아동 성명, 약 이름, 투약 기간을 입력해주세요.', 'warning');
    return;
  }

  if (!validateMaxLength(name, 20)) {
    showToast('입력값이 너무 깁니다 (이름: 최대 20자)', 'warning');
    return;
  }
  if (!validateMaxLength(drug, 100)) {
    showToast('입력값이 너무 깁니다 (약 이름: 최대 100자)', 'warning');
    return;
  }

  const birth = document.getElementById('medBirth') ? document.getElementById('medBirth').value : '';
  const hospital = document.getElementById('medHospital') ? document.getElementById('medHospital').value.trim() : '';
  const note = document.getElementById('medNote') ? document.getElementById('medNote').value.trim() : '';
  const cHealth = document.getElementById('medConsentHealth');
  const c1 = document.getElementById('medConsent1');
  const c2 = document.getElementById('medConsent2');
  const c3 = document.getElementById('medConsent3');
  if (!cHealth.checked || !c1.checked || !c2.checked || !c3.checked) { showToast('모든 동의 항목에 체크해주세요.', 'warning'); return; }

  try {
    await createMedication({ name, birth, drug, dose, time, symptom, hospital, from, to: to || from, storage, note });

    const dateStr = formatDate(new Date());
    // 전자서명 이미지 가져오기 → Storage 업로드
    const signImg = document.getElementById('medSignImg');
    const signatureRaw = (signImg && signImg.style.display !== 'none') ? signImg.src : '';
    let signatureData = signatureRaw;
    try {
      if (signatureRaw) {
        const signatureUrl = await uploadSignature(signatureRaw);
        if (signatureUrl) signatureData = signatureUrl;
      }
    } catch (e) {
      console.warn('서명 업로드 실패, 원본 데이터 사용:', e);
    }

    const result = await addInboxItem({
      type: 'medication', name: `${name} (${drug})`, summary: `${dose} · ${time} · ${from}~${to || from}`, date: dateStr,
      data: { name, birth, drug, dose, time, symptom, from, to: to || from, storage, hospital, note, signature: signatureData },
      consents: ['건강정보(민감정보) 수집 동의', '부작용 안내 동의', '약 정보 책임 확인', '응급조치 동의']
    });
    const receiptNo = result?.receiptNo || '';

    showToast(receiptNo ? `투약 의뢰서가 제출되었습니다.\n접수번호: ${receiptNo}` : '투약 의뢰서가 제출되었습니다.', 'success');
    cHealth.checked = false; c1.checked = false; c2.checked = false; c3.checked = false;
    // 폼 초기화
    resetFields('medName', 'medBirth', 'medDrug', 'medDose', 'medSymptom', 'medHospital', 'medNote');
  } catch (e) {
    console.error('제출 오류:', e);
    showToast('제출 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
  }
}

export function printMedication() {
  const section = document.getElementById('medication');
  section.classList.add('print-target');
  document.body.classList.add('printing');
  window.print();
  document.body.classList.remove('printing');
  section.classList.remove('print-target');
}

let _unsubMedications = null;

export function initMedication() {
  if (!isLoggedIn()) {
    if (_unsubMedications) { _unsubMedications(); _unsubMedications = null; }
    medRecords = [];
    renderMedSchedule();
    return;
  }

  // 이미 구독 중이면 re-render만 (관리자 상태 변경 시 skeleton 없이)
  if (_unsubMedications) {
    renderMedSchedule();
    return;
  }

  // 로딩 표시
  const el = document.getElementById('medSchedule');
  if (el) el.innerHTML = '<div class="loading-state">투약 일정 불러오는 중</div>';

  // Firestore 실시간 구독
  _unsubMedications = subscribeMedications((data) => {
    medRecords = data;
    renderMedSchedule();
  });
}

export async function completeMed(id) {
  const user = getCurrentUser();
  const userName = user ? user.name : '관리자';
  try {
    await completeMedicationFS(id, userName);
    showToast('투약 완료 처리되었습니다.', 'success');
  } catch (e) {
    console.error('투약 완료 처리 실패:', e);
    showToast('처리 중 오류가 발생했습니다.', 'error');
  }
}

// 이벤트 위임 등록
on('deleteMed', (e, el) => deleteMed(el.dataset.id));
on('completeMed', (e, el) => completeMed(el.dataset.id));
on('submitMedication', () => submitMedication());
on('printMedication', () => printMedication());
on('openMedSignature', () => {
  openSignaturePad((dataUrl) => {
    const img = document.getElementById('medSignImg');
    if (img) {
      img.src = dataUrl;
      img.style.display = 'block';
      img.classList.remove('hidden');
    }
  });
});
