// ===== 공유 상태 관리 (React의 Context/Store 개념) =====
// 여러 훅에서 공유하는 상태를 구독 패턴으로 관리

let isAdmin = false;
let currentUser = null;
let userRole = null; // 'admin' | 'general' | (legacy: 'director' | 'teacher' | 'social_worker') | null
const listeners = [];

export function getIsAdmin() {
  return isAdmin;
}

export function setIsAdmin(value) {
  isAdmin = value;
  listeners.forEach(fn => fn(isAdmin));
}

export function onAdminChange(fn) {
  listeners.push(fn);
}

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
}

export function getUserRole() {
  return userRole;
}

export function setUserRole(role) {
  userRole = role;
}

// 관리자 여부 (admin 또는 레거시 director/teacher/social_worker)
export function isDirector() {
  return userRole === 'admin' || userRole === 'director' || userRole === 'teacher' || userRole === 'social_worker';
}

// 관리 권한 (admin 역할 전체 — 레거시 호환 포함)
export function canManage() {
  return userRole === 'admin' || userRole === 'director' || userRole === 'teacher' || userRole === 'social_worker';
}

// 로그인 여부 (역할이 설정되어 있으면 로그인 상태)
export function isLoggedIn() {
  return userRole !== null;
}
