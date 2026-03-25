// ===== 공지사항 Firestore 서비스 =====
// 전환 대상: js/hooks/useNotices.js
//
// 현재: notices 배열 (JS 변수, 휘발성)
// 전환: Firestore notices 컬렉션 + 실시간 구독
//
// useNotices.js 전환 가이드:
//   import { subscribeNotices, createNotice, ... } from '../../firebase/services/noticeService.js';
//   initNotices() 안에서 subscribeNotices(renderNotices) 호출

import { noticesCol } from '../collections.js';
import {
  doc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import { db, storage } from '../config.js';

// 실시간 구독 — callback(notices[])
export function subscribeNotices(callback) {
  const q = query(noticesCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notices);
  }, (error) => {
    console.error('공지 구독 오류:', error);
  });
}

// 전체 조회 (1회)
export async function getNotices() {
  const q = query(noticesCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 첨부파일 업로드 → Storage URL 반환
export async function uploadNoticeFile(file) {
  const storageRef = ref(storage, `notices/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// 생성
export async function createNotice({ title, content, category, date, file, fileUrl }) {
  return await addDoc(noticesCol, {
    title, content, category, date, file, fileUrl: fileUrl || null,
    createdAt: serverTimestamp()
  });
}

// 수정
export async function updateNotice(id, data) {
  const ref = doc(db, 'notices', id);
  return await updateDoc(ref, data);
}

// 삭제
export async function deleteNotice(id) {
  const ref = doc(db, 'notices', id);
  return await deleteDoc(ref);
}
