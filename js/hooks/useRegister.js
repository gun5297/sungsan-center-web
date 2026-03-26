// ===== useRegister: 신규 등록 & 상담 신청 (Firestore) =====
import { on } from '../events.js';
import { formatDate, resetFields, validateMaxLength, canSubmit } from '../utils.js';
import { addInboxItem } from '../../firebase/services/inboxService.js';

export function switchRegTab(tabId) {
  document.getElementById('regTab').style.display = tabId === 'regTab' ? 'block' : 'none';
  document.getElementById('consultTab').style.display = tabId === 'consultTab' ? 'block' : 'none';
  document.querySelectorAll('.register-tabs .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
}

export async function submitRegister() {
  if (!canSubmit('register')) { showToast('잠시 후 다시 시도해 주세요.', 'warning'); return; }
  const name = document.getElementById('regChildName').value.trim();
  const guardian = document.getElementById('regGuardian').value.trim();
  const phone = document.getElementById('regPhone').value.trim();

  if (!name || !guardian || !phone) {
    showToast('아동 성명, 보호자 성명, 연락처를 모두 입력해주세요.', 'warning');
    return;
  }

  if (!validateMaxLength(name, 20)) {
    showToast('입력값이 너무 깁니다 (이름: 최대 20자)', 'warning');
    return;
  }

  const cGuardian = document.getElementById('regConsentGuardian');
  const c1 = document.getElementById('regConsent1');
  const c2 = document.getElementById('regConsent2');
  const c3 = document.getElementById('regConsent3');
  if (!cGuardian.checked || !c1.checked || !c2.checked) { showToast('필수 동의 항목에 체크해주세요.', 'warning'); return; }

  const birth = document.getElementById('regChildBirth').value;
  const gender = document.getElementById('regGender').value;
  const school = document.getElementById('regSchool').value.trim();
  const relation = document.getElementById('regRelation').value;
  const emergency = document.getElementById('regEmergency').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  const note = document.getElementById('regNote').value.trim();
  const days = [...document.querySelectorAll('#regDays input:checked')].map(c => c.value).join(', ');

  if (address && !validateMaxLength(address, 200)) {
    showToast('입력값이 너무 깁니다 (주소: 최대 200자)', 'warning');
    return;
  }

  const dateStr = formatDate(new Date());
  try {
    const result = await addInboxItem({
      type: 'register', name: `${name} (신규등록)`, summary: `${school} · 보호자: ${guardian}`, date: dateStr,
      data: { name, birth, gender, school, guardian, relation, phone, emergency, address, days, note },
      consents: ['이용규정 동의', '개인정보 수집 동의', c3.checked ? '사진촬영 동의' : '사진촬영 미동의']
    });
    const receiptNo = result?.receiptNo || '';

    showToast(receiptNo ? `${name} 아동의 이용 신청이 접수되었습니다.\n접수번호: ${receiptNo}\n담당자 확인 후 연락드리겠습니다.` : `${name} 아동의 이용 신청이 접수되었습니다.\n담당자 확인 후 연락드리겠습니다.`, 'success');
    cGuardian.checked = false; c1.checked = false; c2.checked = false; c3.checked = false;
    // 폼 초기화
    resetFields('regChildName', 'regGuardian', 'regPhone', 'regChildBirth', 'regSchool', 'regEmergency', 'regAddress', 'regNote');
    document.querySelectorAll('#regDays input:checked').forEach(c => c.checked = false);
  } catch (e) {
    console.error('제출 오류:', e);
    showToast('제출 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
  }
}

export async function submitConsult() {
  if (!canSubmit('consult')) { showToast('잠시 후 다시 시도해 주세요.', 'warning'); return; }
  const guardian = document.getElementById('conGuardian').value.trim();
  const child = document.getElementById('conChild').value.trim();
  const detail = document.getElementById('conDetail').value.trim();

  if (!guardian || !child || !detail) {
    showToast('보호자 성명, 아동 성명, 상담 내용을 모두 입력해주세요.', 'warning');
    return;
  }

  const conConsent = document.getElementById('conConsent');
  if (!conConsent.checked) { showToast('동의 항목에 체크해주세요.', 'warning'); return; }

  const conPhone = document.getElementById('conPhone').value.trim();
  const conDate = document.getElementById('conDate').value;
  const topic = document.getElementById('conTopic').value;

  const dateStr = formatDate(new Date());
  try {
    const result = await addInboxItem({
      type: 'consult', name: `${child} (상담)`, summary: `${topic} · 보호자: ${guardian}`, date: dateStr,
      data: { guardian, phone: conPhone, child, dateTime: conDate, topic, detail },
      consents: ['상담기록 보관 동의']
    });
    const receiptNo = result?.receiptNo || '';

    showToast(receiptNo ? `상담 신청이 접수되었습니다.\n접수번호: ${receiptNo}\n담당 선생님이 확인 후 연락드리겠습니다.` : '상담 신청이 접수되었습니다.\n담당 선생님이 확인 후 연락드리겠습니다.', 'success');
    conConsent.checked = false;
    // 폼 초기화
    resetFields('conGuardian', 'conChild', 'conDetail', 'conPhone');
  } catch (e) {
    console.error('제출 오류:', e);
    showToast('제출 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
  }
}

// window에 노출
// 이벤트 위임 등록
on('switchRegTab', (e, el) => switchRegTab(el.dataset.tab));
on('submitRegister', () => submitRegister());
on('submitConsult', () => submitConsult());
