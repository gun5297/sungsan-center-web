// ===== 설정 Firestore 서비스 =====
// settings/passwords = { adminSignup: '1234', attendance: '1234' }

import { db } from '../config.js';
import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const passwordsRef = doc(db, 'settings', 'passwords');

// 기본 비밀번호
const DEFAULTS = {
  adminSignup: '1234',
  attendance: '1234'
};

// 비밀번호 문서 조회 (없으면 기본값 생성 후 반환)
export async function getPasswords() {
  const snap = await getDoc(passwordsRef);
  if (snap.exists()) return snap.data();
  // 문서가 없으면 기본값으로 생성
  await setDoc(passwordsRef, DEFAULTS);
  return DEFAULTS;
}

// 비밀번호 업데이트
export async function updatePasswords(data) {
  await setDoc(passwordsRef, data, { merge: true });
}

// 관리자 가입 비밀번호 확인
export async function checkAdminPassword(input) {
  const passwords = await getPasswords();
  return input === passwords.adminSignup;
}

// 출석 패드 비밀번호 확인
export async function checkAttendancePassword(input) {
  const passwords = await getPasswords();
  return input === passwords.attendance;
}
