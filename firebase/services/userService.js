// ===== 사용자 Firestore 서비스 =====
// users/{uid} = { email, name, role, approved, phone, createdAt }
// role: 'admin' | 'general' (legacy: 'director' | 'teacher' | 'social_worker' → treated as admin)

import { db } from '../config.js';
import {
  doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where,
  serverTimestamp, runTransaction
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

// 사용자 문서 생성
// - 일반 가입자는 항상 role='general', approved=false (Firestore rules에서도 강제)
// - 관리자가 없는 경우에만 첫 번째 사용자를 admin으로 설정 (트랜잭션으로 레이스 컨디션 방지)
export async function createUserDoc(uid, { email, name, role, phone }) {
  const userRef = doc(db, 'users', uid);
  const sentinelRef = doc(db, 'publicConfig', 'adminExists');

  // role이 general이면 트랜잭션 없이 바로 생성 (일반 가입)
  if (role !== 'admin') {
    await setDoc(userRef, {
      email, name,
      role: 'general',
      phone: phone || '',
      approved: false,
      photoConsent: true,
      consentAt: serverTimestamp(),
      consentVersion: '2026-03-30',
      createdAt: serverTimestamp()
    });
    return;
  }

  // role이 admin인 경우: 트랜잭션으로 중복 admin 방지
  await runTransaction(db, async (tx) => {
    const sentinelSnap = await tx.get(sentinelRef);
    if (sentinelSnap.exists()) {
      // 이미 관리자가 존재 → general로 강등
      tx.set(userRef, {
        email, name,
        role: 'general',
        phone: phone || '',
        approved: false,
        photoConsent: true,
        createdAt: serverTimestamp()
      });
    } else {
      // 첫 번째 관리자 → admin으로 생성
      tx.set(userRef, {
        email, name,
        role: 'admin',
        phone: phone || '',
        approved: true,
        photoConsent: true,
        createdAt: serverTimestamp()
      });
      tx.set(sentinelRef, { exists: true, createdAt: serverTimestamp() });
    }
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

// 계정 거절
export async function rejectUser(uid) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { approved: false, rejected: true });
}

// 관리자가 한 명도 없으면 true (첫 가입자 = 관리자)
export async function hasNoDirector() {
  // publicConfig/adminExists sentinel 문서로 빠르게 확인
  const sentinelRef = doc(db, 'publicConfig', 'adminExists');
  const snap = await getDoc(sentinelRef);
  return !snap.exists();
}
