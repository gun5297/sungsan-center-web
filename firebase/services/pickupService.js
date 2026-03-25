// ===== 픽업 Firestore 서비스 =====
// 전환 대상: js/hooks/usePickup.js
//
// 현재: pickupStudents 배열 (JS 변수, 휘발성)
// 전환: Firestore pickups 컬렉션

import { pickupsCol } from '../collections.js';
import {
  doc, getDocs, addDoc, setDoc, deleteDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

// 실시간 구독
export function subscribePickups(callback) {
  const q = query(pickupsCol, orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(students);
  });
}

// 조회
export async function getPickups() {
  const q = query(pickupsCol, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 생성
export async function createPickup({ name, school, times }) {
  return await addDoc(pickupsCol, { name, school, times });
}

// 수정
export async function updatePickup(id, data) {
  const ref = doc(db, 'pickups', id);
  return await setDoc(ref, data, { merge: true });
}

// 삭제
export async function deletePickup(id) {
  const ref = doc(db, 'pickups', id);
  return await deleteDoc(ref);
}
