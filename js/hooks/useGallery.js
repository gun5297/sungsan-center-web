// ===== useGallery: 활동 갤러리 (Firestore + Storage) =====
import { skeletonCards, escapeHtml, resizeImage } from '../utils.js';
import { GALLERY_GRADIENTS } from '../data/sampleData.js';
import { getIsAdmin, isLoggedIn } from '../state.js';
import {
  subscribeGallery,
  createGalleryItem,
  uploadPhoto,
  deleteGalleryItem as deleteGalleryItemFS
} from '../../firebase/services/galleryService.js';
import { logAction } from '../../firebase/services/auditService.js';
import { on } from '../events.js';

let galleryItems = [];

function updateGalleryVisibility() {
  const authWall = document.getElementById('galleryAuthWall');
  const grid = document.getElementById('galleryGrid');
  if (!authWall || !grid) return;

  if (isLoggedIn()) {
    authWall.style.display = 'none';
    grid.style.display = '';
  } else {
    authWall.style.display = '';
    grid.style.display = 'none';
  }
}

export function renderGallery() {
  updateGalleryVisibility();
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  const admin = getIsAdmin();
  if (galleryItems.length === 0) {
    grid.innerHTML = '<div class="empty-state">등록된 활동이 없습니다</div>';
    return;
  }
  grid.innerHTML = galleryItems.map((item, i) => {
    const bg = item.photoUrl
      ? `background-image:url('${encodeURI(item.photoUrl)}'); background-size:cover; background-position:center;`
      : `background: ${GALLERY_GRADIENTS[i % GALLERY_GRADIENTS.length]};`;
    return `
      <div class="gallery-card">
        <div class="gallery-img" style="${bg}">
          <span>${escapeHtml(item.category)}</span>
        </div>
        <div class="gallery-info">
          <div class="gallery-title">${escapeHtml(item.title)}</div>
          <div class="gallery-date">${escapeHtml(item.date)}</div>
          ${admin ? `<div class="notice-actions gallery-actions"><button class="delete-btn" data-action="deleteGalleryItem" data-id="${escapeHtml(item.id)}" data-path="${escapeHtml(item.storagePath || '')}">삭제</button></div>` : ''}
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

  if (!title || !category) { showToast('제목과 카테고리를 입력해주세요.', 'warning'); return; }

  const dateStr = dateVal ? dateVal.replace(/-/g, '.') : new Date().toISOString().split('T')[0].replace(/-/g, '.');

  try {
    const files = fileInput.files;
    const totalFiles = files ? files.length : 0;

    if (totalFiles > 1) {
      // 다중 파일 업로드
      for (let i = 0; i < totalFiles; i++) {
        showToast(`${i + 1}/${totalFiles} 업로드 중...`, 'info');
        const resized = await resizeImage(files[i]);
        const { url: photoUrl, storagePath } = await uploadPhoto(resized);
        await createGalleryItem({ title, category, date: dateStr, photoUrl, storagePath });
      }
      showToast(`${totalFiles}개 활동이 추가되었습니다.`, 'success');
    } else {
      // 단일 파일 또는 파일 없이 업로드
      let photoUrl = null;
      let storagePath = null;
      if (totalFiles === 1) {
        const resized = await resizeImage(files[0]);
        ({ url: photoUrl, storagePath } = await uploadPhoto(resized));
      }
      await createGalleryItem({ title, category, date: dateStr, photoUrl, storagePath });
      showToast('활동이 추가되었습니다.', 'success');
    }

    document.getElementById('galTitle').value = '';
    document.getElementById('galCategory').value = '';
    document.getElementById('galDate').value = '';
    fileInput.value = '';
  } catch (e) {
    console.error('갤러리 추가 실패:', e);
    showToast('추가 중 오류가 발생했습니다: ' + e.message, 'error');
  }
}

export async function deleteGalleryItem(id, storagePath) {
  if (!await showConfirm('이 활동을 삭제하시겠습니까?')) return;
  await deleteGalleryItemFS(id, storagePath || null);
  logAction('delete', 'gallery', id, '갤러리 항목 삭제');
}

let _unsubGallery = null;

export function initGallery() {
  // 로딩 표시
  const grid = document.getElementById('galleryGrid');
  if (grid) grid.innerHTML = skeletonCards(3);

  // 이전 구독 해제
  if (_unsubGallery) _unsubGallery();

  // Firestore 실시간 구독
  _unsubGallery = subscribeGallery((data) => {
    galleryItems = data;
    renderGallery();
  });

  // 갤러리 영역 우클릭·드래그 방지
  const gallerySection = document.getElementById('gallery');
  if (gallerySection) {
    gallerySection.addEventListener('contextmenu', (e) => {
      if (e.target.tagName === 'IMG' || e.target.closest('.gallery-card')) {
        e.preventDefault();
      }
    });
    gallerySection.addEventListener('dragstart', (e) => {
      if (e.target.closest('.gallery-card')) {
        e.preventDefault();
      }
    });
  }
}

// 이벤트 위임 등록
on('addGalleryItem', () => addGalleryItem());
on('deleteGalleryItem', (e, el) => deleteGalleryItem(el.dataset.id, el.dataset.path));
