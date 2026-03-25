// ===== useGallery: 활동 갤러리 =====
import { initialGalleryItems, GALLERY_GRADIENTS } from '../data/sampleData.js';
import { getIsAdmin } from '../state.js';

let galleryItems = [...initialGalleryItems];

export function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  const admin = getIsAdmin();
  grid.innerHTML = galleryItems.map((item, i) => {
    const bg = item.photo
      ? `background-image:url('${item.photo}'); background-size:cover; background-position:center;`
      : `background: ${GALLERY_GRADIENTS[i % GALLERY_GRADIENTS.length]};`;
    return `
      <div class="gallery-card">
        <div class="gallery-img" style="${bg}">
          <span>${item.category}</span>
        </div>
        <div class="gallery-info">
          <div class="gallery-title">${item.title}</div>
          <div class="gallery-date">${item.date}</div>
          ${admin ? `<div class="notice-actions gallery-actions"><button class="delete-btn" onclick="deleteGalleryItem(${i})">삭제</button></div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

export function addGalleryItem() {
  const title = document.getElementById('galTitle').value.trim();
  const category = document.getElementById('galCategory').value.trim();
  const dateVal = document.getElementById('galDate').value;
  const fileInput = document.getElementById('galPhoto');

  if (!title || !category) { alert('제목과 카테고리를 입력해주세요.'); return; }

  const dateStr = dateVal ? dateVal.replace(/-/g, '.') : new Date().toISOString().split('T')[0].replace(/-/g, '.');

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      galleryItems.unshift({ title, category, date: dateStr, photo: e.target.result });
      renderGallery();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    galleryItems.unshift({ title, category, date: dateStr, photo: null });
    renderGallery();
  }

  document.getElementById('galTitle').value = '';
  document.getElementById('galCategory').value = '';
  document.getElementById('galDate').value = '';
  fileInput.value = '';
}

export function deleteGalleryItem(idx) {
  if (!confirm('이 활동을 삭제하시겠습니까?')) return;
  galleryItems.splice(idx, 1);
  renderGallery();
}

export function initGallery() {
  renderGallery();
}

// window에 노출
window.addGalleryItem = addGalleryItem;
window.deleteGalleryItem = deleteGalleryItem;
