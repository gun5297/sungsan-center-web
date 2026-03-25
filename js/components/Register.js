// ===== Register 컴포넌트 (신규 등록 & 상담 신청 섹션) =====
export function Register() {
  return `
  <section class="section fade-up" id="register">
    <div class="section-tag">원생 등록 / 상담</div>
    <h2 class="section-title">신규 원생 등록 &<br>상담 신청</h2>
    <p class="section-desc">새로운 원생 등록 또는 상담을 신청하세요.</p>

    <div class="register-tabs">
      <button class="toggle-btn active" data-tab="regTab" onclick="switchRegTab('regTab')">신규 등록</button>
      <button class="toggle-btn" data-tab="consultTab" onclick="switchRegTab('consultTab')">상담 신청</button>
    </div>

    <!-- 신규 등록 폼 -->
    <div class="form-card" id="regTab">
      <div class="form-header">
        <div class="form-org">성산지역아동센터</div>
        <div class="form-doc-title">이용 신청서</div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">아동 성명</label>
          <input type="text" id="regChildName" class="input-field" placeholder="아동 이름" />
        </div>
        <div class="form-group">
          <label class="form-label">생년월일</label>
          <input type="date" id="regChildBirth" class="input-field" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">성별</label>
          <select id="regGender" class="input-field select-field">
            <option value="남">남</option>
            <option value="여">여</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">소속 학교 / 학년</label>
          <input type="text" id="regSchool" class="input-field" placeholder="예: 증산초 2학년" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">보호자 성명</label>
          <input type="text" id="regGuardian" class="input-field" placeholder="보호자 이름" />
        </div>
        <div class="form-group">
          <label class="form-label">관계</label>
          <select id="regRelation" class="input-field select-field">
            <option value="부">부</option>
            <option value="모">모</option>
            <option value="조부">조부</option>
            <option value="조모">조모</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">보호자 연락처</label>
          <input type="tel" id="regPhone" class="input-field" placeholder="010-0000-0000" />
        </div>
        <div class="form-group">
          <label class="form-label">비상 연락처</label>
          <input type="tel" id="regEmergency" class="input-field" placeholder="010-0000-0000" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label class="form-label">주소</label>
          <input type="text" id="regAddress" class="input-field" placeholder="자택 주소" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label class="form-label">이용 희망 요일</label>
          <div class="day-check-row" id="regDays">
            <label class="day-check"><input type="checkbox" value="월" checked> 월</label>
            <label class="day-check"><input type="checkbox" value="화" checked> 화</label>
            <label class="day-check"><input type="checkbox" value="수" checked> 수</label>
            <label class="day-check"><input type="checkbox" value="목" checked> 목</label>
            <label class="day-check"><input type="checkbox" value="금" checked> 금</label>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label class="form-label">특이사항 (알레르기, 건강, 기타)</label>
          <textarea id="regNote" class="input-field textarea" placeholder="알레르기, 지병, 특이사항 등을 기재해 주세요."></textarea>
        </div>
      </div>

      <div class="form-consent">
        <label class="consent-check">
          <input type="checkbox" id="regConsent1" />
          <span><strong class="required-tag">[필수]</strong> 본인은 위 아동의 보호자로서 기재 내용이 사실임을 확인하며, 센터 이용규정 및 안전수칙을 준수할 것에 동의합니다.</span>
        </label>
        <label class="consent-check">
          <input type="checkbox" id="regConsent2" />
          <span><strong class="required-tag">[필수]</strong> 아동의 개인정보(성명, 생년월일, 건강정보 등)를 센터 운영 목적으로 수집·이용하는 것에 동의합니다. (보유기간: 퇴소 후 3년)</span>
        </label>
        <label class="consent-check">
          <input type="checkbox" id="regConsent3" />
          <span><strong class="optional-tag">[선택]</strong> 센터 활동 중 촬영된 사진·영상을 센터 홍보 및 기록 목적으로 활용하는 것에 동의합니다.</span>
        </label>
      </div>

      <div class="form-actions">
        <button class="btn-upload" onclick="submitRegister()">등록 신청</button>
      </div>
    </div>

    <!-- 상담 신청 폼 -->
    <div class="form-card" id="consultTab" style="display:none;">
      <div class="form-header">
        <div class="form-org">성산지역아동센터</div>
        <div class="form-doc-title">상담 신청서</div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">신청자 (보호자) 성명</label>
          <input type="text" id="conGuardian" class="input-field" placeholder="보호자 이름" />
        </div>
        <div class="form-group">
          <label class="form-label">연락처</label>
          <input type="tel" id="conPhone" class="input-field" placeholder="010-0000-0000" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">아동 성명</label>
          <input type="text" id="conChild" class="input-field" placeholder="아동 이름" />
        </div>
        <div class="form-group">
          <label class="form-label">희망 상담 일시</label>
          <input type="datetime-local" id="conDate" class="input-field" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label class="form-label">상담 희망 내용</label>
          <select id="conTopic" class="input-field select-field">
            <option value="학습">학습 관련</option>
            <option value="생활">생활 습관 / 행동</option>
            <option value="교우">교우 관계</option>
            <option value="건강">건강 / 안전</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label class="form-label">상담 내용 상세</label>
          <textarea id="conDetail" class="input-field textarea" placeholder="상담 받고 싶은 내용을 자세히 적어주세요."></textarea>
        </div>
      </div>

      <div class="form-consent">
        <label class="consent-check">
          <input type="checkbox" id="conConsent" />
          <span><strong class="required-tag">[필수]</strong> 상담 내용은 아동 지도 및 센터 운영 개선 목적으로만 활용되며, 상담 기록이 보관될 수 있음을 안내받았습니다.</span>
        </label>
      </div>

      <div class="form-actions">
        <button class="btn-upload" onclick="submitConsult()">상담 신청</button>
      </div>
    </div>
  </section>

  <div class="divider"></div>
  `;
}
