// ===== 학생 Firestore 서비스 =====
// 전환 대상: att/data.js (localStorage → Firestore)
//
// 현재: localStorage att_students
// 전환: Firestore students 컬렉션
//
// att/hooks/useManage.js 전환 가이드:
//   getStudents() → await getAllStudents()
//   saveStudents() → await createStudent() / updateStudent()

import { studentsCol } from '../collections.js';
import {
  doc, getDocs, addDoc, setDoc, deleteDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

// 전체 조회
export async function getAllStudents() {
  const q = query(studentsCol, orderBy('id'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
}

// 실시간 구독
export function subscribeStudents(callback) {
  const q = query(studentsCol, orderBy('id'));
  return onSnapshot(q, (snapshot) => {
    const students = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    callback(students);
  });
}

// 생성
export async function createStudent({ id, name, school, parent }) {
  return await addDoc(studentsCol, { id, name, school, parent });
}

// 수정 (Firestore 문서 ID 사용)
export async function updateStudent(docId, data) {
  const ref = doc(db, 'students', docId);
  return await setDoc(ref, data, { merge: true });
}

// 삭제
export async function deleteStudent(docId) {
  const ref = doc(db, 'students', docId);
  return await deleteDoc(ref);
}
