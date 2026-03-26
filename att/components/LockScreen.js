// ===== 잠금 화면 컴포넌트 =====
export function LockScreen() {
  return `
  <div class="screen" id="screenLock">
    <div class="lock-content">
      <div class="lock-left">
        <div class="lock-icon">🔒</div>
        <div class="lock-title">출결 시스템</div>
        <div class="lock-subtitle">비밀번호를 입력하세요</div>
      </div>
      <div class="lock-right">
        <div class="lock-dots" id="lockDots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <div class="lock-error hidden" id="lockError">비밀번호가 틀렸습니다</div>
        <div class="numpad lock-numpad">
          <button class="num-btn" data-action="pressLock" data-key="1">1</button>
          <button class="num-btn" data-action="pressLock" data-key="2">2</button>
          <button class="num-btn" data-action="pressLock" data-key="3">3</button>
          <button class="num-btn" data-action="pressLock" data-key="4">4</button>
          <button class="num-btn" data-action="pressLock" data-key="5">5</button>
          <button class="num-btn" data-action="pressLock" data-key="6">6</button>
          <button class="num-btn" data-action="pressLock" data-key="7">7</button>
          <button class="num-btn" data-action="pressLock" data-key="8">8</button>
          <button class="num-btn" data-action="pressLock" data-key="9">9</button>
          <button class="num-btn fn-btn" data-action="pressLockDelete">지우기</button>
          <button class="num-btn" data-action="pressLock" data-key="0">0</button>
          <button class="num-btn fn-btn confirm-btn" data-action="pressLockConfirm">확인</button>
        </div>
        <a class="lock-back-link" href="index.html">← 메인으로 돌아가기</a>
      </div>
    </div>
  </div>
  `;
}
