// ===== useHelp: 도움말 툴팁 + 웰컴 모달 =====
import { on } from '../events.js';

const HELP_CONTENT = {
  notice: {
    title: '공지사항',
    steps: ['센터의 공지사항을 확인할 수 있습니다.', '최신 공지가 상단에 표시됩니다.', '관리자는 새 공지를 작성하거나 수정/삭제할 수 있습니다.', '첨부파일이 있는 경우 다운로드할 수 있습니다.']
  },
  meal: {
    title: '식단표',
    steps: ['이번 주 식단을 확인할 수 있습니다.', '좌우 버튼으로 주차를 이동할 수 있습니다.', '관리자는 식단 사진을 업로드할 수 있습니다.']
  },
  schedule: {
    title: '시간표',
    steps: ['주간 시간표를 확인할 수 있습니다.', '관리자는 시간표 이미지를 업로드할 수 있습니다.']
  },
  attendance: {
    title: '출석 현황',
    steps: ['오늘 아동들의 출석 상태를 확인할 수 있습니다.', '학부모는 "내 아이" 출결만 표시됩니다.', '관리자는 전체 아동의 출결을 볼 수 있습니다.']
  },
  gallery: {
    title: '활동 갤러리',
    steps: ['센터 활동 사진을 볼 수 있습니다.', '로그인한 사용자만 열람 가능합니다.', '관리자는 사진을 업로드/삭제할 수 있습니다.']
  },
  absence: {
    title: '결석/조퇴 신청',
    steps: ['아동의 결석, 조퇴, 지각을 신청할 수 있습니다.', '로그인 없이도 제출할 수 있습니다.', '제출 후 접수번호가 발급됩니다.', '관리자는 서류함에서 신청서를 확인합니다.']
  },
  medication: {
    title: '투약 의뢰',
    steps: ['아동에게 투약이 필요할 때 의뢰서를 제출합니다.', '약 이름, 용량, 투약 시간 등을 입력합니다.', '전자서명으로 동의를 확인합니다.', '관리자는 투약 완료 체크를 할 수 있습니다.']
  },
  pickup: {
    title: '픽업 안내',
    steps: ['하원 시간 및 픽업 정보를 확인할 수 있습니다.', '관리자가 픽업 일정을 관리합니다.']
  },
  register: {
    title: '이용 등록/상담',
    steps: ['센터 이용을 신청하거나 상담을 요청할 수 있습니다.', '아동 정보와 보호자 정보를 입력합니다.', '제출 후 센터에서 연락을 드립니다.']
  }
};

let _activeTooltip = null;

function showHelpTooltip(section, btn) {
  closeHelpTooltip();

  const help = HELP_CONTENT[section];
  if (!help) return;

  const tooltip = document.createElement('div');
  tooltip.className = 'help-tooltip-popover';
  tooltip.innerHTML = `
    <div class="help-tooltip-title">${help.title}</div>
    <ul class="help-tooltip-steps">
      ${help.steps.map(s => `<li>${s}</li>`).join('')}
    </ul>
  `;

  // 버튼 위치 기준으로 배치
  const rect = btn.getBoundingClientRect();
  tooltip.style.position = 'fixed';
  tooltip.style.top = `${rect.bottom + 8}px`;
  tooltip.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - 280))}px`;
  tooltip.style.zIndex = '3000';

  document.body.appendChild(tooltip);
  _activeTooltip = tooltip;

  // 외부 클릭 시 닫기
  setTimeout(() => {
    document.addEventListener('click', _closeOnOutsideClick);
    document.addEventListener('keydown', _closeOnEsc);
  }, 10);
}

function closeHelpTooltip() {
  if (_activeTooltip) {
    _activeTooltip.remove();
    _activeTooltip = null;
  }
  document.removeEventListener('click', _closeOnOutsideClick);
  document.removeEventListener('keydown', _closeOnEsc);
}

function _closeOnOutsideClick(e) {
  if (_activeTooltip && !_activeTooltip.contains(e.target) && !e.target.classList.contains('help-tooltip-btn')) {
    closeHelpTooltip();
  }
}

function _closeOnEsc(e) {
  if (e.key === 'Escape') closeHelpTooltip();
}

on('showHelp', (e, el) => {
  e.stopPropagation();
  showHelpTooltip(el.dataset.section, el);
});

// ===== 웰컴 모달 (첫 로그인) =====

export function showWelcomeModal(name, isAdmin) {
  const existing = document.getElementById('welcomeOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'welcomeOverlay';
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal welcome-modal">
      <div class="welcome-emoji">&#128075;</div>
      <div class="modal-title">안녕하세요, ${name}님!</div>
      <p class="welcome-desc">성산지역아동센터 홈페이지에 오신 것을 환영합니다.</p>
      <div class="welcome-tips">
        <div class="welcome-tip">
          <span class="welcome-tip-icon">&#128204;</span>
          <span>${isAdmin ? '우상단 메뉴에서 출석, 서류함, 아동관리 등을 이용할 수 있습니다.' : '우상단 메뉴에서 출석 확인, 마이페이지를 이용할 수 있습니다.'}</span>
        </div>
        <div class="welcome-tip">
          <span class="welcome-tip-icon">&#10067;</span>
          <span>각 섹션 제목 옆의 <strong>?</strong> 버튼을 누르면 사용법을 볼 수 있습니다.</span>
        </div>
        <div class="welcome-tip">
          <span class="welcome-tip-icon">&#128214;</span>
          <span>자세한 사용법은 마이페이지의 <strong>사용 가이드</strong>에서 확인하세요.</span>
        </div>
      </div>
      <button class="btn-upload welcome-start-btn" data-action="closeWelcome">시작하기</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

on('closeWelcome', () => {
  const overlay = document.getElementById('welcomeOverlay');
  if (overlay) overlay.remove();
});
