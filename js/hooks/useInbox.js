// ===== useInbox: 서류함 시스템 =====
import { initialInboxItems } from '../data/sampleData.js';

let inboxItems = [...initialInboxItems];
let currentInboxFilter = 'all';

export function addInboxItem(item) {
  inboxItems.unshift(item);
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
  renderInbox();
}

export function closeInbox() {
  document.getElementById('inboxModal').classList.remove('active');
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

export function renderInbox() {
  const list = document.getElementById('inboxList');
  if (!list) return;
  const filtered = currentInboxFilter === 'all' ? inboxItems : inboxItems.filter(i => i.type === currentInboxFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<div class="inbox-empty">제출된 서류가 없습니다</div>';
    return;
  }

  const typeLabels = { absence: '결석/조퇴', medication: '투약 의뢰', register: '신규 등록', consult: '상담 신청' };

  list.innerHTML = filtered.map((item) => {
    const idx = inboxItems.indexOf(item);
    const consentStr = item.consents ? item.consents.map(c => `<span class="inbox-consent-tag">✓ ${c}</span>`).join(' ') : '';
    return `
      <div class="inbox-item" onclick="printInboxItem(${idx})">
        <span class="inbox-type ${item.type}">${typeLabels[item.type]}</span>
        <div class="inbox-info">
          <div class="inbox-name">${item.name}</div>
          <div class="inbox-detail">${item.summary}</div>
          ${consentStr ? `<div class="inbox-consents">${consentStr}</div>` : ''}
        </div>
        <span class="inbox-date">${item.date}</span>
        <button class="inbox-print-btn" onclick="event.stopPropagation(); printInboxItem(${idx})">출력</button>
      </div>
    `;
  }).join('');
}

export function printInboxItem(idx) {
  const item = inboxItems[idx];
  if (!item) return;

  const printArea = document.getElementById('printArea');
  let html = '';

  if (item.type === 'absence') {
    html = `
      <div class="print-header">
        <div class="print-org">성산지역아동센터</div>
        <div class="print-title">${item.data.type} 신청서</div>
      </div>
      <table>
        <tr><th>신청 구분</th><td>${item.data.type}</td></tr>
        <tr><th>아동 성명</th><td>${item.data.name}</td></tr>
        <tr><th>소속 학교/학년</th><td>${item.data.school}</td></tr>
        <tr><th>보호자 성명</th><td>${item.data.guardian || '-'}</td></tr>
        <tr><th>보호자 연락처</th><td>${item.data.phone || '-'}</td></tr>
        <tr><th>사유</th><td>${item.data.reason}</td></tr>
        <tr><th>기간</th><td>${item.data.from} ~ ${item.data.to || item.data.from}</td></tr>
        <tr><th>신청일</th><td>${item.data.absDate || item.date}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 본인은 아동의 보호자로서 위 내용이 사실임을 확인하며, 센터 운영규정에 따라 사전 통보 없는 결석이 반복될 경우 이용에 제한이 있을 수 있음을 안내받았습니다.</p>
        <p>위와 같은 사유로 ${item.data.type}을(를) 신청합니다.</p>
      </div>
      <div class="print-sign">
        <p>${item.date}</p>
        <p>신청인(보호자): ${item.data.guardian || '___________'} (서명)</p>
      </div>
      <div class="print-to">성산지역아동센터장 귀하</div>
    `;
  } else if (item.type === 'medication') {
    html = `
      <div class="print-header">
        <div class="print-org">성산지역아동센터</div>
        <div class="print-title">투약 의뢰서</div>
      </div>
      <table>
        <tr><th>아동 성명</th><td>${item.data.name}</td></tr>
        <tr><th>증상/진단명</th><td>${item.data.symptom}</td></tr>
        <tr><th>처방 병원</th><td>${item.data.hospital || '-'}</td></tr>
        <tr><th>약 이름</th><td>${item.data.drug}</td></tr>
        <tr><th>투약 용량</th><td>${item.data.dose}</td></tr>
        <tr><th>투약 시간</th><td>${item.data.time}</td></tr>
        <tr><th>투약 기간</th><td>${item.data.from} ~ ${item.data.to || item.data.from}</td></tr>
        <tr><th>보관 방법</th><td>${item.data.storage}</td></tr>
        <tr><th>특이사항</th><td>${item.data.note || '-'}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 투약 시 발생할 수 있는 부작용에 대해 안내 받았으며, 부작용 발생 시 투약 중단에 동의합니다.</p>
        <p>※ 정확한 약 정보를 기재하였으며, 잘못된 정보 기재로 인한 책임은 보호자에게 있음을 확인합니다.</p>
        <p>※ 건강 상태 변화 시 119 신고 및 응급 조치를 취할 수 있음에 동의합니다.</p>
        <p>위 아동에 대한 투약을 의뢰하며, 상기 안내사항을 모두 확인하였습니다.</p>
      </div>
      <div class="print-sign">
        <p>${item.date}</p>
        <p>의뢰인(보호자): ___________ (서명)</p>
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
        <tr><th>아동 성명</th><td>${item.data.name}</td></tr>
        <tr><th>생년월일</th><td>${item.data.birth || '-'}</td></tr>
        <tr><th>성별</th><td>${item.data.gender || '-'}</td></tr>
        <tr><th>소속 학교/학년</th><td>${item.data.school || '-'}</td></tr>
        <tr><th>보호자 성명</th><td>${item.data.guardian}</td></tr>
        <tr><th>관계</th><td>${item.data.relation || '-'}</td></tr>
        <tr><th>보호자 연락처</th><td>${item.data.phone}</td></tr>
        <tr><th>비상 연락처</th><td>${item.data.emergency || '-'}</td></tr>
        <tr><th>주소</th><td>${item.data.address || '-'}</td></tr>
        <tr><th>이용 희망 요일</th><td>${item.data.days || '-'}</td></tr>
        <tr><th>특이사항</th><td>${item.data.note || '-'}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 기재 내용이 사실임을 확인하며, 센터 이용규정 및 안전수칙을 준수할 것에 동의합니다.</p>
        <p>※ 아동의 개인정보를 센터 운영 목적으로 수집·이용하는 것에 동의합니다. (보유기간: 퇴소 후 3년)</p>
      </div>
      <div class="print-sign">
        <p>${item.date}</p>
        <p>신청인(보호자): ${item.data.guardian || '___________'} (서명)</p>
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
        <tr><th>신청자(보호자)</th><td>${item.data.guardian}</td></tr>
        <tr><th>연락처</th><td>${item.data.phone || '-'}</td></tr>
        <tr><th>아동 성명</th><td>${item.data.child}</td></tr>
        <tr><th>희망 상담 일시</th><td>${item.data.dateTime || '-'}</td></tr>
        <tr><th>상담 주제</th><td>${item.data.topic || '-'}</td></tr>
        <tr><th>상담 내용</th><td style="white-space:pre-wrap;">${item.data.detail}</td></tr>
      </table>
      <div class="print-notice">
        <p>※ 상담 내용은 아동 지도 및 센터 운영 개선 목적으로만 활용되며, 상담 기록이 보관될 수 있습니다.</p>
      </div>
      <div class="print-sign">
        <p>${item.date}</p>
        <p>신청인(보호자): ${item.data.guardian || '___________'} (서명)</p>
      </div>
      <div class="print-to">성산지역아동센터장 귀하</div>
    `;
  }

  printArea.innerHTML = html;
  setTimeout(() => window.print(), 100);
}

export function initInbox() {
  updateInboxBadge();
}

// window에 노출
window.openInbox = openInbox;
window.closeInbox = closeInbox;
window.switchInboxTab = switchInboxTab;
window.printInboxItem = printInboxItem;
