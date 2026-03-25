// ===== 인증 데이터 모듈 (더미 유저 + localStorage 헬퍼) =====
// Firebase 전환 시 이 파일의 함수들을 Firestore/Auth API로 교체

export const AUTH_KEYS = {
  SESSION: 'ssc_session',
  USERS: 'ssc_users',
};

// 더미 유저 (Firebase Auth + Firestore 문서 구조 대응)
const DEFAULT_USERS = [
  {
    uid: 'director_001',
    email: 'director@sungsan.kr',
    password: '1234',
    name: '박센터장',
    role: 'director',
    phone: '010-0000-1111',
    position: '관리자',
    createdAt: '2026-01-01',
    approved: true,
  },
  {
    uid: 'teacher_001',
    email: 'teacher@sungsan.kr',
    password: '1234',
    name: '김선생',
    role: 'teacher',
    phone: '010-1234-5678',
    position: '생활복지사',
    createdAt: '2026-03-01',
    approved: true,
  },
];

// --- localStorage 헬퍼 ---

export function getUsers() {
  const raw = localStorage.getItem(AUTH_KEYS.USERS);
  return raw ? JSON.parse(raw) : null;
}

export function saveUsers(users) {
  localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
}

export function getSession() {
  const raw = localStorage.getItem(AUTH_KEYS.SESSION);
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(user) {
  // password 제외하고 저장
  const { password, ...safeUser } = user;
  localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(safeUser));
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEYS.SESSION);
}

// 첫 로드 시 더미 유저 시드
export function seedUsersIfNeeded() {
  if (!getUsers()) {
    saveUsers(DEFAULT_USERS);
  }
}

// 이메일+비밀번호로 유저 찾기
export function findUserByCredentials(email, password) {
  const users = getUsers() || [];
  return users.find(u => u.email === email && u.password === password) || null;
}

// 이메일 중복 체크
export function isEmailTaken(email) {
  const users = getUsers() || [];
  return users.some(u => u.email === email);
}

// 새 유저 추가
export function addUser(user) {
  const users = getUsers() || [];
  users.push(user);
  saveUsers(users);
}
