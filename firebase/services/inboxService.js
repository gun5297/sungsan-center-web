// ===== 서류함 Firestore 서비스 =====
// 전환 대상: js/hooks/useInbox.js
//
// 현재: inboxItems 배열 (JS 변수, 휘발성)
// 전환: Firestore inbox 컬렉션
//
// 서류함은 결석/투약/등록/상담 제출 시 자동 추가됨
// 각 서비스(absenceService, medicationService 등)에서 제출 시 이 서비스도 호출
//
// type: 'absence' | 'medication' | 'register' | 'consult'

import { inboxCol } from '../collections.js';
import {
  doc, getDocs, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

// 실시간 구독
export function subscribeInbox(callback) {
  const q = query(inboxCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
}

// 전체 조회
export async function getInboxItems() {
  const q = query(inboxCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 서류 추가 (폼 제출 시 호출)
export async function addInboxItem({ type, name, summary, date, data, consents }) {
  return await addDoc(inboxCol, {
    type, name, summary, date, data, consents,
    createdAt: serverTimestamp()
  });
}

// 서류 삭제
export async function deleteInboxItem(id) {
  const ref = doc(db, 'inbox', id);
  return await deleteDoc(ref);
}
