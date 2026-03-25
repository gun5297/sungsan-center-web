// ===== Gallery 컴포넌트 (활동 갤러리 섹션) =====
export function Gallery() {
  return `
  <section class="section fade-up" id="gallery">
    <div class="section-tag">활동 갤러리</div>
    <h2 class="section-title">우리 아이들의<br>즐거운 하루</h2>
    <p class="section-desc">센터에서의 다양한 활동 사진을 확인하세요.</p>

    <div class="admin-only" style="margin-bottom:20px;">
      <div class="card" style="padding:20px;">
        <h4 style="font-weight:800; margin-bottom:12px;">활동 추가</h4>
        <div class="form-row">
          <div class="form-group"><label class="form-label">활동 제목</label><input type="text" id="galTitle" class="input-field" placeholder="봄맞이 미술 수업" /></div>
          <div class="form-group"><label class="form-label">카테고리</label><input type="text" id="galCategory" class="input-field" placeholder="미술 활동" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">날짜</label><input type="date" id="galDate" class="input-field" /></div>
          <div class="form-group"><label class="form-label">사진 업로드</label><input type="file" id="galPhoto" accept="image/*" multiple class="input-field" /></div>
        </div>
        <button class="btn-upload" onclick="addGalleryItem()">추가</button>
      </div>
    </div>

    <div class="gallery-grid" id="galleryGrid"></div>
  </section>

  <div class="divider"></div>
  `;
}
