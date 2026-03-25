// ===== 공지 읽음 확인 서비스 =====
import { db } from '../config.js';
import {
  doc, setDoc, getDocs, collection, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// 읽음 표시 (중복 호출 시 덮어쓰기)
export async function markAsRead(noticeId, userId, userName) {
  const docId = `${noticeId}_${userId}`;
  const ref = doc(db, 'noticeReads', docId);
  await setDoc(ref, { noticeId, userId, userName, readAt: serverTimestamp() }, { merge: true });
}

// 특정 공지의 읽은 사람 수
export async function getReadCount(noticeId) {
  const q = query(collection(db, 'noticeReads'), where('noticeId', '==', noticeId));
  const snap = await getDocs(q);
  return snap.size;
}

// 특정 공지를 읽은 사람 목록
export async function getReadUsers(noticeId) {
  const q = query(collection(db, 'noticeReads'), where('noticeId', '==', noticeId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}
