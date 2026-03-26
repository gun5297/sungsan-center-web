// ===== 메인 번호입력 화면 컴포넌트 =====
export function MainScreen() {
  return `
  <div class="screen hidden" id="screenMain">
    <div class="top-bar">
      <div class="center-name">성산지역아동센터</div>
      <div class="clock" id="clock"></div>
    </div>

    <div class="main-content">
      <div class="main-left">
        <div class="greeting" id="greeting">번호를 입력하세요</div>

        <div class="input-display">
          <div class="input-dots" id="inputDots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <div class="input-number" id="inputNumber"></div>
        </div>
      </div>

      <div class="numpad">
        <button class="num-btn" data-action="pressNum" data-key="1">1</button>
        <button class="num-btn" data-action="pressNum" data-key="2">2</button>
        <button class="num-btn" data-action="pressNum" data-key="3">3</button>
        <button class="num-btn" data-action="pressNum" data-key="4">4</button>
        <button class="num-btn" data-action="pressNum" data-key="5">5</button>
        <button class="num-btn" data-action="pressNum" data-key="6">6</button>
        <button class="num-btn" data-action="pressNum" data-key="7">7</button>
        <button class="num-btn" data-action="pressNum" data-key="8">8</button>
        <button class="num-btn" data-action="pressNum" data-key="9">9</button>
        <button class="num-btn fn-btn" data-action="pressDelete">지우기</button>
        <button class="num-btn" data-action="pressNum" data-key="0">0</button>
        <button class="num-btn fn-btn confirm-btn" data-action="pressConfirm">확인</button>
      </div>
    </div>

    <button class="back-to-main" data-action="backToMain">← 메인</button>
  </div>
  `;
}
