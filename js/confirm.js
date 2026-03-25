// ===== 커스텀 확인 모달 =====

/**
 * 커스텀 확인 대화상자 (Promise 기반)
 * @param {string} message - 확인 메시지
 * @returns {Promise<boolean>} - 확인: true, 취소: false
 */
export function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';

    overlay.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-message">${message}</div>
        <div class="confirm-actions">
          <button class="confirm-btn confirm-cancel">취소</button>
          <button class="confirm-btn confirm-ok">확인</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 등장 애니메이션
    requestAnimationFrame(() => {
      overlay.classList.add('confirm-active');
    });

    function close(result) {
      overlay.classList.remove('confirm-active');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
      setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 400);
      resolve(result);
    }

    overlay.querySelector('.confirm-ok').addEventListener('click', () => close(true));
    overlay.querySelector('.confirm-cancel').addEventListener('click', () => close(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });

    // ESC 키
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        close(false);
        document.removeEventListener('keydown', onKeyDown);
      }
    }
    document.addEventListener('keydown', onKeyDown);
  });
}

// 전역 노출
window.showConfirm = showConfirm;
