// ===== Gallery 컴포넌트 (활동 갤러리 섹션) =====
export function Gallery() {
  return `
  <section class="section fade-up" id="gallery">
    <div class="section-tag">활동 갤러리</div>
    <h2 class="section-title">우리 아이들의<br>즐거운 하루 <button class="help-tooltip-btn" data-action="showHelp" data-section="gallery">?</button></h2>
    <p class="section-desc">센터에서의 다양한 활동 사진을 확인하세요.</p>

    <div class="admin-only admin-section-bottom">
      <div class="admin-form-card">
        <h4 class="admin-form-title">활동 추가</h4>
        <div class="form-row">
          <div class="form-group"><label class="form-label" for="galTitle">활동 제목</label><input type="text" id="galTitle" class="input-field" placeholder="봄맞이 미술 수업" /></div>
          <div class="form-group"><label class="form-label" for="galCategory">카테고리</label><input type="text" id="galCategory" class="input-field" placeholder="미술 활동" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label" for="galDate">날짜</label><input type="date" id="galDate" class="input-field" /></div>
          <div class="form-group"><label class="form-label" for="galPhoto">사진 업로드</label><input type="file" id="galPhoto" accept="image/*" multiple class="input-field" /></div>
        </div>
        <button class="btn-upload" data-action="addGalleryItem">추가</button>
      </div>
    </div>

    <div class="auth-wall" id="galleryAuthWall">
      <div class="auth-wall-icon">🔒</div>
      <div class="auth-wall-title">로그인 후 열람 가능합니다</div>
      <p class="auth-wall-desc">아동 보호를 위해 활동 사진은 로그인한 사용자만 볼 수 있습니다.</p>
      <a href="login.html" class="btn-upload" style="display:inline-flex;width:auto;padding:12px 40px;margin-top:12px;">로그인</a>
    </div>
    <div class="gallery-grid" id="galleryGrid" style="display:none;"></div>
  </section>

  <div class="divider"></div>
  `;
}
