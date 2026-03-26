// ===== Hero 컴포넌트 (히어로 + 통계 카드) =====
export function Hero() {
  return `
  <div id="hero">
  <section class="hero">
    <div class="hero-badge">2026년 3월</div>
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

  <div class="stats fade-up">
    <div class="stat-card">
      <div class="stat-number">99</div>
      <div class="stat-label">재원 아동<br>정원 99명</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">99</div>
      <div class="stat-label">담당 선생님<br>각 반 배정</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">99</div>
      <div class="stat-label">운영 프로그램<br>특별활동 포함</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">99%</div>
      <div class="stat-label">학부모 만족도<br>설문 기준</div>
    </div>
  </div>

  <!-- 관리자 대시보드 (admin-only) -->
  <div class="dashboard admin-only" id="dashboard">
    <h2 class="dashboard-title">오늘의 요약</h2>
    <div class="dashboard-grid">
      <div class="dash-card" id="dashAttendance">
        <div class="dash-icon">&#128101;</div>
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
    </div>
    <div class="dashboard-actions">
      <button class="btn-primary" data-action="openDailyLogEditor">활동 일지 작성</button>
      <button class="btn-secondary" data-action="openDailyLogList">일지 목록 보기</button>
    </div>
  </div>

  <div style="height:40px;"></div>
  <div class="divider"></div>
  </div>
  `;
}
