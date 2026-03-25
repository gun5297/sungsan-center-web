// ===== SignupForm 컴포넌트 (선생님 회원가입 폼) =====
export function SignupForm() {
  return `
  <div class="auth-page">
    <div class="auth-container">
      <a href="index.html" class="auth-logo">성산<span>지역아동센터</span></a>

      <div class="auth-card">
        <div class="form-header">
          <div class="form-doc-title">선생님 회원가입</div>
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

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">연락처</label>
              <input type="tel" id="signupPhone" class="input-field" placeholder="010-0000-0000" />
            </div>
            <div class="form-group">
              <label class="form-label">직책</label>
              <select id="signupPosition" class="input-field select-field">
                <option value="생활복지사">생활복지사</option>
                <option value="사회복지사">사회복지사</option>
                <option value="보육교사">보육교사</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          <div class="form-consent">
            <label class="consent-check">
              <input type="checkbox" id="signupConsent" />
              <span><strong class="required-tag">[필수]</strong> 센터 운영을 위해 개인정보(이름, 이메일, 연락처)를 수집·이용하는 것에 동의합니다.</span>
            </label>
          </div>

          <button class="btn-upload" onclick="doSignup()">회원가입</button>
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
