// ===== LoginForm 컴포넌트 (로그인 폼) =====
export function LoginForm() {
  return `
  <div class="auth-page">
    <div class="auth-container">
      <a href="index.html" class="auth-logo">성산<span>지역아동센터</span></a>

      <div class="auth-card">
        <div class="form-header">
          <div class="form-doc-title">로그인</div>
        </div>

        <div id="loginError" class="auth-error" style="display:none;"></div>

        <div class="form-group">
          <label class="form-label">이메일</label>
          <input type="email" id="loginEmail" class="input-field" placeholder="이메일 주소" />
        </div>

        <div class="form-group">
          <label class="form-label">비밀번호</label>
          <input type="password" id="loginPassword" class="input-field" placeholder="비밀번호" />
        </div>

        <button class="btn-upload" onclick="doLogin()">로그인</button>

        <div class="auth-links">
          <a href="signup.html">회원가입</a>
          <span class="auth-sep">|</span>
          <a href="index.html">메인으로</a>
        </div>
      </div>
    </div>
  </div>
  `;
}
