// ===== Absence 컴포넌트 (조퇴/결석 신청서 섹션) =====
export function Absence() {
  return `
  <section class="section fade-up" id="absence">
    <div class="section-tag">조퇴 / 결석</div>
    <h2 class="section-title">조퇴·결석<br>신청서 <button class="help-tooltip-btn" data-action="showHelp" data-section="absence">?</button></h2>
    <p class="section-desc">조퇴 또는 결석 사유를 작성하여 센터에 알려주세요.</p>

    <div class="form-card">
      <div class="form-header">
        <div class="form-org">성산지역아동센터</div>
        <div class="form-doc-title">조퇴·결석 신청서</div>
      </div>

      <div class="form-group">
        <label class="form-label">유형 *</label>
        <select id="absType" class="input-field select-field">
          <option value="결석">결석</option>
          <option value="조퇴">조퇴</option>
          <option value="지각">지각</option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">아동 이름 *</label>
          <input type="text" id="absName" class="input-field" placeholder="홍길동" />
        </div>
        <div class="form-group">
          <label class="form-label">보호자 성명</label>
          <input type="text" id="absGuardian" class="input-field" placeholder="보호자 이름" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">반 / 학년</label>
          <input type="text" id="absSchool" class="input-field" placeholder="3학년" />
        </div>
        <div class="form-group">
          <label class="form-label">보호자 연락처</label>
          <input type="tel" id="absPhone" class="input-field" placeholder="010-0000-0000" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">기간 *</label>
        <div class="form-row">
          <input type="date" id="absFrom" class="input-field" />
          <span class="form-range-sep">~</span>
          <input type="date" id="absTo" class="input-field" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">사유 *</label>
        <textarea id="absReason" class="input-field textarea" placeholder="사유를 입력하세요"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">진단명 / 의료정보 (선택)</label>
        <input type="text" id="absDiagnosis" class="input-field" placeholder="해당 시 입력" />
      </div>

      <div class="form-consent">
        <label class="consent-check">
          <input type="checkbox" id="absConsentHealth" />
          <span><strong class="required-tag">[필수]</strong> 본 신청서에 기재된 <strong>민감정보(건강정보)</strong>(진단명, 의료정보 등)를 포함한 개인정보를 아동 안전 관리 목적으로 수집·이용하는 것에 동의합니다. (개인정보보호법 제23조) — <a href="privacy.html" target="_blank" style="color:var(--primary);text-decoration:underline;">개인정보처리방침 보기</a></span>
        </label>
      </div>
      <div class="form-consent">
        <label class="consent-check">
          <input type="checkbox" id="absConsent" />
          <span><strong class="required-tag">[필수]</strong> 결석/조퇴 사유에 기재된 내용이 사실임을 확인하며, 아동의 안전 관리를 위해 센터에서 해당 정보를 활용하는 데 동의합니다.</span>
        </label>
      </div>

      <div class="form-notice">
        <p>위와 같은 사유로 조퇴/결석을 신청합니다.</p>
        <p class="form-date-line" id="absFormDate"></p>
        <div class="form-sign-row">
          <span>신청인(보호자): <span id="absSignName">___________</span></span>
          <button class="edit-btn" data-action="openAbsSignature">전자서명</button>
          <img id="absSignImg" class="hidden" />
        </div>
        <p class="form-to">성산지역아동센터장 귀하</p>
      </div>

      <div class="form-actions">
        <button class="btn-upload" data-action="submitAbsence">온라인 제출</button>
      </div>
    </div>

    <div class="admin-only">
      <h3 class="admin-form-title mt">제출 내역</h3>
      <div class="notice-list admin-list-gap" id="absenceList"></div>
    </div>
  </section>
  `;
}
