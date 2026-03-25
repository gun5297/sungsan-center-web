// ===== 공유 상태 관리 (React의 Context/Store 개념) =====
// 여러 훅에서 공유하는 상태를 구독 패턴으로 관리

let isAdmin = false;
let currentUser = null;
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
