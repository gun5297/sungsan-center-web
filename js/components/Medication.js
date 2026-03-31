// ===== Medication 컴포넌트 (투약 관리 섹션) =====
export function Medication() {
  return `
  <section class="section fade-up" id="medication">
    <div class="section-tag">투약 관리</div>
    <h2 class="section-title">투약 의뢰서 &<br>투약 일정 <button class="help-tooltip-btn" data-action="showHelp" data-section="medication">?</button></h2>
    <p class="section-desc">아이에게 약을 투여해야 할 경우 의뢰서를 작성해 주세요.</p>

    <div class="form-card">
      <div class="form-header">
        <div class="form-org">성산지역아동센터</div>
        <div class="form-doc-title">투약 의뢰서</div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">아동 성명</label>
          <input type="text" id="medName" class="input-field" placeholder="아동 이름" />
        </div>
        <div class="form-group">
          <label class="form-label">생년월일</label>
          <input type="date" id="medBirth" class="input-field" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">증상 / 진단명</label>
          <input type="text" id="medSymptom" class="input-field" placeholder="예: 감기, 중이염" />
        </div>
        <div class="form-group">
          <label class="form-label">처방 병원</label>
          <input type="text" id="medHospital" class="input-field" placeholder="병원명" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">약 이름</label>
          <input type="text" id="medDrug" class="input-field" placeholder="약 이름 (처방전 참고)" />
        </div>
        <div class="form-group">
          <label class="form-label">투약 용량</label>
          <input type="text" id="medDose" class="input-field" placeholder="예: 1포, 5ml" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">투약 시간</label>
          <select id="medTime" class="input-field select-field">
            <option value="점심 식후">점심 식후</option>
            <option value="오전 간식 후">오전 간식 후</option>
            <option value="오후 간식 후">오후 간식 후</option>
            <option value="취침 전">취침 전</option>
            <option value="기타">기타 (비고란에 기재)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">투약 기간</label>
          <div class="date-range">
            <input type="date" id="medFrom" class="input-field" />
            <span class="range-sep">~</span>
            <input type="date" id="medTo" class="input-field" />
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label class="form-label">보관 방법</label>
          <select id="medStorage" class="input-field select-field">
            <option value="실온 보관">실온 보관</option>
            <option value="냉장 보관">냉장 보관</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label class="form-label">특이사항 / 알레르기</label>
          <textarea id="medNote" class="input-field textarea" placeholder="알레르기, 부작용 주의사항 등"></textarea>
        </div>
      </div>

      <div class="form-consent">
        <label class="consent-check">
          <input type="checkbox" id="medConsentHealth" />
          <span><strong class="required-tag">[필수]</strong> 본 의뢰서에 기재된 <strong>민감정보(건강정보)</strong>(증상, 진단명, 약 정보, 알레르기 등)는 아동의 안전한 투약 관리를 위한 목적으로만 수집·이용되며, 작성일로부터 1년간 보관 후 파기됩니다. (개인정보보호법 제23조) — <a href="privacy.html" target="_blank" style="color:var(--primary);text-decoration:underline;">개인정보처리방침 보기</a> — 이에 동의합니다.</span>
        </label>
        <label class="consent-check">
          <input type="checkbox" id="medConsent1" />
          <span><strong class="required-tag">[필수]</strong> 투약 시 발생할 수 있는 부작용(구토, 알레르기 반응, 졸음 등)에 대해 안내 받았으며, 부작용 발생 시 즉시 보호자에게 연락 후 투약을 중단함에 동의합니다.</span>
        </label>
        <label class="consent-check">
          <input type="checkbox" id="medConsent2" />
          <span><strong class="required-tag">[필수]</strong> 의사의 처방에 따른 정확한 약 정보(용량, 시간, 보관법)를 기재하였으며, 잘못된 정보 기재로 인한 문제 발생 시 보호자에게 책임이 있음을 확인합니다.</span>
        </label>
        <label class="consent-check">
          <input type="checkbox" id="medConsent3" />
          <span><strong class="required-tag">[필수]</strong> 아동의 건강 상태 변화(발열, 구토, 발진 등) 발생 시 센터에서 보호자에게 즉시 연락하며, 상황에 따라 119 신고 및 응급 조치를 취할 수 있음에 동의합니다.</span>
        </label>
      </div>

      <div class="form-notice">
        <p>위 아동에 대한 투약을 의뢰하며, 상기 안내사항을 모두 확인하였습니다.</p>
        <p class="form-date-line" id="medFormDate"></p>
        <div class="form-sign-row">
          <span>의뢰인(보호자): ___________</span>
          <button class="edit-btn" data-action="openMedSignature">전자서명</button>
          <img id="medSignImg" class="hidden" />
        </div>
        <p class="form-to">성산지역아동센터장 귀하</p>
      </div>

      <div class="form-actions">
        <button class="btn-upload" data-action="submitMedication">온라인 제출</button>
      </div>
    </div>

    <div class="admin-only">
      <h3 class="admin-form-title mt">투약 일정표</h3>
      <p class="admin-form-desc">현재 투약 중인 아동 목록입니다.</p>
      <div class="med-schedule" id="medSchedule"></div>
    </div>
  </section>

  <div class="divider"></div>
  `;
}
