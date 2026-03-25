// ===== 사용자 Firestore 서비스 =====
// users/{uid} = { email, name, role, approved, phone, createdAt }
// role: 'admin' | 'general' (legacy: 'director' | 'teacher' | 'social_worker' → treated as admin)

import { db } from '../config.js';
import {
  doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// 관리자 역할 판별 (admin + 레거시 역할)
export const ADMIN_ROLES = new Set(['admin', 'director', 'teacher', 'social_worker']);
export function isAdminRole(role) { return ADMIN_ROLES.has(role); }

// 사용자 문서 조회
export async function getUserDoc(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// 사용자 문서 생성 (admin은 자동 승인, general은 관리자 승인 필요)
export async function createUserDoc(uid, { email, name, role, phone }) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    email, name, role, phone,
    approved: isAdminRole(role), // 관리자 역할은 자동 승인
    photoConsent: true, // 사진촬영 동의 (기본값 true)
    createdAt: serverTimestamp()
  });
}

// 사용자 정보 업데이트
export async function updateUserDoc(uid, data) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, data);
}

// 승인 대기 중인 계정 목록 (관리자용)
export async function getPendingUsers() {
  const q = query(collection(db, 'users'), where('approved', '==', false));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 계정 승인
export async function approveUser(uid) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { approved: true });
}

// 계정 거절 (삭제)
export async function rejectUser(uid) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { approved: false, rejected: true });
}

// 관리자가 한 명도 없으면 true (첫 가입자 = 관리자)
export async function hasNoDirector() {
  const q = query(collection(db, 'users'), where('role', 'in', [...ADMIN_ROLES]));
  const snap = await getDocs(q);
  return snap.empty;
}
