// ===== PendingPage 컴포넌트 (승인 대기 안내) =====
export function PendingPage() {
  return `
  <div class="auth-page">
    <div class="auth-container">
      <a href="index.html" class="auth-logo">성산<span>지역아동센터</span></a>

      <div class="auth-card">
        <div class="auth-pending">
          <div class="auth-pending-icon">⏳</div>
          <div class="auth-pending-title">승인 대기 중</div>
          <p class="auth-pending-desc">
            관리자의 승인 후 이용이 가능합니다.<br>
            승인이 완료되면 이 페이지가 자동으로 전환됩니다.
          </p>
          <p class="auth-pending-desc" style="font-size:0.82rem;">
            빠른 승인이 필요하시면 센터로 연락해 주세요.
          </p>
          <a href="login.html" class="btn-upload auth-pending-btn" id="logoutBtn">로그아웃 후 돌아가기</a>
        </div>
      </div>
    </div>
  </div>
  `;
}
