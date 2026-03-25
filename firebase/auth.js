// ===== Firebase Auth 래퍼 =====
// 현재: ADMIN_PASSWORD 하드코딩 → Firebase Auth로 전환
//
// Firestore 보안 규칙과 연동:
// - 로그인된 사용자 = 관리자
// - 비로그인 = 학부모 (읽기 전용)
//
// 전환 시 변경할 파일:
// - js/hooks/useAdmin.js → doAdminLogin()에서 이 모듈 호출
// - att/hooks/useLock.js → pressLockConfirm()에서 이 모듈 호출
// - att/hooks/useManage.js → unlockManage()에서 이 모듈 호출

import { auth } from './config.js';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
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

// 익명 로그인 (출결 태블릿 — PIN 인증 후 호출)
// 이미 익명 세션이 있으면 기존 세션 유지
export async function loginAnonymously() {
  if (auth.currentUser) return { success: true };
  try {
    await signInAnonymously(auth);
    return { success: true };
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

// ===== 세션 타임아웃 (30분 비활동 시 자동 로그아웃) =====
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분
let sessionTimer = null;

function resetSessionTimer() {
  if (sessionTimer) clearTimeout(sessionTimer);
  if (!auth.currentUser) return;
  sessionTimer = setTimeout(async () => {
    if (auth.currentUser) {
      await signOut(auth);
      // 메인 페이지면 리로드, 아니면 로그인으로 이동
      if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        window.location.reload();
      } else {
        window.location.href = 'login.html';
      }
    }
  }, SESSION_TIMEOUT);
}

export function initSessionTimeout() {
  const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
  events.forEach(event => {
    document.addEventListener(event, resetSessionTimer, { passive: true });
  });
  // 로그인 상태 변경 시 타이머 시작/정지
  onAuthStateChanged(auth, (user) => {
    if (user) {
      resetSessionTimer();
    } else {
      if (sessionTimer) { clearTimeout(sessionTimer); sessionTimer = null; }
    }
  });
}
