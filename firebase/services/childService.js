// ===== 아동 통합 명단 Firestore 서비스 =====
// children/{childId} = { name, birth, gender, school, guardianName, guardianPhone, guardianRelation, allergy, note, enrollDate, status, createdAt }
// students 컬렉션과 별도 — students는 출결 시스템용

import { db } from '../config.js';
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, deleteField
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const childrenCol = collection(db, 'children');

// 실시간 구독 (soft delete된 항목 제외)
export function subscribeChildren(callback) {
  const q = query(childrenCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const children = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(c => !c.deletedAt);
    callback(children);
  });
}

// 아동 추가
export async function createChild(data) {
  return await addDoc(childrenCol, {
    ...data,
    status: data.status || 'active',
    createdAt: serverTimestamp()
  });
}

// 아동 수정
export async function updateChild(docId, data) {
  const ref = doc(db, 'children', docId);
  return await updateDoc(ref, data);
}

// 아동 삭제 (soft delete)
export async function deleteChild(docId) {
  const ref = doc(db, 'children', docId);
  return await updateDoc(ref, { deletedAt: serverTimestamp() });
}

// 복구
export async function restoreChild(docId) {
  return await updateDoc(doc(db, 'children', docId), { deletedAt: deleteField() });
}

// 영구 삭제
export async function permanentDeleteChild(docId) {
  return await deleteDoc(doc(db, 'children', docId));
}

// 삭제된 아동 조회
export async function getDeletedChildren() {
  const q = query(childrenCol, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.deletedAt);
}
