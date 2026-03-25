// ===== useRegister: 신규 등록 & 상담 신청 =====
import { formatDate } from '../utils.js';
import { addInboxItem, updateInboxBadge } from './useInbox.js';

export function switchRegTab(tabId) {
  document.getElementById('regTab').style.display = tabId === 'regTab' ? 'block' : 'none';
  document.getElementById('consultTab').style.display = tabId === 'consultTab' ? 'block' : 'none';
  document.querySelectorAll('.register-tabs .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
}

export function submitRegister() {
  const name = document.getElementById('regChildName').value.trim();
  const guardian = document.getElementById('regGuardian').value.trim();
  const phone = document.getElementById('regPhone').value.trim();

  if (!name || !guardian || !phone) {
    alert('아동 성명, 보호자 성명, 연락처를 모두 입력해주세요.');
    return;
  }

  const c1 = document.getElementById('regConsent1');
  const c2 = document.getElementById('regConsent2');
  const c3 = document.getElementById('regConsent3');
  if (!c1.checked || !c2.checked) { alert('필수 동의 항목에 체크해주세요.'); return; }

  const birth = document.getElementById('regChildBirth').value;
  const gender = document.getElementById('regGender').value;
  const school = document.getElementById('regSchool').value.trim();
  const relation = document.getElementById('regRelation').value;
  const emergency = document.getElementById('regEmergency').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  const note = document.getElementById('regNote').value.trim();
  const days = [...document.querySelectorAll('#regDays input:checked')].map(c => c.value).join(', ');

  const dateStr = formatDate(new Date());
  addInboxItem({
    type: 'register', name: `${name} (신규등록)`, summary: `${school} · 보호자: ${guardian}`, date: dateStr,
    data: { name, birth, gender, school, guardian, relation, phone, emergency, address, days, note },
    consents: ['이용규정 동의', '개인정보 수집 동의', c3.checked ? '사진촬영 동의' : '사진촬영 미동의']
  });
  updateInboxBadge();
  alert(`${name} 아동의 이용 신청이 접수되었습니다.\n담당자 확인 후 연락드리겠습니다.`);
  c1.checked = false; c2.checked = false; c3.checked = false;
}

export function submitConsult() {
  const guardian = document.getElementById('conGuardian').value.trim();
  const child = document.getElementById('conChild').value.trim();
  const detail = document.getElementById('conDetail').value.trim();

  if (!guardian || !child || !detail) {
    alert('보호자 성명, 아동 성명, 상담 내용을 모두 입력해주세요.');
    return;
  }

  const conConsent = document.getElementById('conConsent');
  if (!conConsent.checked) { alert('동의 항목에 체크해주세요.'); return; }

  const conPhone = document.getElementById('conPhone').value.trim();
  const conDate = document.getElementById('conDate').value;
  const topic = document.getElementById('conTopic').value;

  const dateStr = formatDate(new Date());
  addInboxItem({
    type: 'consult', name: `${child} (상담)`, summary: `${topic} · 보호자: ${guardian}`, date: dateStr,
    data: { guardian, phone: conPhone, child, dateTime: conDate, topic, detail },
    consents: ['상담기록 보관 동의']
  });
  updateInboxBadge();
  alert(`상담 신청이 접수되었습니다.\n담당 선생님이 확인 후 연락드리겠습니다.`);
  conConsent.checked = false;
}

// window에 노출
window.switchRegTab = switchRegTab;
window.submitRegister = submitRegister;
window.submitConsult = submitConsult;
