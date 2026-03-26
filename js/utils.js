// ===== 공통 유틸리티 함수 =====

export function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDate(date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export function todayString() {
  return new Date().toISOString().split('T')[0];
}

export function getWeekDates(offset) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);

  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function isSameDay(a, b) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export function resetFields(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

export function closeModal(btn) {
  const overlay = btn.closest('.modal-overlay');
  overlay.classList.remove('active');
  setTimeout(() => overlay.remove(), 300);
}

// ===== 스켈레톤 로딩 헬퍼 =====
export function skeletonCards(count = 3) {
  return Array.from({ length: count }, () =>
    '<div class="skeleton skeleton-card"></div>'
  ).join('');
}

export function skeletonLines(count = 3) {
  return Array.from({ length: count }, () =>
    '<div class="skeleton skeleton-line"></div>'
  ).join('');
}

export function skeletonRows(count = 3) {
  return Array.from({ length: count }, () =>
    `<div class="skeleton-row">
      <div class="skeleton skeleton-circle"></div>
      <div class="skeleton skeleton-line"></div>
    </div>`
  ).join('');
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== 이미지 리사이징 (업로드 전) =====
export function resizeImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    // 이미지가 아니면 원본 반환
    if (!file.type.startsWith('image/')) { resolve(file); return; }
    // 1MB 이하면 원본 반환
    if (file.size <= 1024 * 1024) { resolve(file); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 이미 충분히 작으면 원본
        if (img.width <= maxWidth) { resolve(file); return; }

        const ratio = maxWidth / img.width;
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          const resized = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
          resolve(resized);
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ===== 입력값 길이 검증 =====
export function validateMaxLength(str, max = 500) {
  return str && str.length <= max;
}

// 폼 제출 rate limiting (같은 키로 N초 내 재제출 방지)
const _submitTimestamps = {};
export function canSubmit(formKey, cooldownMs = 10000) {
  const now = Date.now();
  if (_submitTimestamps[formKey] && now - _submitTimestamps[formKey] < cooldownMs) {
    return false;
  }
  _submitTimestamps[formKey] = now;
  return true;
}

// 동시 수정 감지용 타임스탬프 비교
export function checkConcurrentEdit(savedAt, currentAt) {
  if (!savedAt || !currentAt) return false;  // 타임스탬프 없으면 충돌 체크 안 함
  return savedAt.seconds !== currentAt.seconds;  // 다르면 충돌
}

// 이벤트 위임 등록
import { on } from './events.js';
on('closeModal', (e, el) => closeModal(el));
