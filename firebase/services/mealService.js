// ===== 식단표 Firestore 서비스 =====
// 전환 대상: js/hooks/useMeal.js
//
// 현재: sampleMeals 객체 (정적 데모)
// 전환: Firestore meals 컬렉션 (주별 문서)
//
// 문서 구조: { weekKey: "2026-W13", lunch: [...], snack: [...] }
// weekKey = ISO 주차 또는 "YYYY-MM-DD" (월요일 기준)

import { mealsCol } from '../collections.js';
import {
  doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

// 특정 주 식단 조회
export async function getMealByWeek(weekKey) {
  const ref = doc(db, 'meals', weekKey);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// 특정 주 식단 저장/수정 (관리자)
export async function saveMeal(weekKey, { lunch, snack }) {
  const ref = doc(db, 'meals', weekKey);
  return await setDoc(ref, { weekKey, lunch, snack }, { merge: true });
}

// 실시간 구독 (특정 주)
export function subscribeMeal(weekKey, callback) {
  const ref = doc(db, 'meals', weekKey);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}
