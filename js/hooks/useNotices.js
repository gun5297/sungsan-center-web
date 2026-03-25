// ===== useNotices: 공지사항 CRUD (Firestore) =====
import { formatDate, closeModal } from '../utils.js';
import { getUserRole, canManage } from '../state.js';
import {
  subscribeNotices,
  createNotice,
  updateNotice as updateNoticeFS,
  deleteNotice as deleteNoticeFS,
  uploadNoticeFile
} from '../../firebase/services/noticeService.js';

let notices = [];

function isImageFile(name) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
}

export function renderNotices() {
  const list = document.getElementById('noticeList');
  if (!list) return;
  if (notices.length === 0) {
    list.innerHTML = '<div class="empty-state">등록된 공지사항이 없습니다</div>';
    return;
  }
  list.innerHTML = notices.map(n => `
    <div class="notice-card" onclick="openNotice('${n.id}')">
      <div class="notice-header">
        <span class="notice-badge type-${n.category}">${n.category}</span>
        <span class="notice-date">${n.date}</span>
      </div>
      <div class="notice-title">${n.title}</div>
      <div class="notice-preview">${n.content}</div>
      ${n.file ? `<div class="notice-file" onclick="event.stopPropagation();">${n.fileUrl ? `<a href="${n.fileUrl}" target="_blank" class="notice-file-link">📎 ${n.file}</a>` : `📎 ${n.file}`}</div>` : ''}
      <div class="notice-actions">
        ${canManage() ? `<button class="edit-btn" onclick="event.stopPropagation(); editNotice('${n.id}')">수정</button>` : ''}
        ${canManage() ? `<button class="delete-btn" onclick="event.stopPropagation(); deleteNotice('${n.id}')">삭제</button>` : ''}
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
    alert('제목과 내용을 모두 입력해주세요.');
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
      alert('파일 업로드에 실패했습니다. 공지는 파일 없이 등록됩니다.');
    }
  }

  try {
    await createNotice({ title, content, category, date: formatDate(new Date()), file: fileName, fileUrl });
  } catch (e) {
    console.error('공지 등록 실패:', e);
    alert('공지 등록 중 오류가 발생했습니다.');
    return;
  }

  document.getElementById('noticeTitle').value = '';
  document.getElementById('noticeContent').value = '';
  document.getElementById('fileName').textContent = '';
  fileInput.value = '';
}

export async function deleteNotice(id) {
  if (!confirm('이 공지를 삭제하시겠습니까?')) return;
  await deleteNoticeFS(id);
  // 실시간 구독이 자동으로 renderNotices() 호출
}

export function editNotice(id) {
  const notice = notices.find(n => String(n.id) === String(id));
  if (!notice) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">공지 수정</div>
      <input type="text" class="input-field" id="editNoticeTitle" value="${notice.title}" />
      <textarea class="input-field textarea" id="editNoticeContent">${notice.content}</textarea>
      <select class="input-field select-field" id="editNoticeCategory">
        <option value="공지" ${notice.category === '공지' ? 'selected' : ''}>공지사항</option>
        <option value="통신문" ${notice.category === '통신문' ? 'selected' : ''}>가정통신문</option>
        <option value="긴급" ${notice.category === '긴급' ? 'selected' : ''}>긴급 안내</option>
      </select>
      <div style="display:flex;gap:12px;align-items:center;">
        <button class="btn-upload" style="margin-top:0;" onclick="saveEditNotice('${id}')">저장</button>
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
  await updateNoticeFS(id, { title, content, category });
  document.querySelector('.modal-overlay.active .modal-close').click();
  // 실시간 구독이 자동으로 renderNotices() 호출
}

export function openNotice(id) {
  const notice = notices.find(n => String(n.id) === String(id));
  if (!notice) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${notice.title}</div>
      <div class="modal-meta">
        <span class="notice-badge type-${notice.category}">${notice.category}</span>
        <span class="notice-date">${notice.date}</span>
      </div>
      <div class="modal-body">${notice.content}</div>
      ${notice.file ? `<div class="notice-file-box">${notice.fileUrl ? `${isImageFile(notice.file) ? `<img src="${notice.fileUrl}" class="notice-file-preview" />` : ''}<a href="${notice.fileUrl}" target="_blank" download class="notice-file-download">📎 ${notice.file} — 다운로드</a>` : `📎 ${notice.file}`}</div>` : ''}
      <button class="modal-close" onclick="closeModal(this)">닫기</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.querySelector('.modal-close'));
  });
}

export function initNotices() {
  document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('fileName').textContent = file.name;
    }
  });

  // 로딩 표시
  const list = document.getElementById('noticeList');
  if (list) list.innerHTML = '<div class="loading-state">공지사항 불러오는 중</div>';

  // Firestore 실시간 구독
  subscribeNotices((data) => {
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
