// ===== Toolbar 컴포넌트 (고정 버튼 + 모달들) =====
export function Toolbar() {
  return `
  <!-- 우상단 고정 버튼 (FAB 메뉴) -->
  <div class="fixed-toolbar" id="fixedToolbar">
    <button class="toolbar-fab" id="toolbarFab" onclick="toggleToolbarMenu()">
      <span class="fab-icon" id="fabIcon">+</span>
    </button>
    <div class="toolbar-menu" id="toolbarMenu">
      <a href="attendance.html" class="toolbar-btn toolbar-att">출석</a>
      <button class="toolbar-btn toolbar-inbox admin-only" onclick="openInbox()">서류함 <span class="inbox-badge" id="inboxBadge">0</span></button>
      <a href="mypage.html" class="toolbar-btn toolbar-mypage admin-only">마이페이지</a>
      <button class="toolbar-btn toolbar-admin" id="toolbarAdminBtn" onclick="toggleAdminLogin()">로그인</button>
    </div>
  </div>

  <!-- 서류함 모달 -->
  <div class="modal-overlay" id="inboxModal">
    <div class="modal inbox-modal">
      <div class="modal-title">제출 서류함</div>
      <button class="modal-close-x" onclick="closeInbox()"></button>

      <div class="inbox-tabs">
        <button class="inbox-tab active" onclick="switchInboxTab('all')">전체</button>
        <button class="inbox-tab" onclick="switchInboxTab('absence')">결석/조퇴</button>
        <button class="inbox-tab" onclick="switchInboxTab('medication')">투약 의뢰</button>
        <button class="inbox-tab" onclick="switchInboxTab('register')">신규 등록</button>
        <button class="inbox-tab" onclick="switchInboxTab('consult')">상담 신청</button>
      </div>

      <div class="inbox-list" id="inboxList"></div>
    </div>
  </div>

  <!-- 출력용 양식 -->
  <div class="print-area" id="printArea"></div>
  `;
}
