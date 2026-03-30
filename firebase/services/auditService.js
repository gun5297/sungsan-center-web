// ===== 감사 로그 서비스 =====
// 데이터 변경 시 자동 기록 (불변 — 수정/삭제 불가)
// window.__currentUser 의존성 제거 → auth.currentUser 직접 사용

import { db, auth } from '../config.js';
import {
  collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const logsCol = collection(db, 'auditLogs');

// 로그 기록
// action: 'create' | 'update' | 'delete' | 'approve' | 'reject'
// target: 'notice' | 'gallery' | 'child' | 'medication' | 'user' | 'setting'
export async function logAction(action, target, targetId, summary) {
  try {
    // window.__currentUser 대신 Firebase Auth에서 직접 현재 사용자 가져옴
    const firebaseUser = auth.currentUser;
    const uid  = firebaseUser ? firebaseUser.uid : '';

    // [보안] Firestore Rules 필드명에 맞춤: target→resource, targetId→resourceId, summary→message, timestamp→createdAt
    await addDoc(logsCol, {
      action,
      resource: target,
      resourceId: targetId || '',
      message: summary,
      userId: uid,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    // 로그 실패는 경고만 — 주 작업을 막지 않음
    console.warn('[auditService] 감사 로그 기록 실패:', e);
  }
}

// 최근 로그 조회 (관리자 전용 — Firestore rules에서 강제)
export async function getRecentLogs(count = 20) {
  const q = query(logsCol, orderBy('timestamp', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
