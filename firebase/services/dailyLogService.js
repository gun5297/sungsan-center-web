// ===== 일일 활동 일지 Firestore 서비스 =====
// 컬렉션: dailyLogs
// 문서 ID: YYYY-MM-DD (날짜별 1개)
//
// 문서 구조:
// {
//   date: string,            // YYYY-MM-DD
//   author: string,          // 작성자 이름
//   authorUid: string,       // 작성자 UID
//   weather: string,         // 날씨
//   totalChildren: number,   // 출석 아동 수
//   programs: [              // 프로그램 목록
//     { time: string, name: string, participants: number, note: string }
//   ],
//   specialNotes: string,    // 특이사항
//   createdAt: timestamp
// }

import { db } from '../config.js';
import {
  doc, getDoc, setDoc, getDocs, onSnapshot, query, orderBy, limit as fbLimit, collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const dailyLogsCol = collection(db, 'dailyLogs');

// 특정 날짜 일지 조회
export async function getDailyLog(dateKey) {
  const ref = doc(db, 'dailyLogs', dateKey);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// 일지 저장 (upsert — 날짜별 1개)
export async function saveDailyLog(dateKey, data) {
  const ref = doc(db, 'dailyLogs', dateKey);
  return await setDoc(ref, {
    ...data,
    date: dateKey,
    createdAt: serverTimestamp()
  });
}

// 실시간 구독 (최신순)
export function subscribeDailyLogs(callback) {
  const q = query(dailyLogsCol, orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(logs);
  });
}

// 최근 N개 조회
export async function getRecentLogs(count = 7) {
  const q = query(dailyLogsCol, orderBy('date', 'desc'), fbLimit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
