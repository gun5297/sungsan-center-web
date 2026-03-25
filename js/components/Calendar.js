// ===== Calendar 컴포넌트 (캘린더 & 시간표 섹션) =====
export function Calendar() {
  return `
  <section class="section fade-up" id="schedule">
    <div class="section-tag">시간표</div>
    <h2 class="section-title">월별 & 일별<br>시간표</h2>
    <p class="section-desc">이번 달 프로그램 일정을 한눈에 확인하세요.</p>

    <div class="month-nav">
      <button class="month-btn" onclick="changeMonth(-1)">&lt;</button>
      <span class="month-label" id="monthLabel"></span>
      <button class="month-btn" onclick="changeMonth(1)">&gt;</button>
    </div>

    <div class="cal-legend">
      <div class="cal-legend-item"><div class="cal-legend-dot 증산초"></div>증산초</div>
      <div class="cal-legend-item"><div class="cal-legend-dot 수색초"></div>수색초</div>
      <div class="cal-legend-item"><div class="cal-legend-dot 증산중"></div>증산중</div>
      <div class="cal-legend-item"><div class="cal-legend-dot holiday"></div>공휴일</div>
    </div>

    <div class="calendar" id="calendar"></div>

    <div class="day-schedule" id="daySchedule">
      <div class="day-schedule-header">
        <h3 class="day-title" id="dayTitle">날짜를 선택하세요</h3>
        <button class="edit-schedule-btn admin-only" onclick="openScheduleEditor()">수정</button>
      </div>
      <div class="timetable" id="timetable"></div>
    </div>
  </section>

  <div class="divider"></div>
  `;
}
