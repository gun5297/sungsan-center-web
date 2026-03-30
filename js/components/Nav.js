// ===== Nav 컴포넌트 =====
export function Nav() {
  return `
  <nav aria-label="메인 네비게이션">
    <div class="nav-logo">성산<span>지역아동센터</span></div>
    <ul class="nav-links">
      <li><a href="#notice">공지사항</a></li>
      <li><a href="#meal">식단표</a></li>
      <li><a href="#schedule">시간표</a></li>
      <li><a href="#pickup">픽업</a></li>
      <li><a href="#absence">신청서</a></li>
      <li><a href="#medication">투약</a></li>
      <li><a href="#register">등록/상담</a></li>
    </ul>
    <div class="nav-auth" id="navAuth">
      <a href="login.html" class="nav-login-btn" id="navLoginBtn">로그인</a>
      <a href="mypage.html" class="nav-profile-btn logged-only" id="navProfileBtn" title="마이페이지" aria-label="마이페이지">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </a>
    </div>
  </nav>

  <!-- 모바일 하단 탭 바 -->
  <div class="bottom-tab-bar" id="bottomTabBar" role="navigation" aria-label="하단 메뉴">
    <a href="#hero" class="tab-item active" data-tab="home">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
      <span>홈</span>
    </a>
    <a href="#notice" class="tab-item" data-tab="notice">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span>공지</span>
    </a>
    <a href="#meal" class="tab-item" data-tab="meal">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
      <span>식단</span>
    </a>
    <a href="#schedule" class="tab-item" data-tab="schedule">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span>일정</span>
    </a>
    <a href="#gallery" class="tab-item" data-tab="gallery">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <span>갤러리</span>
    </a>
  </div>
  `;
}
