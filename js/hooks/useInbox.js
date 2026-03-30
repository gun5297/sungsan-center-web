// ===== useInbox: 서류함 시스템 (Firestore) =====
import {
  subscribeInbox,
  addInboxItem as addInboxItemFS,
  deleteInboxItem as deleteInboxItemFS,
  getMySubmissions as getMySubmissionsFS
} from '../../firebase/services/inboxService.js';
import { getCurrentUser, getUserRole, getIsAdmin } from '../state.js';
import { getMyChildren } from '../../firebase/services/childLinkService.js';
import { escapeHtml } from '../utils.js';
import { on } from '../events.js';
import { logAction } from '../../firebase/services/auditService.js';

let inboxItems = [];
let currentInboxFilter = 'all';
let currentSearchKeyword = '';
let currentSortBy = 'newest';

// 외부(useAbsence, useMedication 등)에서 호출
export async function addInboxItem(item) {
  return await addInboxItemFS(item);
}

export function getInboxItems() {
  return inboxItems;
}

export function updateInboxBadge() {
  const badge = document.getElementById('inboxBadge');
  if (badge) badge.textContent = inboxItems.length;
}

export function openInbox() {
  document.getElementById('inboxModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  logAction('read', 'inbox', '', '서류함 열람');
  // 검색/정렬 상태 초기화
  currentSearchKeyword = '';
  currentSortBy = 'newest';
  const searchInput = document.getElementById('inboxSearch');
  const sortSelect = document.getElementById('inboxSort');
  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'newest';
  renderInbox();
  // [UX] ESC 키로 모달 닫기
  document.addEventListener('keydown', _inboxEscHandler);
}

function _inboxEscHandler(e) {
  if (e.key === 'Escape') closeInbox();
}

export function closeInbox() {
  document.getElementById('inboxModal').classList.remove('active');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', _inboxEscHandler);
}

export function switchInboxTab(type) {
  currentInboxFilter = type;
  document.querySelectorAll('.inbox-tab').forEach(t => {
    t.classList.toggle('active', t.textContent.includes(
      type === 'all' ? '전체' : type === 'absence' ? '결석' : type === 'medication' ? '투약' : type === 'register' ? '등록' : '상담'
    ));
  });
  renderInbox();
}

export function searchInbox(keyword) {
  currentSearchKeyword = keyword.trim().toLowerCase();
  renderInbox();
}

export function sortInbox(sortBy) {
  currentSortBy = sortBy;
  renderInbox();
}

export function renderInbox() {
  const list = document.getElementById('inboxList');
  if (!list) return;

  // 탭 필터
  let filtered = currentInboxFilter === 'all' ? [...inboxItems] : inboxItems.filter(i => i.type === currentInboxFilter);

  // 키워드 검색
  if (currentSearchKeyword) {
    filtered = filtered.filter(i =>
      (i.name && i.name.toLowerCase().includes(currentSearchKeyword)) ||
      (i.summary && i.summary.toLowerCase().includes(currentSearchKeyword))
    );
  }

  // 정렬
  if (currentSortBy === 'newest') {
    filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } else if (currentSortBy === 'oldest') {
    filtered.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  } else if (currentSortBy === 'name') {
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="inbox-empty">제출된 서류가 없습니다</div>';
    return;
  }

  const typeLabels = { absence: '결석/조퇴', medication: '투약 의뢰', register: '신규 등록', consult: '상담 신청' };

  list.innerHTML = filtered.map((item) => {
    const consentStr = item.consents ? item.consents.map(c => `<span class="inbox-consent-tag">✓ ${escapeHtml(c)}</span>`).join(' ') : '';
    return `
      <div class="inbox-item" data-action="printInboxItem" data-id="${escapeHtml(item.id)}">
        <span class="inbox-type ${escapeHtml(item.type)}">${escapeHtml(typeLabels[item.type])}</span>
        <div class="inbox-info">
          <div class="inbox-name">${escapeHtml(item.name)}</div>
          ${item.receiptNo ? `<div class="inbox-receipt">접수번호: ${escapeHtml(item.receiptNo)}</div>` : ''}
          <div class="inbox-detail">${escapeHtml(item.summary)}</div>
          ${consentStr ? `<div class="inbox-consents">${consentStr}</div>` : ''}
        </div>
        <span class="inbox-date">${escapeHtml(item.date)}</span>
        <button class="inbox-print-btn" data-action="printInboxItem" data-id="${escapeHtml(item.id)}">출력</button>
        <button class="delete-btn" data-action="deleteInboxItemById" data-id="${escapeHtml(item.id)}">삭제</button>
      </div>
    `;
  }).join('');
}

export async function deleteInboxItemById(id) {
  if (!await showConfirm('이 서류를 삭제하시겠습니까?')) return;
  try {
    await deleteInboxItemFS(id);
    // 실시간 구독이 자동으로 renderInbox() 호출
  } catch (e) {
    console.error('삭제 오류:', e);
    showToast('삭제 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
  }
}

export function printInboxItem(id) {
  const item = inboxItems.find(i => i.id === id);
  if (!item) return;
  logAction('export', 'inbox', id, `서류 출력: ${item.type} - ${item.name}`);

  const printArea = document.getElementById('printArea');
  let html = '';

  const receiptNo = item.receiptNo || '';

  if (item.type === 'absence') {
    html = `
      <div class="print-header">
        <div class="print-org">성산지역아동센터</div>
        <div class="print-title">${escapeHtml(item.data.type)} 신청서</div>
        ${receiptNo ? `<div class="print-receipt">접수번호: ${escapeHtml(receiptNo)}</div>` : ''}
      </div>
      <table>
        <tr><th>신청 구분</th><td>${escapeHtml(item.data.type)}</td></tr>
        <tr><th>아동 성명</th><td>${escapeHtml(item.data.name)}</td></tr>
        <tr><th>소속 학교/학년</th><td>${escapeHtml(item.data.school)}</td></tr>
        <tr><th>보호자 성명</th><td>${escapeHtml(item.data.guardian || '-')}</td></tr>
        <tr><th>보호자 연락처</th><td>${escapeHtml(item.data.phone || '-')}</td></tr>
        <tr><th>사유</th><td>${escapeHtml(item.data.reason)}</td></tr>
        <tr><th>기간</th><td>${escapeHtml(item.data.from)} ~ ${escapeHtml(item.data.to || item.data.from)}</td></tr>
        <tr><th>신청일</th><td>${escapeHtml(item.data.absDate || item.date)}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 본인은 아동의 보호자로서 위 내용이 사실임을 확인하며, 센터 운영규정에 따라 사전 통보 없는 결석이 반복될 경우 이용에 제한이 있을 수 있음을 안내받았습니다.</p>
        <p>위와 같은 사유로 ${escapeHtml(item.data.type)}을(를) 신청합니다.</p>
      </div>
      <div class="print-sign">
        <p>${escapeHtml(item.date)}</p>
        <p>신청인(보호자): ${escapeHtml(item.data.guardian || '___________')} ${item.data.signature ? `<img src="${escapeHtml(item.data.signature)}" style="height:50px;vertical-align:middle;" />` : '(서명)'}</p>
      </div>
      <div class="print-to">성산지역아동센터장 귀하</div>
    `;
  } else if (item.type === 'medication') {
    html = `
      <div class="print-header">
        <div class="print-org">성산지역아동센터</div>
        <div class="print-title">투약 의뢰서</div>
        ${receiptNo ? `<div class="print-receipt">접수번호: ${escapeHtml(receiptNo)}</div>` : ''}
      </div>
      <table>
        <tr><th>아동 성명</th><td>${escapeHtml(item.data.name)}</td></tr>
        <tr><th>증상/진단명</th><td>${escapeHtml(item.data.symptom)}</td></tr>
        <tr><th>처방 병원</th><td>${escapeHtml(item.data.hospital || '-')}</td></tr>
        <tr><th>약 이름</th><td>${escapeHtml(item.data.drug)}</td></tr>
        <tr><th>투약 용량</th><td>${escapeHtml(item.data.dose)}</td></tr>
        <tr><th>투약 시간</th><td>${escapeHtml(item.data.time)}</td></tr>
        <tr><th>투약 기간</th><td>${escapeHtml(item.data.from)} ~ ${escapeHtml(item.data.to || item.data.from)}</td></tr>
        <tr><th>보관 방법</th><td>${escapeHtml(item.data.storage)}</td></tr>
        <tr><th>특이사항</th><td>${escapeHtml(item.data.note || '-')}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 투약 시 발생할 수 있는 부작용에 대해 안내 받았으며, 부작용 발생 시 투약 중단에 동의합니다.</p>
        <p>※ 정확한 약 정보를 기재하였으며, 잘못된 정보 기재로 인한 책임은 보호자에게 있음을 확인합니다.</p>
        <p>※ 건강 상태 변화 시 119 신고 및 응급 조치를 취할 수 있음에 동의합니다.</p>
        <p>위 아동에 대한 투약을 의뢰하며, 상기 안내사항을 모두 확인하였습니다.</p>
      </div>
      <div class="print-sign">
        <p>${escapeHtml(item.date)}</p>
        <p>의뢰인(보호자): ___________ ${item.data.signature ? `<img src="${escapeHtml(item.data.signature)}" style="height:50px;vertical-align:middle;" />` : '(서명)'}</p>
      </div>
      <div class="print-to">성산지역아동센터장 귀하</div>
    `;
  } else if (item.type === 'register') {
    html = `
      <div class="print-header">
        <div class="print-org">성산지역아동센터</div>
        <div class="print-title">이용 신청서</div>
      </div>
      <table>
        <tr><th>아동 성명</th><td>${escapeHtml(item.data.name)}</td></tr>
        <tr><th>생년월일</th><td>${escapeHtml(item.data.birth || '-')}</td></tr>
        <tr><th>성별</th><td>${escapeHtml(item.data.gender || '-')}</td></tr>
        <tr><th>소속 학교/학년</th><td>${escapeHtml(item.data.school || '-')}</td></tr>
        <tr><th>보호자 성명</th><td>${escapeHtml(item.data.guardian)}</td></tr>
        <tr><th>관계</th><td>${escapeHtml(item.data.relation || '-')}</td></tr>
        <tr><th>보호자 연락처</th><td>${escapeHtml(item.data.phone)}</td></tr>
        <tr><th>비상 연락처</th><td>${escapeHtml(item.data.emergency || '-')}</td></tr>
        <tr><th>주소</th><td>${escapeHtml(item.data.address || '-')}</td></tr>
        <tr><th>이용 희망 요일</th><td>${escapeHtml(item.data.days || '-')}</td></tr>
        <tr><th>특이사항</th><td>${escapeHtml(item.data.note || '-')}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 기재 내용이 사실임을 확인하며, 센터 이용규정 및 안전수칙을 준수할 것에 동의합니다.</p>
        <p>※ 아동의 개인정보를 센터 운영 목적으로 수집·이용하는 것에 동의합니다. (보유기간: 퇴소 후 3년)</p>
      </div>
      <div class="print-sign">
        <p>${escapeHtml(item.date)}</p>
        <p>신청인(보호자): ${escapeHtml(item.data.guardian || '___________')} (서명)</p>
      </div>
      <div class="print-to">성산지역아동센터장 귀하</div>
    `;
  } else if (item.type === 'consult') {
    html = `
      <div class="print-header">
        <div class="print-org">성산지역아동센터</div>
        <div class="print-title">상담 신청서</div>
      </div>
      <table>
        <tr><th>신청자(보호자)</th><td>${escapeHtml(item.data.guardian)}</td></tr>
        <tr><th>연락처</th><td>${escapeHtml(item.data.phone || '-')}</td></tr>
        <tr><th>아동 성명</th><td>${escapeHtml(item.data.child)}</td></tr>
        <tr><th>희망 상담 일시</th><td>${escapeHtml(item.data.dateTime || '-')}</td></tr>
        <tr><th>상담 주제</th><td>${escapeHtml(item.data.topic || '-')}</td></tr>
        <tr><th>상담 내용</th><td class="pre-wrap">${escapeHtml(item.data.detail)}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 상담 내용은 아동 지도 및 센터 운영 개선 목적으로만 활용되며, 상담 기록이 보관될 수 있습니다.</p>
      </div>
      <div class="print-sign">
        <p>${escapeHtml(item.date)}</p>
        <p>신청인(보호자): ${escapeHtml(item.data.guardian || '___________')} (서명)</p>
      </div>
      <div class="print-to">성산지역아동센터장 귀하</div>
    `;
  }

  printArea.innerHTML = html;
  setTimeout(() => window.print(), 100);
}

// ===== 내 제출 이력 =====
let mySubmitFilter = 'all';
let mySubmitItems = [];

export async function openMySubmissions() {
  const user = getCurrentUser();
  if (!user) {
    showToast('로그인이 필요합니다.', 'error');
    return;
  }

  document.getElementById('mySubmissionsModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  mySubmitFilter = 'all';
  // [UX] ESC 키로 모달 닫기
  document.addEventListener('keydown', _mySubmitEscHandler);

  // 탭 초기화
  document.querySelectorAll('#mySubmitTabs .inbox-tab').forEach(t => {
    t.classList.toggle('active', t.textContent.includes('전체'));
  });

  const list = document.getElementById('mySubmitList');
  list.innerHTML = '<div class="inbox-empty">불러오는 중...</div>';

  try {
    // 내 아이 목록 조회
    const children = await getMyChildren(user.uid);
    if (children.length === 0) {
      list.innerHTML = '<div class="inbox-empty">연결된 아동이 없습니다. 마이페이지에서 아이를 연결해 주세요.</div>';
      return;
    }

    const childNames = children.map(c => c.childName);
    mySubmitItems = await getMySubmissionsFS(childNames);
    renderMySubmissions();
  } catch (e) {
    console.error('[useInbox] 내 제출 이력 조회 실패:', e);
    list.innerHTML = '<div class="inbox-empty">제출 이력을 불러올 수 없습니다</div>';
  }
}

function _mySubmitEscHandler(e) {
  if (e.key === 'Escape') closeMySubmissions();
}

export function closeMySubmissions() {
  document.getElementById('mySubmissionsModal').classList.remove('active');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', _mySubmitEscHandler);
}

export function switchMySubmitTab(type) {
  mySubmitFilter = type;
  document.querySelectorAll('#mySubmitTabs .inbox-tab').forEach(t => {
    t.classList.toggle('active', t.textContent.includes(
      type === 'all' ? '전체' : type === 'absence' ? '결석' : type === 'medication' ? '투약' : type === 'register' ? '등록' : '상담'
    ));
  });
  renderMySubmissions();
}

function renderMySubmissions() {
  const list = document.getElementById('mySubmitList');
  if (!list) return;

  let filtered = mySubmitFilter === 'all' ? [...mySubmitItems] : mySubmitItems.filter(i => i.type === mySubmitFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<div class="inbox-empty">제출된 서류가 없습니다</div>';
    return;
  }

  const typeLabels = { absence: '결석/조퇴', medication: '투약 의뢰', register: '신규 등록', consult: '상담 신청' };

  list.innerHTML = filtered.map(item => {
    const consentStr = item.consents ? item.consents.map(c => `<span class="inbox-consent-tag">✓ ${escapeHtml(c)}</span>`).join(' ') : '';
    return `
      <div class="inbox-item" data-action="printInboxItem" data-id="${escapeHtml(item.id)}">
        <span class="inbox-type ${escapeHtml(item.type)}">${escapeHtml(typeLabels[item.type] || item.type)}</span>
        <div class="inbox-info">
          <div class="inbox-name">${escapeHtml(item.name)}</div>
          ${item.receiptNo ? `<div class="inbox-receipt">접수번호: ${escapeHtml(item.receiptNo)}</div>` : ''}
          <div class="inbox-detail">${escapeHtml(item.summary || '')}</div>
          ${consentStr ? `<div class="inbox-consents">${consentStr}</div>` : ''}
        </div>
        <span class="inbox-date">${escapeHtml(item.date || '')}</span>
      </div>
    `;
  }).join('');
}

let _unsubInbox = null;

export function initInbox() {
  if (!getIsAdmin()) {
    if (_unsubInbox) { _unsubInbox(); _unsubInbox = null; }
    inboxItems = [];
    updateInboxBadge();
    return;
  }

  // 이미 구독 중이면 스킵
  if (_unsubInbox) return;

  // Firestore 실시간 구독
  _unsubInbox = subscribeInbox((data) => {
    inboxItems = data;
    updateInboxBadge();
    // 모달이 열려있으면 즉시 갱신
    if (document.getElementById('inboxModal')?.classList.contains('active')) {
      renderInbox();
    }
  });
}

// 이벤트 위임 등록
on('openInbox', () => openInbox());
on('closeInbox', () => closeInbox());
on('switchInboxTab', (e, el) => switchInboxTab(el.dataset.tab));
on('printInboxItem', (e, el) => printInboxItem(el.dataset.id));
on('deleteInboxItemById', (e, el) => {
  e.stopPropagation();
  deleteInboxItemById(el.dataset.id);
});
on('searchInbox', (e, el) => searchInbox(el.value), 'keyup');
on('sortInbox', (e, el) => sortInbox(el.value), 'change');
on('openMySubmissions', () => openMySubmissions());
on('closeMySubmissions', () => closeMySubmissions());
on('switchMySubmitTab', (e, el) => switchMySubmitTab(el.dataset.tab));
