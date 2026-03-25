// ===== 시간표 Firestore 서비스 =====
// 전환 대상: js/hooks/useCalendar.js
//
// Firestore 구조:
//   schedules/weekday  = { 1: [...], 2: [...], 3: [...], 4: [...], 5: [...] }
//   schedules/dates    = { "2026-03-25": [...], "2026-03-26": [...], ... }

import {
  doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

// 요일별 기본 시간표 조회
export async function getWeekdaySchedule() {
  const ref = doc(db, 'schedules', 'weekday');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// 요일별 기본 시간표 저장
export async function saveWeekdaySchedule(data) {
  const ref = doc(db, 'schedules', 'weekday');
  return await setDoc(ref, data, { merge: true });
}

// 날짜별 오버라이드 시간표 조회
export async function getDateSchedule() {
  const ref = doc(db, 'schedules', 'dates');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// 날짜별 오버라이드 시간표 저장
export async function saveDateSchedule(data) {
  const ref = doc(db, 'schedules', 'dates');
  return await setDoc(ref, data);
}

// 실시간 구독 (weekday + dates 둘 다 감시)
export function subscribeSchedules(callback) {
  const weekdayRef = doc(db, 'schedules', 'weekday');
  const datesRef = doc(db, 'schedules', 'dates');

  let weekdayData = null;
  let datesData = null;

  const unsub1 = onSnapshot(weekdayRef, (snap) => {
    weekdayData = snap.exists() ? snap.data() : null;
    callback({ weekday: weekdayData, dates: datesData });
  });

  const unsub2 = onSnapshot(datesRef, (snap) => {
    datesData = snap.exists() ? snap.data() : null;
    callback({ weekday: weekdayData, dates: datesData });
  });

  // 두 구독 해제 함수를 합쳐서 반환
  return () => { unsub1(); unsub2(); };
}
