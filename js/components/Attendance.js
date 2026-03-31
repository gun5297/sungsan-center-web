// ===== Attendance 컴포넌트 (출석 현황 섹션) =====
export function Attendance() {
  return `
  <section class="section fade-up" id="attendance">
    <div class="section-tag">출석 현황</div>
    <div class="section-header-row">
      <h2 class="section-title">오늘의<br>출석 현황 <button class="help-tooltip-btn" data-action="showHelp" data-section="attendance">?</button></h2>
      <button class="btn-refresh" data-action="renderAttendance">↻ 새로고침</button>
    </div>
    <p class="section-desc">출결 태블릿과 실시간 연동됩니다. (30초 자동 갱신)</p>

    <div class="auth-wall" id="attAuthWall">
      <div class="auth-wall-icon">🔒</div>
      <div class="auth-wall-title">로그인 후 열람 가능합니다</div>
      <p class="auth-wall-desc">아동 보호를 위해 출석 현황은 로그인한 사용자만 볼 수 있습니다.</p>
      <a href="login.html" class="btn-upload" style="display:inline-flex;width:auto;padding:12px 40px;margin-top:12px;">로그인</a>
    </div>
    <div id="attLoggedContent" style="display:none;">
      <div class="attendance-summary" id="attendanceSummary"></div>
      <div class="attendance-list" id="attendanceList"></div>
    </div>
  </section>

  <div class="divider"></div>
  `;
}
