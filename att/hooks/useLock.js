// ===== 잠금 화면 =====

import { ATT_PASSWORD } from '../data.js';
import { showScreen } from './useScreen.js';

let lockCode = '';

function updateLockDots() {
  const dots = document.querySelectorAll('#lockDots .dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < lockCode.length);
  });
}

export function pressLock(n) {
  if (lockCode.length >= 4) return;
  lockCode += n;
  updateLockDots();
}

export function pressLockDelete() {
  lockCode = lockCode.slice(0, -1);
  updateLockDots();
  document.getElementById('lockError').classList.add('hidden');
}

export function pressLockConfirm() {
  if (lockCode.length === 0) return;

  if (lockCode === ATT_PASSWORD) {
    showScreen('screenMain');
    history.pushState({ screen: 'main' }, '');
    lockCode = '';
    updateLockDots();
    document.getElementById('lockError').classList.add('hidden');
  } else {
    document.getElementById('lockError').classList.remove('hidden');
    lockCode = '';
    updateLockDots();
    const dots = document.getElementById('lockDots');
    dots.classList.add('shake');
    setTimeout(() => dots.classList.remove('shake'), 500);
  }
}

// window 노출
window.pressLock = pressLock;
window.pressLockDelete = pressLockDelete;
window.pressLockConfirm = pressLockConfirm;
