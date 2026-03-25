// ===== ResetPasswordForm 컴포넌트 (비밀번호 재설정 폼) =====
export function ResetPasswordForm() {
  return `
  <div class="auth-page">
    <div class="auth-container">
      <a href="index.html" class="auth-logo">성산<span>지역아동센터</span></a>

      <div class="auth-card">
        <div class="form-header">
          <div class="form-doc-title">비밀번호 재설정</div>
        </div>

        <p style="font-size:0.9rem;color:var(--text-sub);line-height:1.6;margin-bottom:20px;">
          가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>

        <div id="resetError" class="auth-error" style="display:none;"></div>
        <div id="resetSuccess" class="auth-success" style="display:none;"></div>

        <div id="resetFormFields">
          <div class="form-group">
            <label class="form-label">이메일</label>
            <input type="email" id="resetEmail" class="input-field" placeholder="가입하신 이메일 주소" />
          </div>

          <button class="btn-upload" onclick="resetPassword()">재설정 링크 보내기</button>
        </div>

        <div class="auth-links">
          <a href="login.html">로그인으로 돌아가기</a>
          <span class="auth-sep">|</span>
          <a href="index.html">메인으로</a>
        </div>
      </div>
    </div>
  </div>
  `;
}
