// ===== Meal 컴포넌트 (식단표 섹션) =====
export function Meal() {
  return `
  <section class="section fade-up" id="meal">
    <div class="section-tag">식단표</div>
    <h2 class="section-title">이번 주<br>식단표</h2>
    <p class="section-desc">아이들의 건강한 식사를 확인하세요.</p>

    <div class="meal-week-nav">
      <button class="month-btn" data-action="changeMealWeek" data-dir="-1">&lt;</button>
      <span class="month-label" id="mealWeekLabel"></span>
      <button class="month-btn" data-action="changeMealWeek" data-dir="1">&gt;</button>
    </div>

    <div class="meal-grid" id="mealGrid"></div>

    <div style="text-align:center;margin-top:16px;">
      <button class="edit-schedule-btn admin-only" data-action="openMealEditor">식단 수정</button>
    </div>
  </section>

  <div class="divider"></div>
  `;
}
