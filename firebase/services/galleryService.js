// ===== 갤러리 Firestore 서비스 =====

import { galleryCol } from '../collections.js';
import { storage, db } from '../config.js';
import {
  doc, getDocs, addDoc, deleteDoc, onSnapshot,
  query, orderBy, limit, startAfter, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

const PAGE_SIZE = 12;

// 최신 N개 실시간 구독 (홈 화면용)
export function subscribeGallery(callback, pageSize = PAGE_SIZE) {
  const q = query(galleryCol, orderBy('createdAt', 'desc'), limit(pageSize));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  }, (error) => {
    console.error('갤러리 구독 오류:', error);
  });
}

// 페이지네이션 조회
export async function getGalleryPaged(lastDoc = null) {
  let q = query(galleryCol, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
  if (lastDoc) q = query(galleryCol, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
  const snapshot = await getDocs(q);
  return {
    items: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === PAGE_SIZE
  };
}

// 이미지 업로드 → { url, storagePath } 반환
export async function uploadPhoto(file) {
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `gallery/${Date.now()}_${safeFileName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, storagePath };
}

// 생성
export async function createGalleryItem({ title, category, date, photoUrl, storagePath }) {
  return await addDoc(galleryCol, {
    title, category, date,
    photoUrl: photoUrl || null,
    storagePath: storagePath || null,
    createdAt: serverTimestamp()
  });
}

// 삭제 (Firestore 문서 + Storage 이미지)
export async function deleteGalleryItem(id, storagePath) {
  await deleteDoc(doc(db, 'gallery', id));
  if (storagePath) {
    try {
      await deleteObject(ref(storage, storagePath));
    } catch (e) {
      console.warn('Storage 이미지 삭제 실패:', e);
    }
  }
}
