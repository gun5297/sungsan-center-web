// ===== useGallery: 활동 갤러리 (Firestore + Storage) =====
import { GALLERY_GRADIENTS } from '../data/sampleData.js';
import { getIsAdmin } from '../state.js';
import {
  subscribeGallery,
  createGalleryItem,
  uploadPhoto,
  deleteGalleryItem as deleteGalleryItemFS
} from '../../firebase/services/galleryService.js';

let galleryItems = [];

export function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  const admin = getIsAdmin();
  if (galleryItems.length === 0) {
    grid.innerHTML = '<div class="empty-state">등록된 활동이 없습니다</div>';
    return;
  }
  grid.innerHTML = galleryItems.map((item, i) => {
    const bg = item.photoUrl
      ? `background-image:url('${item.photoUrl}'); background-size:cover; background-position:center;`
      : `background: ${GALLERY_GRADIENTS[i % GALLERY_GRADIENTS.length]};`;
    return `
      <div class="gallery-card">
        <div class="gallery-img" style="${bg}">
          <span>${item.category}</span>
        </div>
        <div class="gallery-info">
          <div class="gallery-title">${item.title}</div>
          <div class="gallery-date">${item.date}</div>
          ${admin ? `<div class="notice-actions gallery-actions"><button class="delete-btn" onclick="deleteGalleryItem('${item.id}', '${item.photoUrl || ''}')">삭제</button></div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

export async function addGalleryItem() {
  const title = document.getElementById('galTitle').value.trim();
  const category = document.getElementById('galCategory').value.trim();
  const dateVal = document.getElementById('galDate').value;
  const fileInput = document.getElementById('galPhoto');

  if (!title || !category) { alert('제목과 카테고리를 입력해주세요.'); return; }

  const dateStr = dateVal ? dateVal.replace(/-/g, '.') : new Date().toISOString().split('T')[0].replace(/-/g, '.');

  let photoUrl = null;
  if (fileInput.files && fileInput.files[0]) {
    photoUrl = await uploadPhoto(fileInput.files[0]);
  }

  await createGalleryItem({ title, category, date: dateStr, photoUrl });

  document.getElementById('galTitle').value = '';
  document.getElementById('galCategory').value = '';
  document.getElementById('galDate').value = '';
  fileInput.value = '';
  // 실시간 구독이 자동으로 renderGallery() 호출
}

export async function deleteGalleryItem(id, photoUrl) {
  if (!confirm('이 활동을 삭제하시겠습니까?')) return;
  await deleteGalleryItemFS(id, photoUrl || null);
  // 실시간 구독이 자동으로 renderGallery() 호출
}

export function initGallery() {
  // 로딩 표시
  const grid = document.getElementById('galleryGrid');
  if (grid) grid.innerHTML = '<div class="loading-state">갤러리 불러오는 중</div>';

  // Firestore 실시간 구독
  subscribeGallery((data) => {
    galleryItems = data;
    renderGallery();
  });
}

// window에 노출
window.addGalleryItem = addGalleryItem;
window.deleteGalleryItem = deleteGalleryItem;
