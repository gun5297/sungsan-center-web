// ===== 출결 기록 Firestore 서비스 =====
// 전환 대상: att/data.js (localStorage → Firestore)
//
// 현재: localStorage att_YYYY-MM-DD
// 전환: Firestore attendance 컬렉션 (일별 문서)
//
// 문서 ID = "YYYY-MM-DD"
// 문서 구조: { records: { "0001": { inTime, inTs, outTime, outTs }, ... } }
//
// 메인 페이지 useAttendance.js도 이 서비스로 전환
// (현재 localStorage에서 직접 읽는 중)

import { db } from '../config.js';
import {
  doc, getDoc, setDoc, deleteDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

// 오늘 출결 조회
export async function getTodayRecords() {
  const ref = doc(db, 'attendance', todayKey());
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().records : {};
}

// 오늘 출결 저장 (전체 덮어쓰기)
export async function saveTodayRecords(records) {
  const ref = doc(db, 'attendance', todayKey());
  return await setDoc(ref, { records, date: todayKey() });
}

// 특정 학생 출결 업데이트 (부분 업데이트)
export async function updateStudentRecord(studentId, record) {
  const ref = doc(db, 'attendance', todayKey());
  const snap = await getDoc(ref);
  const records = snap.exists() ? snap.data().records : {};
  records[studentId] = record;
  return await setDoc(ref, { records, date: todayKey() });
}

// 특정 학생 출결 삭제 (취소)
export async function deleteStudentRecord(studentId) {
  const ref = doc(db, 'attendance', todayKey());
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const records = snap.data().records;
  delete records[studentId];
  return await setDoc(ref, { records, date: todayKey() });
}

// 오늘 기록 초기화
export async function resetTodayRecords() {
  const ref = doc(db, 'attendance', todayKey());
  return await deleteDoc(ref);
}

// 실시간 구독 (메인 페이지 30초 갱신 대체)
export function subscribeTodayRecords(callback) {
  const ref = doc(db, 'attendance', todayKey());
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data().records : {});
  });
}

// 특정 날짜 조회 (히스토리)
export async function getRecordsByDate(dateKey) {
  const ref = doc(db, 'attendance', dateKey);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().records : {};
}
