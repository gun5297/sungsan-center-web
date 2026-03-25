// ===== Attendance 컴포넌트 (출석 현황 섹션) =====
export function Attendance() {
  return `
  <section class="section fade-up" id="attendance">
    <div class="section-tag">출석 현황</div>
    <div class="section-header-row">
      <h2 class="section-title">오늘의<br>출석 현황</h2>
      <button class="btn-refresh" onclick="renderAttendance()">↻ 새로고침</button>
    </div>
    <p class="section-desc">출결 태블릿과 실시간 연동됩니다. (30초 자동 갱신)</p>

    <div class="attendance-summary" id="attendanceSummary"></div>
    <div class="attendance-list" id="attendanceList"></div>
  </section>

  <div class="divider"></div>
  `;
}
