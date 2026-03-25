// ===== 잠금 화면 =====
// 보안 강화:
// 1. 5회 실패 시 30초 잠금 (무차별 대입 방어)
// 2. 비밀번호를 Firestore settings에서 동적으로 가져옴
// 3. 성공 시 Firebase 익명 Auth 로그인 → 이후 Firestore write 인증됨

import { checkAttendancePassword } from '../../firebase/services/settingsService.js';
import { loginAnonymously } from '../../firebase/auth.js';
import { showScreen } from './useScreen.js';

let lockCode = '';

// ===== 무차별 대입 방어 =====
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 1000; // 30초
let failedAttempts = 0;
let lockedUntil = 0;

function isLockedOut() {
  return Date.now() < lockedUntil;
}

function getRemainingLockSeconds() {
  return Math.ceil((lockedUntil - Date.now()) / 1000);
}

function recordFailure() {
  failedAttempts++;
  if (failedAttempts >= MAX_ATTEMPTS) {
    lockedUntil = Date.now() + LOCKOUT_MS;
    failedAttempts = 0; // 잠금 후 카운터 리셋
  }
}

// ===== 도트 UI =====
function updateLockDots() {
  const dots = document.querySelectorAll('#lockDots .dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < lockCode.length);
  });
}

function showLockError(msg) {
  const errorEl = document.getElementById('lockError');
  if (errorEl) {
    errorEl.textContent = msg || '비밀번호가 올바르지 않습니다';
    errorEl.classList.remove('hidden');
  }
  lockCode = '';
  updateLockDots();
  const dots = document.getElementById('lockDots');
  if (dots) {
    dots.classList.add('shake');
    setTimeout(() => dots.classList.remove('shake'), 500);
  }
}

// ===== 입력 핸들러 =====
export function pressLock(n) {
  if (isLockedOut()) return; // 잠금 중엔 입력 차단
  if (lockCode.length >= 4) return;
  lockCode += n;
  updateLockDots();
}

export function pressLockDelete() {
  if (isLockedOut()) return;
  lockCode = lockCode.slice(0, -1);
  updateLockDots();
  const errorEl = document.getElementById('lockError');
  if (errorEl) errorEl.classList.add('hidden');
}

export async function pressLockConfirm() {
  if (lockCode.length === 0) return;

  // 잠금 상태 체크
  if (isLockedOut()) {
    showLockError(`너무 많이 틀렸습니다. ${getRemainingLockSeconds()}초 후 다시 시도하세요.`);
    lockCode = '';
    updateLockDots();
    return;
  }

  const input = lockCode;
  lockCode = '';
  updateLockDots();

  // Firestore에서 비밀번호 검증
  let isCorrect = false;
  try {
    isCorrect = await checkAttendancePassword(input);
  } catch (e) {
    console.error('[useLock] 비밀번호 확인 실패:', e);
    showLockError('서버 연결 오류. 잠시 후 다시 시도하세요.');
    return;
  }

  if (isCorrect) {
    // 성공: 카운터 초기화
    failedAttempts = 0;
    lockedUntil = 0;

    // 익명 Firebase Auth 로그인 (Firestore write 권한 획득)
    try {
      await loginAnonymously();
    } catch (e) {
      console.warn('[useLock] 익명 인증 실패 — 출결 기록이 저장되지 않을 수 있습니다:', e);
    }

    const errorEl = document.getElementById('lockError');
    if (errorEl) errorEl.classList.add('hidden');
    showScreen('screenMain');
    history.pushState({ screen: 'main' }, '');
  } else {
    // 실패: 시도 횟수 기록
    recordFailure();
    if (isLockedOut()) {
      showLockError(`비밀번호 ${MAX_ATTEMPTS}회 오류. ${getRemainingLockSeconds()}초간 잠금됩니다.`);
    } else {
      const remaining = MAX_ATTEMPTS - failedAttempts;
      showLockError(`비밀번호가 올바르지 않습니다. (${remaining}회 남음)`);
    }
  }
}

// window 노출
window.pressLock = pressLock;
window.pressLockDelete = pressLockDelete;
window.pressLockConfirm = pressLockConfirm;
