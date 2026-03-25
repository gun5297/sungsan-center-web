// ===== 사용자 Firestore 서비스 =====
// users/{uid} = { email, name, role, approved, phone, createdAt }
// role: 'director' | 'teacher' | 'social_worker'

import { db } from '../config.js';
import {
  doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// 사용자 문서 조회
export async function getUserDoc(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// 사용자 문서 생성
export async function createUserDoc(uid, { email, name, role, phone }) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    email, name, role, phone,
    approved: role === 'director', // 센터장은 자동 승인
    createdAt: serverTimestamp()
  });
}

// 사용자 정보 업데이트
export async function updateUserDoc(uid, data) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, data);
}

// 승인 대기 중인 계정 목록 (센터장용)
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

// director가 한 명도 없으면 true (첫 가입자 = 센터장)
export async function hasNoDirector() {
  const q = query(collection(db, 'users'), where('role', '==', 'director'));
  const snap = await getDocs(q);
  return snap.empty;
}
