// ===== 아동-보호자 연결 Firestore 서비스 =====
// childLinks/{linkId} = { userId, childId, childName, relation, createdAt }

import { db } from '../config.js';
import {
  collection, doc, addDoc, deleteDoc, getDocs, onSnapshot, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const childLinksCol = collection(db, 'childLinks');

// 내 아이 목록 조회 (승인된 것만)
export async function getMyChildren(userId) {
  const q = query(childLinksCol, where('userId', '==', userId), where('approved', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 내 연결 전체 조회 (승인 대기 포함 — 마이페이지 표시용)
export async function getMyLinks(userId) {
  const q = query(childLinksCol, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 아이 연결 신청 (관리자 승인 필요)
export async function linkChild(userId, childId, childName, relation) {
  return await addDoc(childLinksCol, {
    userId,
    childId,
    childName,
    relation,
    approved: false,
    createdAt: serverTimestamp()
  });
}

// 연결 승인 (관리자)
export async function approveLinkChild(linkId) {
  const ref = doc(db, 'childLinks', linkId);
  const { updateDoc } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
  return await updateDoc(ref, { approved: true });
}

// 연결 해제/거절
export async function unlinkChild(linkId) {
  const ref = doc(db, 'childLinks', linkId);
  return await deleteDoc(ref);
}

// 승인 대기 중인 연결 목록 (관리자용)
export async function getPendingLinks() {
  const q = query(childLinksCol, where('approved', '==', false));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 내 아이 실시간 구독
export function subscribeMyChildren(userId, callback) {
  const q = query(childLinksCol, where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const links = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(links);
  });
}
