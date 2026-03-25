// ===== 관리 화면 컴포넌트 =====
export function AdminScreen() {
  return `
  <div class="screen hidden" id="screenAdmin">
    <div class="admin-header">
      <button class="admin-back" onclick="showScreen('screenMain')">← 돌아가기</button>
      <h2>출결 관리</h2>
      <div class="admin-date" id="adminDate"></div>
    </div>

    <div class="admin-tabs">
      <button class="admin-tab active" id="tabRecords" onclick="switchAdminTab('records')">출결 기록</button>
      <button class="admin-tab" id="tabManage" onclick="switchAdminTab('manage')">아동 관리</button>
    </div>

    <div class="admin-tab-content" id="panelRecords">
      <div class="admin-summary" id="adminSummary"></div>
      <div class="admin-list" id="adminList"></div>
      <div class="admin-actions">
        <button class="admin-btn" onclick="exportCSV()">엑셀 다운로드</button>
        <button class="admin-btn danger" onclick="resetToday()">오늘 기록 초기화</button>
      </div>
    </div>

    <div class="admin-tab-content hidden" id="panelManage">
      <div class="manage-lock" id="manageLock">
        <div class="manage-lock-msg">아동 관리는 비밀번호가 필요합니다</div>
        <div class="manage-lock-input">
          <input type="password" id="managePw" placeholder="비밀번호 입력" onkeydown="if(event.key==='Enter')unlockManage()" />
          <button class="manage-lock-btn" onclick="unlockManage()">확인</button>
        </div>
        <div class="manage-lock-error hidden" id="manageLockError">비밀번호가 틀렸습니다</div>
      </div>

      <div class="manage-unlocked hidden" id="manageUnlocked">
        <div class="manage-form">
          <h3>아동 등록</h3>
          <div class="manage-form-row">
            <div class="manage-form-group">
              <label>번호 (4자리)</label>
              <input type="text" id="stuId" maxlength="4" placeholder="0001" />
            </div>
            <div class="manage-form-group">
              <label>이름</label>
              <input type="text" id="stuName" placeholder="홍길동" />
            </div>
          </div>
          <div class="manage-form-row">
            <div class="manage-form-group">
              <label>학교/학년</label>
              <input type="text" id="stuSchool" placeholder="증산초 1학년" />
            </div>
            <div class="manage-form-group">
              <label>보호자 연락처</label>
              <input type="text" id="stuParent" placeholder="010-1234-5678" />
            </div>
          </div>
          <div class="manage-form-actions">
            <button class="manage-add-btn" id="stuSubmitBtn" onclick="addStudent()">추가</button>
            <button class="manage-cancel-btn hidden" id="stuCancelBtn" onclick="cancelEditStudent()">취소</button>
          </div>
        </div>

        <div class="manage-student-list" id="manageStudentList"></div>
      </div>
    </div>
  </div>
  `;
}
