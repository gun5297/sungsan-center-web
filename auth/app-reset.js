// ===== 비밀번호 재설정 페이지 진입점 =====
import { ResetPasswordForm } from './components/ResetPasswordForm.js';
import { auth } from '../firebase/config.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { on, initEvents } from './events.js';

// 0단계: 이벤트 위임 초기화
initEvents();

// 1단계: 컴포넌트 마운트
document.getElementById('app').innerHTML = ResetPasswordForm();

// 2단계: 기능 구현
function showError(msg) {
  const el = document.getElementById('resetError');
  const successEl = document.getElementById('resetSuccess');
  if (successEl) successEl.style.display = 'none';
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function showSuccess(msg) {
  const el = document.getElementById('resetSuccess');
  const errorEl = document.getElementById('resetError');
  if (errorEl) errorEl.style.display = 'none';
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

async function resetPassword() {
  const email = document.getElementById('resetEmail').value.trim();

  if (!email || !email.includes('@')) {
    showError('올바른 이메일 주소를 입력해 주세요.');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    // 이메일 존재 여부와 관계없이 동일한 메시지 표시 (이메일 열거 방지)
    showSuccess('비밀번호 재설정 링크를 보냈습니다. 이메일을 확인해 주세요.');
    document.getElementById('resetFormFields').innerHTML = `
      <div class="auth-pending">
        <div class="auth-pending-icon">✉️</div>
        <div class="auth-pending-title">이메일 전송 완료</div>
        <p class="auth-pending-desc">
          입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다.<br>
          이메일이 도착하지 않으면 스팸 폴더를 확인해 주세요.
        </p>
        <a href="login.html" class="btn-upload" style="display:inline-block;text-align:center;margin-top:16px;">로그인 페이지로</a>
      </div>
    `;
  } catch (e) {
    // 이메일이 존재하지 않아도 동일한 메시지 표시 (이메일 열거 방지)
    showSuccess('해당 이메일로 가입된 계정이 있다면 재설정 링크를 보냈습니다. 이메일을 확인해 주세요.');
    document.getElementById('resetFormFields').innerHTML = `
      <div class="auth-pending">
        <div class="auth-pending-icon">✉️</div>
        <div class="auth-pending-title">이메일 전송 완료</div>
        <p class="auth-pending-desc">
          해당 이메일로 가입된 계정이 있다면 재설정 링크를 보냈습니다.<br>
          이메일이 도착하지 않으면 스팸 폴더를 확인해 주세요.
        </p>
        <a href="login.html" class="btn-upload" style="display:inline-block;text-align:center;margin-top:16px;">로그인 페이지로</a>
      </div>
    `;
  }
}

// 이벤트 위임 등록
on('resetPassword', () => resetPassword());
