// ===== 번호 입력 & 출결 기록 & 성공 화면 =====
// 보안 개선:
//   students 컬렉션 조회 완전 제거 — ID만으로 출결 기록
//   화면에 이름/학년 등 개인정보 미표시
//   관리자 패널에서만 이름+시간 확인 가능

import { getTodayRecords, saveTodayRecords } from '../data.js';
import { playBell } from './useBell.js';
import { showScreen } from './useScreen.js';
import { on } from '../../js/events.js';

let inputCode = '';

function updateDisplay() {
  document.getElementById('inputNumber').textContent = inputCode;
  const dots = document.querySelectorAll('#inputDots .dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < inputCode.length);
  });
}

function showInputError(msg) {
  const greeting = document.getElementById('greeting');
  greeting.textContent = msg || '오류가 발생했습니다';
  greeting.style.color = 'var(--danger)';
  inputCode = '';
  updateDisplay();
  setTimeout(() => {
    greeting.textContent = '번호를 입력하세요';
    greeting.style.color = '';
  }, 2000);
}

function showSuccess(code, type, typeLabel, timeStr) {
  document.getElementById('successIcon').textContent = type === 'in' ? '✓' : '→';
  document.getElementById('successIcon').className = 'success-icon' + (type === 'out' ? ' out' : '');
  document.getElementById('successName').textContent = `${code}번`;
  document.getElementById('successType').textContent = `${typeLabel} 완료`;
  document.getElementById('successTime').textContent = timeStr;

  // 이름/연락처 미표시 — 개인정보 노출 방지
  const smsEl = document.getElementById('successSms');
  smsEl.textContent = '';
  const notice = document.createElement('span');
  notice.className = 'sms-timer';
  notice.textContent = '알림 서비스 준비 중';
  smsEl.appendChild(notice);

  showScreen('screenSuccess');
  inputCode = '';
  updateDisplay();

  setTimeout(() => {
    showScreen('screenMain');
  }, 1200);
}

async function recordAttendance(code) {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let records, students;
  try {
    records = await getTodayRecords();
  } catch (e) {
    console.error('[useInput] 출결 기록 조회 실패:', e);
    showInputError('서버 오류. 잠시 후 다시 시도하세요.');
    return;
  }
  let type, typeLabel;
  if (!records[code]) {
    records[code] = { inTime: timeStr, inTs: Date.now(), outTime: null, outTs: null };
    type = 'in';
    typeLabel = '등원';
  } else if (!records[code].outTime) {
    records[code].outTime = timeStr;
    records[code].outTs = Date.now();
    type = 'out';
    typeLabel = '하원';
  } else {
    records[code].outTime = timeStr;
    records[code].outTs = Date.now();
    type = 'out';
    typeLabel = '하원';
  }

  try {
    await saveTodayRecords(records);
  } catch (e) {
    console.error('[useInput] 출결 저장 실패:', e);
    showInputError('저장 실패. 관리자에게 문의하세요.');
    return;
  }

  playBell(type);
  showSuccess(code, type, typeLabel, timeStr);
}

function pressNum(n) {
  if (inputCode.length >= 4) return;
  inputCode += n;
  updateDisplay();
  
  if (inputCode.length === 4) {
    setTimeout(() => {
      pressConfirm();
    }, 100);
  }
}

function pressDelete() {
  inputCode = inputCode.slice(0, -1);
  updateDisplay();
}

async function pressConfirm() {
  if (inputCode.length === 0) return;
  const code = inputCode.padStart(4, '0');
  inputCode = '';
  updateDisplay();
  await recordAttendance(code);
}

// 이벤트 위임 등록
on('pressNum', (e, el) => pressNum(el.dataset.key));
on('pressDelete', () => pressDelete());
on('pressConfirm', () => pressConfirm());
