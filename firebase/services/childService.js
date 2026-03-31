// ===== 아동 통합 명단 Firestore 서비스 =====
// children/{childId} = { name, birth, gender, school, guardianName, guardianPhone, guardianRelation, allergy, note, enrollDate, status, createdAt }
// students 컬렉션과 별도 — students는 출결 시스템용

import { db } from '../config.js';
import {
  collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { makeSoftDelete } from './softDelete.js';

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

const { softDelete: deleteChild, restore: restoreChild, permanentDelete: permanentDeleteChild, getDeleted: getDeletedChildren } = makeSoftDelete('children', childrenCol);
export { deleteChild, restoreChild, permanentDeleteChild, getDeletedChildren };
