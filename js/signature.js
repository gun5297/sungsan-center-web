// ===== 전자서명 모듈 =====
// 터치/마우스로 서명 캔버스에 서명 → PNG 데이터로 변환

export function openSignaturePad(onComplete) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal" style="max-width:480px;padding:24px;">
      <div class="modal-title">전자서명</div>
      <p style="font-size:0.82rem;color:var(--text-sub);margin-bottom:12px;">아래 영역에 서명해 주세요</p>
      <canvas id="signatureCanvas" width="420" height="200" style="border:1px solid var(--border);border-radius:10px;width:100%;touch-action:none;cursor:crosshair;background:#fff;"></canvas>
      <div style="display:flex;gap:12px;margin-top:16px;align-items:center;">
        <button class="btn-upload" style="margin-top:0;" id="sigConfirmBtn">확인</button>
        <button class="btn-secondary-sm" id="sigClearBtn">지우기</button>
        <button class="modal-close" id="sigCancelBtn">취소</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const canvas = document.getElementById('signatureCanvas');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let hasDrawn = false;

  // 캔버스 크기 조정
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  ctx.scale(2, 2);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2d2319';

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - r.left, y: touch.clientY - r.top };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    hasDrawn = true;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function stopDraw() { drawing = false; }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDraw);

  document.getElementById('sigClearBtn').onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn = false;
  };

  document.getElementById('sigCancelBtn').onclick = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  };

  document.getElementById('sigConfirmBtn').onclick = () => {
    if (!hasDrawn) {
      showToast('서명을 해주세요.', 'warning');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
    if (onComplete) onComplete(dataUrl);
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  });
}

