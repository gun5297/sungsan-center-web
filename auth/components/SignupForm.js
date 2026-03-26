// ===== SignupForm 컴포넌트 (회원가입 폼) =====
export function SignupForm() {
  return `
  <div class="auth-page">
    <div class="auth-container">
      <a href="index.html" class="auth-logo">성산<span>지역아동센터</span></a>

      <div class="auth-card">
        <div class="form-header">
          <div class="form-doc-title">회원가입</div>
        </div>

        <div id="signupError" class="auth-error" style="display:none;"></div>
        <div id="signupSuccess" class="auth-success" style="display:none;"></div>

        <div id="signupFormFields">
          <div class="form-group">
            <label class="form-label">이름</label>
            <input type="text" id="signupName" class="input-field" placeholder="홍길동" />
          </div>

          <div class="form-group">
            <label class="form-label">이메일</label>
            <input type="email" id="signupEmail" class="input-field" placeholder="example@sungsan.kr" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">비밀번호</label>
              <input type="password" id="signupPassword" class="input-field" placeholder="4자리 이상" />
            </div>
            <div class="form-group">
              <label class="form-label">비밀번호 확인</label>
              <input type="password" id="signupPasswordConfirm" class="input-field" placeholder="비밀번호 재입력" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">연락처</label>
            <input type="tel" id="signupPhone" class="input-field" placeholder="010-0000-0000" />
          </div>

          <div class="form-consent">
            <label class="consent-check">
              <input type="checkbox" id="signupConsent" />
              <span><strong class="required-tag">[필수]</strong> 개인정보 수집·이용 동의: 센터 이용자 관리 및 소통을 위해 이름, 이메일, 연락처, 직책 정보를 수집합니다. 수집된 정보는 회원 탈퇴 시까지 보관되며, 탈퇴 후 즉시 파기됩니다. <a href="privacy.html" target="_blank" style="color:var(--primary);text-decoration:underline;">개인정보처리방침 전문 보기</a></span>
            </label>
          </div>

          <button class="btn-upload" data-action="doSignup">회원가입</button>
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
