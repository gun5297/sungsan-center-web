// ===== useLogin: 로그인 폼 로직 =====
import { seedUsersIfNeeded, findUserByCredentials, saveSession, getSession } from '../authData.js';

export function initLogin() {
  seedUsersIfNeeded();

  // 이미 로그인된 상태면 메인으로 리다이렉트
  const session = getSession();
  if (session) {
    window.location.href = 'index.html';
    return;
  }

  // Enter 키 핸들러
  const pwInput = document.getElementById('loginPassword');
  if (pwInput) {
    pwInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });
  }

  const emailInput = document.getElementById('loginEmail');
  if (emailInput) {
    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('loginPassword').focus();
    });
  }
}

function showError(msg) {
  const el = document.getElementById('loginError');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}

function hideError() {
  const el = document.getElementById('loginError');
  if (el) el.style.display = 'none';
}

export function doLogin() {
  hideError();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email) {
    showError('이메일을 입력해 주세요.');
    document.getElementById('loginEmail').focus();
    return;
  }

  if (!password) {
    showError('비밀번호를 입력해 주세요.');
    document.getElementById('loginPassword').focus();
    return;
  }

  const user = findUserByCredentials(email, password);

  if (!user) {
    showError('이메일 또는 비밀번호가 올바르지 않습니다.');
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
    return;
  }

  if (!user.approved) {
    showError('승인 대기 중인 계정입니다. 센터장에게 문의해 주세요.');
    return;
  }

  // 로그인 성공
  saveSession(user);
  window.location.href = 'index.html';
}

// window 노출
window.doLogin = doLogin;
