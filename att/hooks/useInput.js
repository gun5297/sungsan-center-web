// ===== 번호 입력 & 출결 기록 & 성공 화면 =====

import { getStudents, getTodayRecords, saveTodayRecords } from '../data.js';
import { playBell } from './useBell.js';
import { showScreen } from './useScreen.js';

let inputCode = '';

function updateDisplay() {
  document.getElementById('inputNumber').textContent = inputCode;
  const dots = document.querySelectorAll('#inputDots .dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < inputCode.length);
  });
}

function showError() {
  const greeting = document.getElementById('greeting');
  greeting.textContent = '등록되지 않은 번호입니다';
  greeting.style.color = 'var(--danger)';
  inputCode = '';
  updateDisplay();

  setTimeout(() => {
    greeting.textContent = '번호를 입력하세요';
    greeting.style.color = '';
  }, 2000);
}

function showSuccess(student, type, typeLabel, timeStr) {
  document.getElementById('successIcon').textContent = type === 'in' ? '✓' : '→';
  document.getElementById('successIcon').className = 'success-icon' + (type === 'out' ? ' out' : '');
  document.getElementById('successName').textContent = student.name;
  document.getElementById('successType').textContent = typeLabel;
  document.getElementById('successTime').textContent = timeStr;

  const action = type === 'in' ? '등원' : '하원';
  // textContent + createElement로 XSS 방지 (학부모 연락처 데이터가 포함되므로)
  const smsEl = document.getElementById('successSms');
  smsEl.textContent = '';
  const smsLine = document.createTextNode(`📱 ${student.parent} → "${student.name} 학생이 ${timeStr}에 ${action}하였습니다."`);
  const timer = document.createElement('span');
  timer.className = 'sms-timer';
  timer.textContent = '⏱ 1분 후 자동 발송 예정 · 1분 내 취소 가능';
  const br = document.createElement('br');
  smsEl.appendChild(smsLine);
  smsEl.appendChild(br);
  smsEl.appendChild(timer);

  showScreen('screenSuccess');
  inputCode = '';
  updateDisplay();

  setTimeout(() => {
    showScreen('screenMain');
  }, 3000);
}

async function recordAttendance(student) {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const records = await getTodayRecords();

  let type, typeLabel;

  if (!records[student.id]) {
    records[student.id] = { inTime: timeStr, inTs: Date.now(), outTime: null, outTs: null };
    type = 'in';
    typeLabel = '등원 완료';
  } else if (!records[student.id].outTime) {
    records[student.id].outTime = timeStr;
    records[student.id].outTs = Date.now();
    type = 'out';
    typeLabel = '하원 완료';
  } else {
    records[student.id].outTime = timeStr;
    records[student.id].outTs = Date.now();
    type = 'out';
    typeLabel = '하원 시간 수정';
  }

  await saveTodayRecords(records);
  playBell(type);
  showSuccess(student, type, typeLabel, timeStr);
}

export function pressNum(n) {
  if (inputCode.length >= 4) return;
  inputCode += n;
  updateDisplay();
}

export function pressDelete() {
  inputCode = inputCode.slice(0, -1);
  updateDisplay();
}

export async function pressConfirm() {
  if (inputCode.length === 0) return;

  const code = inputCode.padStart(4, '0');
  const students = await getStudents();
  const student = students.find(s => s.id === code);

  if (!student) {
    showError();
    return;
  }

  await recordAttendance(student);
}

// window 노출
window.pressNum = pressNum;
window.pressDelete = pressDelete;
window.pressConfirm = pressConfirm;
