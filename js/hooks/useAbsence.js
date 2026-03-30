// ===== useAbsence: 조퇴/결석 신청서 (Firestore) =====
import { on } from '../events.js';
import { formatDate, todayString, resetFields, skeletonCards, escapeHtml, validateMaxLength, canSubmit } from '../utils.js';
import { getIsAdmin, isLoggedIn } from '../state.js';
import { subscribeAbsences, createAbsence, deleteAbsence as deleteAbsenceFS } from '../../firebase/services/absenceService.js';
import { addInboxItem } from '../../firebase/services/inboxService.js';
import { uploadSignature } from '../../firebase/services/signatureService.js';
import { openSignaturePad } from '../signature.js';

let absenceRecords = [];

export function renderAbsenceList() {
  const list = document.getElementById('absenceList');
  if (!list) return;
  const admin = getIsAdmin();
  if (absenceRecords.length === 0) {
    list.innerHTML = '<div class="empty-state">제출된 신청서가 없습니다</div>';
    return;
  }
  list.innerHTML = absenceRecords.map(r => `
    <div class="notice-card">
      <div class="notice-header">
        <span class="notice-badge type-${r.type === '결석' ? '긴급' : '공지'}">${escapeHtml(r.type)}</span>
        <span class="notice-date">${escapeHtml(r.date)}</span>
        ${admin ? `<button class="delete-btn" data-action="deleteAbsence" data-id="${escapeHtml(r.id)}">삭제</button>` : ''}
      </div>
      <div class="notice-title">${escapeHtml(r.name)} (${escapeHtml(r.school)})</div>
      <div class="notice-preview">사유: ${escapeHtml(r.reason)} | 기간: ${escapeHtml(r.from)} ~ ${escapeHtml(r.to)}</div>
    </div>
  `).join('');
}

export async function deleteAbsence(id) {
  if (!await showConfirm('이 신청서를 삭제하시겠습니까?')) return;
  try {
    await deleteAbsenceFS(id);
  } catch (e) {
    console.error('결석 신청서 삭제 오류:', e);
    showToast('삭제 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
  }
}

export async function submitAbsence() {
  if (!canSubmit('absence')) { showToast('잠시 후 다시 시도해 주세요.', 'warning'); return; }
  const submitBtn = document.querySelector('[data-action="submitAbsence"]');
  if (submitBtn) submitBtn.disabled = true;
  try { await _doSubmitAbsence(); } finally { if (submitBtn) submitBtn.disabled = false; }
}

async function _doSubmitAbsence() {
  const type = document.getElementById('absType').value;
  const name = document.getElementById('absName').value.trim();
  const school = document.getElementById('absSchool').value.trim();
  const reason = document.getElementById('absReason').value.trim();
  const from = document.getElementById('absFrom').value;
  const to = document.getElementById('absTo').value;

  if (!name || !reason || !from) {
    showToast('아동 성명, 사유, 기간을 모두 입력해주세요.', 'warning');
    return;
  }

  if (!validateMaxLength(name, 20)) {
    showToast('입력값이 너무 깁니다 (이름: 최대 20자)', 'warning');
    return;
  }
  if (!validateMaxLength(reason, 500)) {
    showToast('입력값이 너무 깁니다 (사유: 최대 500자)', 'warning');
    return;
  }

  const dateStr = formatDate(new Date());
  const guardian = document.getElementById('absGuardian').value.trim();
  const phone = document.getElementById('absPhone').value.trim();
  const absDate = document.getElementById('absDate')?.value || '';
  const consentHealth = document.getElementById('absConsentHealth');
  if (!consentHealth.checked) { showToast('건강정보 수집 동의에 체크해주세요.', 'warning'); return; }
  const consent = document.getElementById('absConsent');
  if (!consent.checked) { showToast('동의 항목에 체크해주세요.', 'warning'); return; }

  try {
    await createAbsence({ type, name, school: school || '', guardian: guardian || '', reason, from, to: to || from, phone: phone || '', date: dateStr });
  } catch (e) {
    console.error('결석 기록 저장 오류:', e);
    showToast('제출 중 오류가 발생했습니다: ' + e.message, 'error');
    return;
  }

  // 전자서명 이미지 가져오기 → Storage 업로드
  const signImg = document.getElementById('absSignImg');
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

  let receiptNo = '';
  try {
    const result = await addInboxItem({
      type: 'absence', name: `${name} (${type})`, summary: `${reason} | ${from} ~ ${to || from}`, date: dateStr,
      data: { type, name, school: school || '', guardian: guardian || '', phone: phone || '', reason, from, to: to || from, absDate: absDate || '', signature: signatureData },
      consents: ['건강정보(민감정보) 수집 동의', '운영규정 안내 동의']
    });
    receiptNo = result?.receiptNo || '';
  } catch (e) {
    console.warn('서류함 저장 오류 (결석 기록은 저장됨):', e);
  }

  showToast(receiptNo ? `신청서가 제출되었습니다.\n접수번호: ${receiptNo}` : '신청서가 제출되었습니다.', 'success');
  consentHealth.checked = false;
  consent.checked = false;
  resetFields('absName', 'absSchool', 'absGuardian', 'absReason', 'absPhone');
}

export function printAbsence() {
  const section = document.getElementById('absence');
  section.classList.add('print-target');
  document.body.classList.add('printing');
  window.print();
  document.body.classList.remove('printing');
  section.classList.remove('print-target');
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

let _unsubAbsences = null;

export function initAbsence() {
  initDates();

  if (!isLoggedIn()) {
    if (_unsubAbsences) { _unsubAbsences(); _unsubAbsences = null; }
    absenceRecords = [];
    renderAbsenceList();
    return;
  }

  // 이미 구독 중이면 re-render만 (관리자 상태 변경 시 skeleton 없이)
  if (_unsubAbsences) {
    renderAbsenceList();
    return;
  }

  // 로딩 표시
  const list = document.getElementById('absenceList');
  if (list) list.innerHTML = skeletonCards(2);

  // Firestore 실시간 구독
  _unsubAbsences = subscribeAbsences((data) => {
    absenceRecords = data;
    renderAbsenceList();
  });
}

// 이벤트 위임 등록
on('submitAbsence', () => submitAbsence());
on('deleteAbsence', (e, el) => deleteAbsence(el.dataset.id));
on('openAbsSignature', () => {
  openSignaturePad(function(d) {
    document.getElementById('absSignImg').src = d;
    document.getElementById('absSignImg').classList.remove('hidden');
  });
});
