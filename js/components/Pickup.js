// ===== Pickup 컴포넌트 (픽업 일정표 섹션) =====
export function Pickup() {
  return `
  <section class="section fade-up" id="pickup">
    <div class="section-tag">하교 픽업</div>
    <h2 class="section-title">저학년<br>픽업 일정표</h2>
    <p class="section-desc">저학년 아동의 하교 픽업 일정을 확인하세요.</p>

    <div class="meal-week-nav">
      <button class="month-btn" data-action="changePickupWeek" data-dir="-1">&lt;</button>
      <span class="month-label" id="pickupWeekLabel"></span>
      <button class="month-btn" data-action="changePickupWeek" data-dir="1">&gt;</button>
    </div>

    <div class="pickup-table-wrap">
      <table class="pickup-table" id="pickupTable"></table>
    </div>

    <div class="admin-only admin-section-gap">
      <div class="admin-form-card">
        <h4 class="admin-form-title">픽업 아동 관리</h4>
        <div class="form-row">
          <div class="form-group"><label class="form-label">이름</label><input type="text" id="pickupName" class="input-field" placeholder="홍길동" /></div>
          <div class="form-group"><label class="form-label">학교/학년</label><input type="text" id="pickupSchool" class="input-field" placeholder="증산초 1학년" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">월</label><input type="text" id="pickupMon" class="input-field" placeholder="13:00" /></div>
          <div class="form-group"><label class="form-label">화</label><input type="text" id="pickupTue" class="input-field" placeholder="13:00" /></div>
          <div class="form-group"><label class="form-label">수</label><input type="text" id="pickupWed" class="input-field" placeholder="12:30" /></div>
          <div class="form-group"><label class="form-label">목</label><input type="text" id="pickupThu" class="input-field" placeholder="13:00" /></div>
          <div class="form-group"><label class="form-label">금</label><input type="text" id="pickupFri" class="input-field" placeholder="12:30" /></div>
        </div>
        <button class="btn-upload" data-action="addPickupStudent">추가</button>
      </div>
    </div>
  </section>

  <div class="divider"></div>
  `;
}
