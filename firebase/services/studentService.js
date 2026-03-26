// ===== 학생 Firestore 서비스 =====
//
// 보안 설계:
//   students       → {id, name, school}  — 익명(출결 태블릿) read 허용
//   studentPhones  → {parent}            — isApproved() 전용 (전화번호 분리)
//
// 출결 태블릿은 id/name/school만 필요, parent는 불필요.
// 관리자(useManage.js)는 getAllStudentsWithContacts()로 전화번호 포함 조회.

import { studentsCol, studentPhonesCol } from '../collections.js';
import {
  doc, getDocs, addDoc, setDoc, deleteDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

// 전체 조회 (id/name/school만 — 출결 태블릿용)
export async function getAllStudents() {
  const q = query(studentsCol, orderBy('id'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
}

// 전화번호 포함 전체 조회 (관리자 전용)
export async function getAllStudentsWithContacts() {
  const [studSnap, phoneSnap] = await Promise.all([
    getDocs(query(studentsCol, orderBy('id'))),
    getDocs(studentPhonesCol),
  ]);
  const phones = {};
  phoneSnap.docs.forEach(d => { phones[d.id] = d.data().parent || ''; });
  return studSnap.docs.map(d => ({
    docId: d.id,
    ...d.data(),
    parent: phones[d.id] || '',
  }));
}

// 실시간 구독 (id/name/school만 — 승인된 사용자 전용)
// onError 핸들러 미제공 시 권한 오류가 unhandled rejection이 되므로 반드시 전달
export function subscribeStudents(callback, onError) {
  const q = query(studentsCol, orderBy('id'));
  return onSnapshot(
    q,
    (snapshot) => {
      const students = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
      callback(students);
    },
    onError || ((err) => console.warn('[studentService] subscribeStudents 오류:', err.code))
  );
}

// 생성 — students(공개)와 studentPhones(비공개) 분리 저장
export async function createStudent({ id, name, school, parent }) {
  const ref = await addDoc(studentsCol, { id, name, school });
  await setDoc(doc(db, 'studentPhones', ref.id), { parent: parent || '' });
  return ref;
}

// 수정
export async function updateStudent(docId, data) {
  const { parent, ...studentData } = data;
  const ref = doc(db, 'students', docId);
  await setDoc(ref, studentData, { merge: true });
  if (parent !== undefined) {
    await setDoc(doc(db, 'studentPhones', docId), { parent: parent || '' }, { merge: true });
  }
}

// 삭제 — 두 컬렉션 모두 삭제
export async function deleteStudent(docId) {
  await deleteDoc(doc(db, 'students', docId));
  try {
    await deleteDoc(doc(db, 'studentPhones', docId));
  } catch {}
}
