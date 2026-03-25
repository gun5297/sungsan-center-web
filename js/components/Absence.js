// ===== Absence 컴포넌트 (조퇴/결석 신청서 섹션) =====
export function Absence() {
  return `
  <section class="section fade-up" id="absence">
    <div class="section-tag">조퇴·결석 신청서</div>
    <h2 class="section-title">조퇴 / 결석<br>신청서</h2>
    <p class="section-desc">증빙서류 제출 양식입니다. 작성 후 출력하여 제출하세요.</p>

    <div class="form-card">
      <div class="form-header">
        <div class="form-org">성산지역아동센터</div>
        <div class="form-doc-title">조퇴·결석 신청서</div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">신청 유형</label>
          <select id="absType" class="input-field select-field">
            <option value="결석">결석</option>
            <option value="조퇴">조퇴</option>
            <option value="지각">지각</option>
            <option value="외출">외출</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">신청일</label>
          <input type="date" id="absDate" class="input-field" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">아동 성명</label>
          <input type="text" id="absName" class="input-field" placeholder="아동 이름" />
        </div>
        <div class="form-group">
          <label class="form-label">생년월일</label>
          <input type="date" id="absBirth" class="input-field" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">소속 학교 / 학년</label>
          <input type="text" id="absSchool" class="input-field" placeholder="예: 증산초 3학년" />
        </div>
        <div class="form-group">
          <label class="form-label">보호자 성명</label>
          <input type="text" id="absGuardian" class="input-field" placeholder="보호자 이름" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label class="form-label">사유</label>
          <textarea id="absReason" class="input-field textarea" placeholder="결석/조퇴 사유를 상세히 기재해 주세요.&#10;(질병의 경우 진단명, 병원명 포함)"></textarea>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">결석/조퇴 기간</label>
          <div class="date-range">
            <input type="date" id="absFrom" class="input-field" />
            <span class="range-sep">~</span>
            <input type="date" id="absTo" class="input-field" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">보호자 연락처</label>
          <input type="tel" id="absPhone" class="input-field" placeholder="010-0000-0000" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label class="form-label">첨부서류 (진단서, 진료확인서 등)</label>
          <input type="file" id="absFile" accept=".pdf,.jpg,.png" class="input-field" />
        </div>
      </div>

      <div class="form-consent">
        <label class="consent-check">
          <input type="checkbox" id="absConsent" />
          <span><strong class="required-tag">[필수]</strong> 본인은 아동의 보호자로서 위 내용이 사실임을 확인하며, 센터 운영규정에 따라 사전 통보 없는 결석이 반복될 경우 이용에 제한이 있을 수 있음을 안내받았습니다.</span>
        </label>
      </div>

      <div class="form-notice">
        <p>위와 같은 사유로 조퇴/결석을 신청합니다.</p>
        <p class="form-date-line" id="absFormDate"></p>
        <div class="form-sign-row">
          <span>신청인(보호자): <span id="absSignName">___________</span> (서명)</span>
        </div>
        <p class="form-to">성산지역아동센터장 귀하</p>
      </div>

      <div class="form-actions">
        <button class="btn-upload" onclick="printAbsence()">출력하기</button>
        <button class="btn-secondary-sm" onclick="submitAbsence()">온라인 제출</button>
      </div>
    </div>

    <div class="admin-only">
      <h3 class="admin-form-title mt">제출 내역</h3>
      <div class="notice-list admin-list-gap" id="absenceList"></div>
    </div>
  </section>

  <div class="divider"></div>
  `;
}
