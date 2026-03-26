// ===== 공지사항 Firestore 서비스 =====

import { noticesCol } from '../collections.js';
import {
  doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, limit, startAfter, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import { db, storage } from '../config.js';

const PAGE_SIZE = 10;

// 최신 N개 실시간 구독 (홈 화면용 — 전체 로드 방지)
export function subscribeNotices(callback, pageSize = PAGE_SIZE) {
  const q = query(noticesCol, orderBy('createdAt', 'desc'), limit(pageSize));
  return onSnapshot(q, (snapshot) => {
    const notices = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(notices);
  }, (error) => {
    console.error('공지 구독 오류:', error);
  });
}

// 페이지네이션 조회 — lastDoc: 마지막으로 받은 문서 스냅샷 (없으면 첫 페이지)
export async function getNoticesPaged(lastDoc = null) {
  let q = query(noticesCol, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
  if (lastDoc) q = query(noticesCol, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
  const snapshot = await getDocs(q);
  return {
    items: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === PAGE_SIZE
  };
}

// 첨부파일 업로드 → Storage URL 반환
export async function uploadNoticeFile(file) {
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `notices/${Date.now()}_${safeFileName}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// 생성
export async function createNotice({ title, content, category, date, file, fileUrl }) {
  return await addDoc(noticesCol, {
    title, content, category, date,
    file: file || null,
    fileUrl: fileUrl || null,
    createdAt: serverTimestamp()
  });
}

// 단건 조회
export async function getNotice(id) {
  const snap = await getDoc(doc(db, 'notices', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// 수정
export async function updateNotice(id, data) {
  return await updateDoc(doc(db, 'notices', id), { ...data, updatedAt: serverTimestamp() });
}

// 삭제
export async function deleteNotice(id) {
  return await deleteDoc(doc(db, 'notices', id));
}
