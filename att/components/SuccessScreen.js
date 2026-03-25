// ===== 성공 화면 컴포넌트 =====
export function SuccessScreen() {
  return `
  <div class="screen hidden" id="screenSuccess">
    <div class="success-content">
      <div class="success-icon" id="successIcon">✓</div>
      <div class="success-info">
        <div class="success-name" id="successName"></div>
        <div class="success-type" id="successType"></div>
        <div class="success-time" id="successTime"></div>
        <div class="success-sms" id="successSms"></div>
      </div>
    </div>
  </div>
  `;
}
