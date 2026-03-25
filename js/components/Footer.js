// ===== Footer 컴포넌트 (푸터 + 관리자 바) =====
export function Footer() {
  return `
  <footer id="footer">
    <div class="footer-logo">성산<span>지역아동센터</span></div>
    <div class="footer-text">© 2026 성산지역아동센터. All rights reserved.</div>
    <div class="footer-text">서울시 은평구 증산서길 90 성산지역아동센터</div>
    <a href="privacy.html" style="display:inline-block;margin-top:12px;font-size:0.8rem;color:var(--text-sub);text-decoration:underline;font-weight:600;">개인정보처리방침</a>
  </footer>

  <div class="admin-bar">관리자 모드 — 모든 정보를 수정할 수 있습니다</div>
  `;
}
