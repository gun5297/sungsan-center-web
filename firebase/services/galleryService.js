// ===== 갤러리 Firestore 서비스 =====
// 전환 대상: js/hooks/useGallery.js
//
// 현재: galleryItems 배열 (JS 변수, 휘발성)
// 전환: Firestore gallery 컬렉션 + Firebase Storage (이미지)
//
// 이미지 업로드:
//   현재: FileReader로 base64 → 메모리에만 보관
//   전환: Firebase Storage에 업로드 → photoUrl 필드에 다운로드 URL 저장

import { galleryCol } from '../collections.js';
import { storage } from '../config.js';
import {
  doc, getDocs, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import { db } from '../config.js';

// 실시간 구독
export function subscribeGallery(callback) {
  const q = query(galleryCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
}

// 조회
export async function getGalleryItems() {
  const q = query(galleryCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 이미지 업로드 → Storage URL 반환
export async function uploadPhoto(file) {
  const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// 생성 (이미지 URL 포함)
export async function createGalleryItem({ title, category, date, photoUrl }) {
  return await addDoc(galleryCol, {
    title, category, date, photoUrl,
    createdAt: serverTimestamp()
  });
}

// 삭제 (Storage 이미지도 함께 삭제)
export async function deleteGalleryItem(id, photoUrl) {
  const docRef = doc(db, 'gallery', id);
  await deleteDoc(docRef);

  if (photoUrl) {
    try {
      const storageRef = ref(storage, photoUrl);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('Storage 이미지 삭제 실패:', e);
    }
  }
}
