// ===== useLogin: 로그인 폼 로직 (Firebase Auth + Firestore 역할) =====
import { login, onAuthChange } from '../../firebase/auth.js';
import { getUserDoc, createUserDoc, hasNoDirector } from '../../firebase/services/userService.js';

export function initLogin() {
  // 이미 로그인된 상태면 메인으로 리다이렉트
  onAuthChange(async (user) => {
    if (user) {
      // Firestore 사용자 문서 확인
      const userDoc = await getUserDoc(user.uid);
      if (!userDoc) {
        // Firestore 문서가 없는 경우 (Firebase Console에서 직접 만든 계정)
        // 센터장이 없으면 센터장으로, 아니면 선생님으로 자동 생성
        const noDirector = await hasNoDirector();
        await createUserDoc(user.uid, {
          email: user.email,
          name: user.email.split('@')[0],
          role: noDirector ? 'director' : 'teacher',
          phone: ''
        });
      }

      const doc = userDoc || await getUserDoc(user.uid);
      if (doc && !doc.approved) {
        // 승인 대기 중이면 대기 페이지로
        window.location.href = 'pending.html';
        return;
      }
      window.location.href = 'index.html';
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

  const result = await login(email, password);

  if (!result.success) {
    showError('이메일 또는 비밀번호가 올바르지 않습니다.');
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
    return;
  }
  // onAuthChange가 리다이렉트 처리
}

// window 노출
window.doLogin = doLogin;
