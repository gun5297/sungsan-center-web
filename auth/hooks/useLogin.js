// ===== useLogin: 로그인 폼 로직 (Firebase Auth + Firestore 역할) =====
import { login, logout, onAuthChange } from '../../firebase/auth.js';
import { getUserDoc, createUserDoc, hasNoDirector } from '../../firebase/services/userService.js';

// doLogin()에서 직접 리다이렉트할 때는 onAuthChange 무시
let loginInProgress = false;

export function initLogin() {
  // 이미 로그인된 상태면 메인으로 리다이렉트
  onAuthChange(async (user) => {
    if (loginInProgress) return; // doLogin()이 직접 처리 중
    if (user) {
      try {
        await handleAuthRedirect(user);
      } catch (e) {
        console.error('로그인 상태 확인 실패:', e);
        // Firestore 오류 시 로그아웃 → 로그인 폼 표시
        await logout();
      }
    }
  });

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

// 로그인 후 Firestore 확인 + 리다이렉트
async function handleAuthRedirect(user) {
  let userDoc = await getUserDoc(user.uid);
  if (!userDoc) {
    // Firestore 문서가 없는 경우 (Firebase Console에서 직접 만든 계정)
    const noAdmin = await hasNoDirector();
    await createUserDoc(user.uid, {
      email: user.email,
      name: user.email.split('@')[0],
      role: noAdmin ? 'admin' : 'general',
      phone: ''
    });
    userDoc = await getUserDoc(user.uid);
  }

  if (userDoc && !userDoc.approved) {
    window.location.href = 'pending.html';
    return;
  }
  window.location.href = 'index.html';
}

export async function doLogin() {
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

  // 로그인 버튼 비활성화 (중복 클릭 방지)
  const btn = document.querySelector('.btn-upload');
  if (btn) { btn.disabled = true; btn.textContent = '로그인 중...'; }

  loginInProgress = true;
  try {
    const result = await login(email, password);

    if (!result.success) {
      showError('이메일 또는 비밀번호가 올바르지 않습니다.');
      document.getElementById('loginPassword').value = '';
      document.getElementById('loginPassword').focus();
      return;
    }

    // 직접 리다이렉트 처리
    try {
      await handleAuthRedirect(result.user);
    } catch (e) {
      console.error('리다이렉트 처리 실패:', e);
      window.location.href = 'index.html';
    }
  } catch (e) {
    console.error('로그인 오류:', e);
    showError('로그인 중 오류가 발생했습니다. 다시 시도해 주세요.');
  } finally {
    loginInProgress = false;
    if (btn) { btn.disabled = false; btn.textContent = '로그인'; }
  }
}

// window 노출
window.doLogin = doLogin;
