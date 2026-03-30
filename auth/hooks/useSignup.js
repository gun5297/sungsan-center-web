// ===== useSignup: 회원가입 (Firebase Auth + Firestore) =====
import { auth, db } from '../../firebase/config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { createUserDoc } from '../../firebase/services/userService.js';
import { onAuthChange } from '../../firebase/auth.js';
import { on } from '../../js/events.js';

export function initSignup() {
  // 이미 로그인된 상태면 로그아웃 (회원가입 페이지는 비로그인 상태에서만 사용)
  onAuthChange(async (user) => {
    if (user) {
      const { signOut } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js");
      await signOut(auth);
    }
  });
}

function showError(msg) {
  const el = document.getElementById('signupError');
  const successEl = document.getElementById('signupSuccess');
  if (successEl) successEl.style.display = 'none';
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function hideError() {
  const el = document.getElementById('signupError');
  if (el) el.style.display = 'none';
}

export async function doSignup() {
  hideError();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
  const phone = document.getElementById('signupPhone').value.trim();
  const role = 'general'; // 모든 가입자는 일반(학부모)로 가입, 관리자 역할은 관리자가 마이페이지에서 변경
  const consent = document.getElementById('signupConsent').checked;

  if (!name) { showError('이름을 입력해 주세요.'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('올바른 이메일을 입력해 주세요.'); return; }
  if (password.length < 6) { showError('비밀번호는 6자리 이상이어야 합니다.'); return; }
  if (password !== passwordConfirm) { showError('비밀번호가 일치하지 않습니다.'); document.getElementById('signupPasswordConfirm').value = ''; return; }
  if (!phone) { showError('연락처를 입력해 주세요.'); return; }
  if (!consent) { showError('개인정보 수집·이용에 동의해 주세요.'); return; }

  try {
    // Firebase Auth 계정 생성
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;

    // Firestore 사용자 문서 생성 (모든 가입자는 승인 대기 상태)
    await createUserDoc(uid, { email, name, role, phone });

    // 관리자에게 가입 알림 전송
    try {
      await addDoc(collection(db, 'notifications'), {
        type: 'signup',
        message: `${name}님이 가입 승인을 요청했습니다.`,
        createdAt: serverTimestamp()
      });
    } catch (e) { console.warn('가입 알림 전송 실패:', e); }

    // 가입 완료 화면
    document.getElementById('signupFormFields').innerHTML = `
      <div class="auth-pending">
        <div class="auth-pending-icon">⏳</div>
        <div class="auth-pending-title">가입 신청 완료</div>
        <p class="auth-pending-desc">
          관리자의 승인 후 로그인이 가능합니다.<br>승인 완료 시 안내드리겠습니다.
        </p>
        <a href="login.html" class="btn-upload" style="display:inline-block;text-align:center;margin-top:16px;">로그인 페이지로</a>
      </div>
    `;

    // 가입 후 로그아웃 (승인 전까지 로그인 불가)
    const { signOut } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js");
    await signOut(auth);

  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      showError('가입할 수 없는 이메일입니다. 이미 가입하셨다면 로그인해 주세요.');
    } else if (error.code === 'auth/weak-password') {
      showError('비밀번호는 6자리 이상이어야 합니다.');
    } else {
      showError('가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }
}

// 이벤트 위임 등록
on('doSignup', () => doSignup());
