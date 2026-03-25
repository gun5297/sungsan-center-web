// ===== useNotices: 공지사항 CRUD =====
import { initialNotices } from '../data/sampleData.js';
import { formatDate, closeModal } from '../utils.js';

let notices = [...initialNotices];

export function renderNotices() {
  const list = document.getElementById('noticeList');
  if (!list) return;
  list.innerHTML = notices.map(n => `
    <div class="notice-card" onclick="openNotice(${n.id})">
      <div class="notice-header">
        <span class="notice-badge type-${n.category}">${n.category}</span>
        <span class="notice-date">${n.date}</span>
      </div>
      <div class="notice-title">${n.title}</div>
      <div class="notice-preview">${n.content}</div>
      ${n.file ? `<div class="notice-file">📎 ${n.file}</div>` : ''}
      <div class="notice-actions">
        <button class="edit-btn" onclick="event.stopPropagation(); editNotice(${n.id})">수정</button>
        <button class="delete-btn" onclick="event.stopPropagation(); deleteNotice(${n.id})">삭제</button>
      </div>
    </div>
  `).join('');
}

export function addNotice() {
  const title = document.getElementById('noticeTitle').value.trim();
  const content = document.getElementById('noticeContent').value.trim();
  const category = document.getElementById('noticeCategory').value;
  const fileInput = document.getElementById('fileInput');
  const fileName = fileInput.files[0] ? fileInput.files[0].name : null;

  if (!title || !content) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }

  notices.unshift({
    id: Date.now(),
    title,
    content,
    category,
    date: formatDate(new Date()),
    file: fileName
  });

  document.getElementById('noticeTitle').value = '';
  document.getElementById('noticeContent').value = '';
  document.getElementById('fileName').textContent = '';
  fileInput.value = '';

  renderNotices();
}

export function deleteNotice(id) {
  if (!confirm('이 공지를 삭제하시겠습니까?')) return;
  notices = notices.filter(n => n.id !== id);
  renderNotices();
}

export function editNotice(id) {
  const notice = notices.find(n => n.id === id);
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
      <button class="btn-upload" onclick="saveEditNotice(${id})">저장</button>
      <button class="modal-close" onclick="closeModal(this)">취소</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

export function saveEditNotice(id) {
  const notice = notices.find(n => n.id === id);
  if (!notice) return;
  notice.title = document.getElementById('editNoticeTitle').value;
  notice.content = document.getElementById('editNoticeContent').value;
  notice.category = document.getElementById('editNoticeCategory').value;
  document.querySelector('.modal-overlay.active .modal-close').click();
  renderNotices();
}

export function openNotice(id) {
  const notice = notices.find(n => n.id === id);
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
      ${notice.file ? `<div class="notice-file">📎 ${notice.file}</div>` : ''}
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
  renderNotices();
}

// window에 노출
window.addNotice = addNotice;
window.deleteNotice = deleteNotice;
window.editNotice = editNotice;
window.saveEditNotice = saveEditNotice;
window.openNotice = openNotice;
