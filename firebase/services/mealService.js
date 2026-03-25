// ===== 식단표 Firestore 서비스 =====
// 전환 대상: js/hooks/useMeal.js
//
// 현재: localStorage mealData (날짜별 키)
// 전환: Firestore meals/data 단일 문서
//
// 문서 구조: meals/data = { "2026-03-25": { lunch, snack }, ... }

import {
  doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

// 전체 식단 데이터 조회
export async function getMealData() {
  const ref = doc(db, 'meals', 'data');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// 전체 식단 데이터 저장 (덮어쓰기)
export async function saveMealData(data) {
  const ref = doc(db, 'meals', 'data');
  return await setDoc(ref, data);
}

// 실시간 구독
export function subscribeMealData(callback) {
  const ref = doc(db, 'meals', 'data');
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}
