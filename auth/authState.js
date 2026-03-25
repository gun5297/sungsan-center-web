// ===== 인증 상태 관리 (페이지 간 공유) =====
// js/state.js의 옵저버 패턴과 동일 구조
// Firebase 전환 시 onAuthStateChanged로 교체

import { getSession, clearSession } from './authData.js';

let currentUser = null;
const authListeners = [];

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
  authListeners.forEach(fn => fn(currentUser));
}

export function onAuthChange(fn) {
  authListeners.push(fn);
}

export function isTeacher() {
  return currentUser?.role === 'teacher' || currentUser?.role === 'director';
}

export function isDirector() {
  return currentUser?.role === 'director';
}

// localStorage에서 세션 복원
export function restoreSession() {
  const session = getSession();
  if (session) {
    setCurrentUser(session);
  }
  return session;
}

// 로그아웃
export function logout() {
  clearSession();
  setCurrentUser(null);
}
