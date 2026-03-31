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
import { makeSoftDelete } from './softDelete.js';

// 실시간 구독 (soft delete된 항목 제외)
export function subscribeAbsences(callback) {
  const q = query(absencesCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(r => !r.deletedAt);
    callback(records);
  }, (error) => {
    console.error('결석 구독 오류:', error);
  });
}

// 조회
export async function getAbsences() {
  const q = query(absencesCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

const { softDelete: deleteAbsence, restore: restoreAbsence, permanentDelete: permanentDeleteAbsence, getDeleted: getDeletedAbsences } = makeSoftDelete('absences', absencesCol);
export { deleteAbsence, restoreAbsence, permanentDeleteAbsence, getDeletedAbsences };

// 제출
export async function createAbsence({ type, name, birth, school, guardian, reason, from, to, phone, date }) {
  return await addDoc(absencesCol, {
    type, name, birth: birth || '', school: school || '', guardian: guardian || '', reason, from, to: to || from, phone: phone || '', date,
    createdAt: serverTimestamp()
  });
}
