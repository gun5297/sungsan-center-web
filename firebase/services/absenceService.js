// ===== 결석/조퇴 Firestore 서비스 =====
// 전환 대상: js/hooks/useAbsence.js
//
// 현재: absenceRecords 배열 (JS 변수, 휘발성)
// 전환: Firestore absences 컬렉션
//
// 제출 시 inboxService.addInboxItem()도 함께 호출

import { absencesCol } from '../collections.js';
import {
  getDocs, addDoc, onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// 실시간 구독
export function subscribeAbsences(callback) {
  const q = query(absencesCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(records);
  });
}

// 조회
export async function getAbsences() {
  const q = query(absencesCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 제출
export async function createAbsence({ type, name, birth, school, guardian, reason, from, to, phone, date }) {
  return await addDoc(absencesCol, {
    type, name, birth, school, guardian, reason, from, to, phone, date,
    createdAt: serverTimestamp()
  });
}
