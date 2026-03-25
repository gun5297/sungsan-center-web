// ===== Firebase Auth 래퍼 =====
// 현재: ADMIN_PASSWORD 하드코딩 → Firebase Auth로 전환
//
// Firestore 보안 규칙과 연동:
// - 로그인된 사용자 = 관리자 (선생님)
// - 비로그인 = 학부모 (읽기 전용)
//
// 전환 시 변경할 파일:
// - js/hooks/useAdmin.js → doAdminLogin()에서 이 모듈 호출
// - att/hooks/useLock.js → pressLockConfirm()에서 이 모듈 호출
// - att/hooks/useManage.js → unlockManage()에서 이 모듈 호출

import { auth } from './config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// 로그인
export async function login(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 로그아웃
export async function logout() {
  await signOut(auth);
}

// 인증 상태 구독
// callback(user) — user가 null이면 비로그인
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// 현재 로그인 사용자
export function getCurrentUser() {
  return auth.currentUser;
}
