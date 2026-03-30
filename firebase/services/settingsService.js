// ===== 설정 Firestore 서비스 =====
// settings/passwords     → 관리자만 읽기
// publicConfig/attLock   → PIN 해시 (Cloud Functions에서만 검증)
//
// 보안 설계:
//   - PIN pepper는 Cloud Functions 서버에만 존재 (클라이언트 노출 제거)
//   - checkAttendancePassword() → Cloud Function verifyPin 호출
//   - updatePasswords() attendance → Cloud Function changePin 호출

import { db, app } from '../config.js';
import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getFunctions, httpsCallable
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-functions.js";

const passwordsRef = doc(db, 'settings', 'passwords');
const functions = getFunctions(app, 'asia-northeast3');

// 기본 관리자 가입 PIN (출석 PIN은 Cloud Functions에서 관리)
const DEFAULTS = { adminSignup: '1234' };

// 비밀번호 조회 (관리자용 — 출석 PIN 제외)
export async function getPasswords() {
  const snap = await getDoc(passwordsRef);
  if (snap.exists()) return snap.data();
  await setDoc(passwordsRef, DEFAULTS);
  return DEFAULTS;
}

// 비밀번호 변경
export async function updatePasswords(data) {
  // 출석 PIN은 Cloud Function으로 해시 변경 + Firestore에 평문도 저장 (관리자 조회용)
  if (data.attendance) {
    const changePinFn = httpsCallable(functions, 'changePin');
    await changePinFn({ pin: data.attendance });
  }
  // 모든 설정 Firestore에 저장 (관리자만 읽기 가능)
  await setDoc(passwordsRef, data, { merge: true });
}

// ===== 태블릿 잠금 화면 — Cloud Function으로 PIN 검증 =====
export async function checkAttendancePassword(input) {
  try {
    const verifyPinFn = httpsCallable(functions, 'verifyPin');
    const result = await verifyPinFn({ pin: input });
    return result.data.valid === true;
  } catch (e) {
    console.error('[settingsService] PIN 검증 실패:', e);
    throw e;
  }
}
