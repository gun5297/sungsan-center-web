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
            관리자의 승인 후 로그인이 가능합니다.<br>
            승인 완료 시 안내드리겠습니다.
          </p>
          <a href="login.html" class="btn-upload auth-pending-btn" id="logoutBtn">로그아웃 후 돌아가기</a>
        </div>
      </div>
    </div>
  </div>
  `;
}
