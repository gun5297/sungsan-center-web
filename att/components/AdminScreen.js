// ===== 관리 화면 컴포넌트 =====
export function AdminScreen() {
  return `
  <div class="screen hidden" id="screenAdmin">
    <div class="admin-header">
      <button class="admin-back" data-action="showScreen" data-screen="screenMain">← 돌아가기</button>
      <h2>출석 기록</h2>
      <div class="admin-date" id="adminDate"></div>
    </div>

    <div class="admin-tab-content" id="panelRecords">
      <div class="admin-summary" id="adminSummary"></div>
      <div class="admin-list" id="adminList"></div>
    </div>
  </div>
  `;
}
