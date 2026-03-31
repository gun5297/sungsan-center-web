// ===== Hero 컴포넌트 (히어로 + 통계 카드) =====
export function Hero() {
  return `
  <div id="hero">
  <section class="hero">
    <div class="hero-badge">${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월</div>
    <h1>
      아이들의 하루를<br />
      한눈에<br />
      <span class="highlight">성산지역아동센터</span>
    </h1>
    <p>선생님과 학부모가 함께 소통하는 공간. 공지사항, 시간표, 식단표까지 한곳에서 확인하세요.</p>
    <div class="hero-buttons">
      <a href="#notice" class="btn-primary">공지사항 보기</a>
      <a href="#schedule" class="btn-secondary">시간표 확인</a>
    </div>
  </section>

  <!-- 관리자 대시보드 (admin-only) -->
  <div class="dashboard admin-only" id="dashboard">
    <h2 class="dashboard-title">오늘의 요약</h2>
    <div class="dashboard-grid">
      <div class="dash-card" id="dashAttendance">
        <div class="dash-icon">🧒</div>
        <div class="dash-value" id="dashAttVal">-</div>
        <div class="dash-label">오늘 출석</div>
      </div>
      <div class="dash-card" id="dashInbox">
        <div class="dash-icon">&#128196;</div>
        <div class="dash-value" id="dashInboxVal">-</div>
        <div class="dash-label">미확인 서류</div>
      </div>
      <div class="dash-card" id="dashMed">
        <div class="dash-icon">&#128138;</div>
        <div class="dash-value" id="dashMedVal">-</div>
        <div class="dash-label">투약 중</div>
      </div>
      <div class="dash-card" id="dashMeal">
        <div class="dash-icon">&#127858;</div>
        <div class="dash-value" id="dashMealVal">-</div>
        <div class="dash-label">오늘 식단</div>
      </div>
      <div class="dash-card dash-card-system" data-action="openSystemStatusModal">
        <div class="dash-icon">&#9889;</div>
        <div class="dash-value" id="dashSystemVal"><span class="status-dot status-online"></span> 정상</div>
        <div class="dash-label">시스템 상태</div>
      </div>
    </div>
    <div class="dashboard-actions">
      <button class="btn-primary" data-action="openDailyLogEditor">활동 일지 작성</button>
      <button class="btn-secondary" data-action="openDailyLogList">일지 목록 보기</button>
    </div>
  </div>

  <div class="hero-spacer"></div>
  <div class="divider"></div>
  </div>
  `;
}
