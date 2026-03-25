// ===== 공유 상태 관리 (React의 Context/Store 개념) =====
// 여러 훅에서 공유하는 상태를 구독 패턴으로 관리

let isAdmin = false;
let currentUser = null;
let userRole = null; // 'director' | 'teacher' | 'social_worker' | null
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

// 센터장 여부
export function isDirector() {
  return userRole === 'director';
}

// 선생님 이상 (선생님 + 센터장) — 게시판 CRUD 가능
export function canManage() {
  return userRole === 'director' || userRole === 'teacher';
}
