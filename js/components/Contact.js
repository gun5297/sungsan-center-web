// ===== Contact 컴포넌트 (긴급 연락처 섹션) =====
export function Contact() {
  return `
  <section class="section fade-up" id="contact">
    <div class="section-tag">긴급 연락처</div>
    <h2 class="section-title">필요할 때<br>바로 연락하세요</h2>
    <p class="section-desc">센터 운영 시간: 평일 09:00 ~ 19:00</p>

    <div class="contact-grid">
      <a href="tel:02-XXX-XXXX" class="contact-card">
        <div class="contact-icon">📞</div>
        <div class="contact-title">센터 대표</div>
        <div class="contact-info">02-XXX-XXXX</div>
      </a>
      <a href="https://pf.kakao.com/" class="contact-card" target="_blank">
        <div class="contact-icon">💬</div>
        <div class="contact-title">카카오톡 상담</div>
        <div class="contact-info">@성산지역아동센터</div>
      </a>
    </div>
  </section>
  `;
}
