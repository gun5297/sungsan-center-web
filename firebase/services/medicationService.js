// ===== 투약 Firestore 서비스 =====
// 전환 대상: js/hooks/useMedication.js
//
// 현재: medRecords 배열 (JS 변수, 휘발성)
// 전환: Firestore medications 컬렉션
//
// 제출 시 inboxService.addInboxItem()도 함께 호출

import { medicationsCol } from '../collections.js';
import {
  doc, getDocs, addDoc, deleteDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, deleteField
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

// 실시간 구독 (soft delete된 항목 제외)
export function subscribeMedications(callback) {
  const q = query(medicationsCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(r => !r.deletedAt);
    callback(records);
  }, (error) => {
    console.error('투약 구독 오류:', error);
  });
}

// 조회
export async function getMedications() {
  const q = query(medicationsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 제출
export async function createMedication({ name, birth, drug, dose, time, symptom, hospital, from, to, storage, note }) {
  return await addDoc(medicationsCol, {
    name, birth: birth || '', drug, dose, time, symptom, hospital, from, to, storage, note,
    createdAt: serverTimestamp()
  });
}

// 삭제 (soft delete)
export async function deleteMedication(id) {
  const ref = doc(db, 'medications', id);
  return await updateDoc(ref, { deletedAt: serverTimestamp() });
}

// 복구
export async function restoreMedication(id) {
  return await updateDoc(doc(db, 'medications', id), { deletedAt: deleteField() });
}

// 영구 삭제
export async function permanentDeleteMedication(id) {
  return await deleteDoc(doc(db, 'medications', id));
}

// 삭제된 항목 조회
export async function getDeletedMedications() {
  const q = query(medicationsCol, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.deletedAt);
}

// 투약 완료 체크 (관리자)
export async function completeMedication(id, userName) {
  const ref = doc(db, 'medications', id);
  return await updateDoc(ref, {
    completed: true,
    completedAt: serverTimestamp(),
    completedBy: userName
  });
}
