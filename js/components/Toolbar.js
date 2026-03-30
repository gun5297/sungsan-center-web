// ===== Toolbar 컴포넌트 (고정 버튼 + 모달들) =====
export function Toolbar() {
  return `
  <!-- 우상단 고정 버튼 (FAB 메뉴) -->
  <div class="fixed-toolbar" id="fixedToolbar">
    <button class="toolbar-fab" id="toolbarFab" data-action="toggleToolbarMenu" aria-label="메뉴 열기" aria-expanded="false">
      <span class="fab-icon" id="fabIcon" aria-hidden="true"></span>
    </button>
    <div class="toolbar-menu" id="toolbarMenu">
      <a href="attendance.html" class="toolbar-btn toolbar-att">출석</a>
      <button class="toolbar-btn toolbar-inbox admin-only" data-action="openInbox">서류함 <span class="inbox-badge" id="inboxBadge">0</span></button>
      <button class="toolbar-btn toolbar-mysubmit logged-only" data-action="openMySubmissions">내 제출 이력</button>
      <a href="mypage.html" class="toolbar-btn toolbar-mypage logged-only">마이페이지</a>
      <a href="records.html" class="toolbar-btn admin-only">출석기록</a>
      <a href="children.html" class="toolbar-btn admin-only">아동관리</a>
      <button class="toolbar-btn toolbar-admin" id="toolbarAdminBtn" data-action="toggleAdminLogin">로그인</button>
    </div>
  </div>

  <!-- 서류함 모달 -->
  <div class="modal-overlay" id="inboxModal" role="dialog" aria-modal="true" aria-labelledby="inboxModalTitle">
    <div class="modal inbox-modal">
      <div class="modal-title" id="inboxModalTitle">제출 서류함</div>
      <button class="modal-close-x" data-action="closeInbox"></button>

      <div class="inbox-tabs">
        <button class="inbox-tab active" data-action="switchInboxTab" data-tab="all">전체</button>
        <button class="inbox-tab" data-action="switchInboxTab" data-tab="absence">결석/조퇴</button>
        <button class="inbox-tab" data-action="switchInboxTab" data-tab="medication">투약 의뢰</button>
        <button class="inbox-tab" data-action="switchInboxTab" data-tab="register">신규 등록</button>
        <button class="inbox-tab" data-action="switchInboxTab" data-tab="consult">상담 신청</button>
      </div>

      <div class="inbox-search-bar">
        <input type="text" id="inboxSearch" class="inbox-search-input" placeholder="이름 또는 내용으로 검색..." data-action="searchInbox" />
        <select id="inboxSort" class="inbox-sort-select" data-action="sortInbox">
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="name">이름순</option>
        </select>
      </div>

      <div class="inbox-list" id="inboxList"></div>

      <div class="inbox-export-bar admin-only">
        <span class="inbox-export-label">CSV 내보내기</span>
        <button class="inbox-export-btn" data-action="exportNotices">공지사항</button>
        <button class="inbox-export-btn" data-action="exportChildren">아동 목록</button>
        <button class="inbox-export-btn" data-action="exportMedications">투약 기록</button>
      </div>
    </div>
  </div>

  <!-- 내 제출 이력 모달 -->
  <div class="modal-overlay" id="mySubmissionsModal" role="dialog" aria-modal="true" aria-labelledby="mySubmissionsTitle">
    <div class="modal my-submissions-modal">
      <div class="modal-title" id="mySubmissionsTitle">내 제출 이력</div>
      <button class="modal-close-x" data-action="closeMySubmissions"></button>

      <div class="inbox-tabs" id="mySubmitTabs">
        <button class="inbox-tab active" data-action="switchMySubmitTab" data-tab="all">전체</button>
        <button class="inbox-tab" data-action="switchMySubmitTab" data-tab="absence">결석/조퇴</button>
        <button class="inbox-tab" data-action="switchMySubmitTab" data-tab="medication">투약 의뢰</button>
        <button class="inbox-tab" data-action="switchMySubmitTab" data-tab="register">신규 등록</button>
        <button class="inbox-tab" data-action="switchMySubmitTab" data-tab="consult">상담 신청</button>
      </div>

      <div class="inbox-list" id="mySubmitList"></div>
    </div>
  </div>

  <!-- 출력용 양식 -->
  <div class="print-area" id="printArea"></div>
  `;
}
