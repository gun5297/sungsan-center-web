// ===== 잠금 화면 =====
// 보안 강화:
// 1. 누적 실패 기반 단계적 잠금 (localStorage 영속)
//    5회→30초, 10회→1분, 15회→3분, 20회→5분, 이후 5회마다→10분
// 2. 비밀번호를 Firestore settings에서 동적으로 가져옴
// 3. 익명 Auth로 로그인 후 Firestore read/write 인증

import { checkAttendancePassword } from '../../firebase/services/settingsService.js';
import { loginAnonymously } from '../../firebase/auth.js';
import { auth } from '../../firebase/config.js';
import { showScreen } from './useScreen.js';
import { on } from '../../js/events.js';

let lockCode = '';

// 페이지 로드 시 즉시 익명 로그인 (publicConfig 읽기 권한 확보)
loginAnonymously().catch(e => console.warn('[useLock] 초기 익명 인증 실패:', e));

// ===== 누적 잠금 시스템 (localStorage 영속) =====
const LOCK_STORAGE_KEY = 'attLockState';

function loadLockState() {
  try {
    const raw = localStorage.getItem(LOCK_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 손상된 데이터 무시 */ }
  return { totalFails: 0, lockedUntil: 0 };
}

function saveLockState(state) {
  localStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify(state));
}

function getLockDuration(totalFails) {
  if (totalFails >= 20) return 10 * 60 * 1000; // 20회+ : 10분 (이후 5회마다)
  if (totalFails >= 15) return 3 * 60 * 1000;  // 15회 : 3분
  if (totalFails >= 10) return 1 * 60 * 1000;  // 10회 : 1분
  if (totalFails >= 5)  return 30 * 1000;       // 5회  : 30초
  return 0;
}

function isLockedOut() {
  const state = loadLockState();
  return Date.now() < state.lockedUntil;
}

function getRemainingLockSeconds() {
  const state = loadLockState();
  return Math.ceil(Math.max(0, state.lockedUntil - Date.now()) / 1000);
}

function recordFailure() {
  const state = loadLockState();
  state.totalFails++;
  const duration = getLockDuration(state.totalFails);
  if (duration > 0 && state.totalFails % 5 === 0) {
    state.lockedUntil = Date.now() + duration;
  }
  saveLockState(state);
  return state;
}

function resetLockState() {
  saveLockState({ totalFails: 0, lockedUntil: 0 });
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

function formatLockTime(seconds) {
  if (seconds >= 60) return `${Math.ceil(seconds / 60)}분`;
  return `${seconds}초`;
}

// ===== 입력 핸들러 =====
function pressLock(n) {
  if (isLockedOut()) return;
  if (lockCode.length >= 4) return;
  lockCode += n;
  updateLockDots();
}

function pressLockDelete() {
  if (isLockedOut()) return;
  lockCode = lockCode.slice(0, -1);
  updateLockDots();
  const errorEl = document.getElementById('lockError');
  if (errorEl) errorEl.classList.add('hidden');
}

async function pressLockConfirm() {
  if (lockCode.length === 0) return;

  if (isLockedOut()) {
    showLockError(`잠금 중입니다. ${formatLockTime(getRemainingLockSeconds())} 후 다시 시도하세요.`);
    lockCode = '';
    updateLockDots();
    return;
  }

  const input = lockCode;
  lockCode = '';
  updateLockDots();

  let isCorrect = false;
  try {
    isCorrect = await checkAttendancePassword(input);
  } catch (e) {
    console.error('[useLock] 비밀번호 확인 실패:', e);
    showLockError('서버 연결 오류. 잠시 후 다시 시도하세요.');
    return;
  }

  if (isCorrect) {
    resetLockState();

    if (!auth.currentUser) {
      try { await loginAnonymously(); }
      catch (e) { console.warn('[useLock] 익명 인증 실패:', e); }
    }

    const errorEl = document.getElementById('lockError');
    if (errorEl) errorEl.classList.add('hidden');
    showScreen('screenMain');
    history.pushState({ screen: 'main' }, '');
  } else {
    const state = recordFailure();
    if (isLockedOut()) {
      showLockError(`비밀번호 ${state.totalFails}회 오류. ${formatLockTime(getRemainingLockSeconds())}간 잠금됩니다.`);
    } else {
      const nextLock = 5 - (state.totalFails % 5);
      showLockError(`비밀번호가 올바르지 않습니다. (${nextLock}회 후 잠금)`);
    }
  }
}

// 이벤트 위임 등록
on('pressLock', (e, el) => pressLock(el.dataset.key));
on('pressLockDelete', () => pressLockDelete());
on('pressLockConfirm', () => pressLockConfirm());
