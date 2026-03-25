// ===== useSignup: 회원가입 폼 로직 =====
import { seedUsersIfNeeded, isEmailTaken, addUser, getSession } from '../authData.js';

export function initSignup() {
  seedUsersIfNeeded();

  // 이미 로그인된 상태면 메인으로 리다이렉트
  const session = getSession();
  if (session) {
    window.location.href = 'index.html';
    return;
  }
}

function showError(msg) {
  const el = document.getElementById('signupError');
  const successEl = document.getElementById('signupSuccess');
  if (successEl) successEl.style.display = 'none';
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}

function hideError() {
  const el = document.getElementById('signupError');
  if (el) el.style.display = 'none';
}

function showSuccess(msg) {
  const el = document.getElementById('signupSuccess');
  const errorEl = document.getElementById('signupError');
  if (errorEl) errorEl.style.display = 'none';
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}

export function doSignup() {
  hideError();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
  const phone = document.getElementById('signupPhone').value.trim();
  const position = document.getElementById('signupPosition').value;
  const consent = document.getElementById('signupConsent').checked;

  // 유효성 검증
  if (!name) {
    showError('이름을 입력해 주세요.');
    document.getElementById('signupName').focus();
    return;
  }

  if (!email) {
    showError('이메일을 입력해 주세요.');
    document.getElementById('signupEmail').focus();
    return;
  }

  if (!email.includes('@')) {
    showError('올바른 이메일 형식을 입력해 주세요.');
    document.getElementById('signupEmail').focus();
    return;
  }

  if (password.length < 4) {
    showError('비밀번호는 4자리 이상이어야 합니다.');
    document.getElementById('signupPassword').focus();
    return;
  }

  if (password !== passwordConfirm) {
    showError('비밀번호가 일치하지 않습니다.');
    document.getElementById('signupPasswordConfirm').value = '';
    document.getElementById('signupPasswordConfirm').focus();
    return;
  }

  if (!phone) {
    showError('연락처를 입력해 주세요.');
    document.getElementById('signupPhone').focus();
    return;
  }

  if (!consent) {
    showError('개인정보 수집·이용에 동의해 주세요.');
    return;
  }

  // 이메일 중복 체크
  if (isEmailTaken(email)) {
    showError('이미 사용 중인 이메일입니다.');
    document.getElementById('signupEmail').focus();
    return;
  }

  // 새 유저 생성 (승인 대기)
  const newUser = {
    uid: 'teacher_' + Date.now(),
    email,
    password,
    name,
    role: 'teacher',
    phone,
    position,
    createdAt: new Date().toISOString().split('T')[0],
    approved: false,
  };

  addUser(newUser);

  // 폼 숨기고 승인 대기 안내
  document.getElementById('signupFormFields').innerHTML = `
    <div class="auth-pending">
      <div class="auth-pending-icon">⏳</div>
      <div class="auth-pending-title">가입 신청이 완료되었습니다</div>
      <p class="auth-pending-desc">
        센터장의 승인 후 로그인이 가능합니다.<br>
        승인 완료 시 안내드리겠습니다.
      </p>
      <a href="login.html" class="btn-upload" style="display:inline-block;text-align:center;">로그인 페이지로</a>
    </div>
  `;
}

// window 노출
window.doSignup = doSignup;
