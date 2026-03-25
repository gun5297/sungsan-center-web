// ===== useNotices: 공지사항 CRUD (Firestore) =====
import { formatDate, closeModal, skeletonCards, escapeHtml, checkConcurrentEdit } from '../utils.js';
import { getUserRole, canManage } from '../state.js';
import {
  subscribeNotices,
  createNotice,
  getNotice as getNoticeFS,
  updateNotice as updateNoticeFS,
  deleteNotice as deleteNoticeFS,
  uploadNoticeFile
} from '../../firebase/services/noticeService.js';
import { logAction } from '../../firebase/services/auditService.js';
import { markAsRead, getReadCount } from '../../firebase/services/noticeReadService.js';
import { getCurrentUser, isLoggedIn, getIsAdmin } from '../state.js';

let notices = [];
// 수정 모달 열 때 저장한 서버 타임스탬프 (충돌 감지용)
const _editingTimestamp = {}; // { [id]: seconds }

function isImageFile(name) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
}

// 서식 마크업 → HTML 변환
function formatContent(text) {
  let html = escapeHtml(text);
  // **굵게** → <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // __밑줄__ → <u>
  html = html.replace(/__(.+?)__/g, '<u>$1</u>');
  // --- → <hr>
  html = html.replace(/^---$/gm, '<hr>');
  return html;
}

// textarea에 서식 삽입
export function insertFormatting(type) {
  const ta = document.getElementById('noticeContent');
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = ta.value.substring(start, end);
  let insert = '';

  switch (type) {
    case 'bold':
      insert = `**${selected || '텍스트'}**`;
      break;
    case 'underline':
      insert = `__${selected || '텍스트'}__`;
      break;
    case 'hr':
      insert = '\n---\n';
      break;
    case 'br':
      insert = '\n\n';
      break;
  }

  ta.value = ta.value.substring(0, start) + insert + ta.value.substring(end);
  ta.focus();
  const cursorPos = start + insert.length;
  ta.setSelectionRange(cursorPos, cursorPos);
}

export function renderNotices() {
  const list = document.getElementById('noticeList');
  if (!list) return;
  if (notices.length === 0) {
    list.innerHTML = '<div class="empty-state">등록된 공지사항이 없습니다</div>';
    return;
  }
  list.innerHTML = notices.map(n => `
    <div class="notice-card" onclick="openNotice('${escapeHtml(n.id)}')">
      <div class="notice-header">
        <span class="notice-badge type-${escapeHtml(n.category)}">${escapeHtml(n.category)}</span>
        <span class="notice-date">${escapeHtml(n.date)}</span>
      </div>
      <div class="notice-title">${escapeHtml(n.title)}</div>
      <div class="notice-preview">${formatContent(n.content)}</div>
      ${n.file ? `<div class="notice-file" onclick="event.stopPropagation();">${n.fileUrl ? `<a href="${encodeURI(n.fileUrl)}" target="_blank" class="notice-file-link">📎 ${escapeHtml(n.file)}</a>` : `📎 ${escapeHtml(n.file)}`}</div>` : ''}
      <div class="notice-actions">
        ${canManage() ? `<button class="edit-btn" onclick="event.stopPropagation(); editNotice('${escapeHtml(n.id)}')">수정</button>` : ''}
        ${canManage() ? `<button class="delete-btn" onclick="event.stopPropagation(); deleteNotice('${escapeHtml(n.id)}')">삭제</button>` : ''}
      </div>
    </div>
  `).join('');
}

export async function addNotice() {
  const title = document.getElementById('noticeTitle').value.trim();
  const content = document.getElementById('noticeContent').value.trim();
  const category = document.getElementById('noticeCategory').value;
  const fileInput = document.getElementById('fileInput');

  if (!title || !content) {
    showToast('제목과 내용을 모두 입력해주세요.', 'warning');
    return;
  }

  let fileName = null;
  let fileUrl = null;
  if (fileInput.files && fileInput.files[0]) {
    fileName = fileInput.files[0].name;
    try {
      fileUrl = await uploadNoticeFile(fileInput.files[0]);
    } catch (e) {
      console.error('파일 업로드 실패:', e);
      showToast('파일 업로드에 실패했습니다. 공지는 파일 없이 등록됩니다.', 'warning');
    }
  }

  try {
    const docRef = await createNotice({ title, content, category, date: formatDate(new Date()), file: fileName, fileUrl });
    logAction('create', 'notice', docRef?.id || '', `공지 '${title}' 등록`);
  } catch (e) {
    console.error('공지 등록 실패:', e);
    showToast('공지 등록 중 오류가 발생했습니다.', 'error');
    return;
  }

  document.getElementById('noticeTitle').value = '';
  document.getElementById('noticeContent').value = '';
  document.getElementById('fileName').textContent = '';
  fileInput.value = '';
}

export async function deleteNotice(id) {
  if (!await showConfirm('이 공지를 삭제하시겠습니까?')) return;
  const notice = notices.find(n => String(n.id) === String(id));
  await deleteNoticeFS(id);
  logAction('delete', 'notice', id, `공지 '${notice?.title || id}' 삭제`);
}

export function editNotice(id) {
  const notice = notices.find(n => String(n.id) === String(id));
  if (!notice) return;
  // 현재 타임스탬프 기억 (updatedAt 우선, 없으면 createdAt)
  _editingTimestamp[id] = (notice.updatedAt || notice.createdAt)?.seconds ?? null;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">공지 수정</div>
      <input type="text" class="input-field" id="editNoticeTitle" value="${escapeHtml(notice.title)}" />
      <textarea class="input-field textarea" id="editNoticeContent">${escapeHtml(notice.content)}</textarea>
      <select class="input-field select-field" id="editNoticeCategory">
        <option value="공지" ${notice.category === '공지' ? 'selected' : ''}>공지사항</option>
        <option value="통신문" ${notice.category === '통신문' ? 'selected' : ''}>가정통신문</option>
        <option value="긴급" ${notice.category === '긴급' ? 'selected' : ''}>긴급 안내</option>
      </select>
      <div style="display:flex;gap:12px;align-items:center;">
        <button class="btn-upload" style="margin-top:0;" onclick="saveEditNotice('${escapeHtml(id)}')">저장</button>
        <button class="modal-close" onclick="closeModal(this)">취소</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

export async function saveEditNotice(id) {
  const title = document.getElementById('editNoticeTitle').value;
  const content = document.getElementById('editNoticeContent').value;
  const category = document.getElementById('editNoticeCategory').value;

  // 동시 수정 충돌 감지
  try {
    const current = await getNoticeFS(id);
    if (current) {
      const currentTs = (current.updatedAt || current.createdAt) ?? null;
      const savedTs = _editingTimestamp[id] !== undefined ? { seconds: _editingTimestamp[id] } : null;
      if (checkConcurrentEdit(savedTs, currentTs)) {
        const proceed = await showConfirm('다른 관리자가 이 공지를 수정했습니다.\n그래도 저장하시겠습니까? (기존 수정 내용을 덮어씁니다)');
        if (!proceed) return;
      }
    }
  } catch (e) {
    console.warn('충돌 감지 실패, 저장 진행:', e);
  }

  await updateNoticeFS(id, { title, content, category });
  logAction('update', 'notice', id, `공지 '${title}' 수정`);
  delete _editingTimestamp[id];
  document.querySelector('.modal-overlay.active .modal-close').click();
}

export async function openNotice(id) {
  const notice = notices.find(n => String(n.id) === String(id));
  if (!notice) return;

  // 로그인 사용자 읽음 표시
  if (isLoggedIn()) {
    const user = getCurrentUser();
    if (user) {
      try { await markAsRead(id, user.uid, user.name); } catch (e) { /* 무시 */ }
    }
  }

  // 관리자용 읽음 수 표시
  let readInfo = '';
  if (getIsAdmin()) {
    try {
      const count = await getReadCount(id);
      readInfo = `<div class="notice-read-count">👁 ${count}명 읽음</div>`;
    } catch (e) { /* 무시 */ }
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${escapeHtml(notice.title)}</div>
      <div class="modal-meta">
        <span class="notice-badge type-${escapeHtml(notice.category)}">${escapeHtml(notice.category)}</span>
        <span class="notice-date">${escapeHtml(notice.date)}</span>
        ${readInfo}
      </div>
      <div class="modal-body">${formatContent(notice.content)}</div>
      ${notice.file ? `<div class="notice-file-box">${notice.fileUrl ? `${isImageFile(notice.file) ? `<img src="${encodeURI(notice.fileUrl)}" class="notice-file-preview" />` : ''}<a href="${encodeURI(notice.fileUrl)}" target="_blank" download class="notice-file-download">📎 ${escapeHtml(notice.file)} — 다운로드</a>` : `📎 ${escapeHtml(notice.file)}`}</div>` : ''}
      <button class="modal-close" onclick="closeModal(this)">닫기</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.querySelector('.modal-close'));
  });
}

let _unsubNotices = null;

export function initNotices() {
  document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('fileName').textContent = file.name;
    }
  });

  // 로딩 표시
  const list = document.getElementById('noticeList');
  if (list) list.innerHTML = skeletonCards(3);

  // 이전 구독 해제
  if (_unsubNotices) _unsubNotices();

  // Firestore 실시간 구독
  _unsubNotices = subscribeNotices((data) => {
    notices = data;
    renderNotices();
  });
}

// window에 노출
window.addNotice = addNotice;
window.deleteNotice = deleteNotice;
window.editNotice = editNotice;
window.saveEditNotice = saveEditNotice;
window.openNotice = openNotice;
window.insertFormatting = insertFormatting;
