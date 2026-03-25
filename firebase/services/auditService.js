// ===== 감사 로그 서비스 =====
// 데이터 변경 시 자동 기록 (불변 — 수정/삭제 불가)

import { db } from '../config.js';
import {
  collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const logsCol = collection(db, 'auditLogs');

// 로그 기록
export async function logAction(action, target, targetId, summary) {
  try {
    // state.js 순환 의존 방지 — 직접 import하지 않고 window에서 가져옴
    const user = window.__currentUser || null;
    await addDoc(logsCol, {
      action,       // 'create', 'update', 'delete', 'approve', 'reject'
      target,       // 'notice', 'gallery', 'child', 'medication', 'user', 'setting'
      targetId: targetId || '',
      summary,
      userId: user ? user.uid : '',
      userName: user ? user.name : '시스템',
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.warn('감사 로그 기록 실패:', e);
  }
}

// 최근 로그 조회
export async function getRecentLogs(count = 20) {
  const q = query(logsCol, orderBy('timestamp', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
