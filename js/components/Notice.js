// ===== Notice 컴포넌트 (공지사항 섹션) =====
export function Notice() {
  return `
  <section class="section fade-up" id="notice">
    <div class="section-tag">공지사항</div>
    <h2 class="section-title">가정통신문 &<br>공지사항</h2>
    <p class="section-desc">센터의 주요 안내사항과 가정통신문을 확인하세요.</p>

    <div class="upload-area admin-only" id="uploadArea">
      <div class="upload-form" id="teacherForm">
        <h3>가정통신문 업로드</h3>
        <input type="text" id="noticeTitle" placeholder="제목을 입력하세요" class="input-field" />
        <div class="format-toolbar">
          <button type="button" class="format-btn" onclick="insertFormatting('bold')" title="굵게">
            <strong>B</strong>
          </button>
          <button type="button" class="format-btn" onclick="insertFormatting('underline')" title="밑줄">
            <u>U</u>
          </button>
          <button type="button" class="format-btn" onclick="insertFormatting('hr')" title="구분선">
            ―
          </button>
          <button type="button" class="format-btn" onclick="insertFormatting('br')" title="줄바꿈">
            ↵
          </button>
        </div>
        <textarea id="noticeContent" placeholder="내용을 입력하세요" class="input-field textarea"></textarea>
        <div class="file-upload" id="fileUpload">
          <input type="file" id="fileInput" accept=".pdf,.jpg,.png,.doc,.docx" hidden />
          <div class="file-drop" onclick="document.getElementById('fileInput').click()">
            <div class="file-icon">+</div>
            <p>파일을 선택하거나 여기에 드래그하세요</p>
            <span>PDF, JPG, PNG, DOC (최대 10MB)</span>
          </div>
          <div class="file-name" id="fileName"></div>
        </div>
        <select id="noticeCategory" class="input-field select-field">
          <option value="공지">공지사항</option>
          <option value="통신문">가정통신문</option>
          <option value="긴급">긴급 안내</option>
        </select>
        <button class="btn-upload" onclick="addNotice()">업로드</button>
      </div>
    </div>

    <div class="notice-list" id="noticeList"></div>
  </section>

  <div class="divider"></div>
  `;
}
