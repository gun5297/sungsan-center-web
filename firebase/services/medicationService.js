// ===== 투약 Firestore 서비스 =====
// 전환 대상: js/hooks/useMedication.js
//
// 현재: medRecords 배열 (JS 변수, 휘발성)
// 전환: Firestore medications 컬렉션
//
// 제출 시 inboxService.addInboxItem()도 함께 호출

import { medicationsCol } from '../collections.js';
import {
  doc, getDocs, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

// 실시간 구독
export function subscribeMedications(callback) {
  const q = query(medicationsCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(records);
  });
}

// 조회
export async function getMedications() {
  const q = query(medicationsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 제출
export async function createMedication({ name, drug, dose, time, symptom, hospital, from, to, storage, note }) {
  return await addDoc(medicationsCol, {
    name, drug, dose, time, symptom, hospital, from, to, storage, note,
    createdAt: serverTimestamp()
  });
}

// 삭제 (관리자)
export async function deleteMedication(id) {
  const ref = doc(db, 'medications', id);
  return await deleteDoc(ref);
}
