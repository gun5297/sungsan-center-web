// ===== Attendance 컴포넌트 (출석 현황 섹션) =====
export function Attendance() {
  return `
  <section class="section fade-up" id="attendance">
    <div class="section-tag">출석 현황</div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
      <h2 class="section-title">오늘의<br>출석 현황</h2>
      <button onclick="renderAttendance()" style="margin-top:4px;padding:8px 18px;border:1px solid var(--border);border-radius:20px;background:#fff;font-size:0.8rem;font-weight:700;cursor:pointer;color:var(--text-sub);flex-shrink:0;">↻ 새로고침</button>
    </div>
    <p class="section-desc">출결 태블릿과 실시간 연동됩니다. (30초 자동 갱신)</p>

    <div class="attendance-summary" id="attendanceSummary"></div>
    <div class="attendance-list" id="attendanceList"></div>
  </section>

  <div class="divider"></div>
  `;
}
