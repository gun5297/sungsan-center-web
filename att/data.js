// ===== 출결 시스템 데이터 — Firestore 연동 래퍼 =====
// localStorage → Firestore 전환
// 기존 인터페이스를 async로 변환하여 유지

import {
  getTodayRecords as fsGetTodayRecords,
  saveTodayRecords as fsSaveTodayRecords,
  deleteStudentRecord as fsDeleteStudentRecord,
  resetTodayRecords as fsResetTodayRecords,
  subscribeTodayRecords as fsSubscribeTodayRecords
} from '../firebase/services/attendanceService.js';

import {
  getAllStudents as fsGetAllStudents,
  subscribeStudents as fsSubscribeStudents,
  createStudent as fsCreateStudent,
  updateStudent as fsUpdateStudent,
  deleteStudent as fsDeleteStudent
} from '../firebase/services/studentService.js';

export const ATT_PASSWORD = '1234';
export const STUDENTS_KEY = 'att_students';
export const TODAY_KEY = `att_${new Date().toISOString().split('T')[0]}`;

export const DEFAULT_STUDENTS = [
  { id: '0001', name: '홍길동', school: '증산초 1학년', parent: '010-1234-5678' },
  { id: '0002', name: '홍길동', school: '증산초 2학년', parent: '010-2345-6789' },
  { id: '0003', name: '홍길동', school: '수색초 1학년', parent: '010-3456-7890' },
  { id: '0004', name: '홍길동', school: '수색초 2학년', parent: '010-4567-8901' },
  { id: '0005', name: '홍길동', school: '증산초 3학년', parent: '010-5678-9012' },
  { id: '0006', name: '홍길동', school: '증산중 1학년', parent: '010-6789-0123' },
  { id: '0007', name: '홍길동', school: '증산초 1학년', parent: '010-7890-1234' },
  { id: '0008', name: '홍길동', school: '수색초 3학년', parent: '010-8901-2345' },
  { id: '0009', name: '홍길동', school: '증산중 2학년', parent: '010-9012-3456' },
  { id: '0010', name: '홍길동', school: '증산초 2학년', parent: '010-0123-4567' },
];

// ===== 학생 캐시 (실시간 구독으로 자동 갱신) =====
let cachedStudents = null;
let studentsSubscribed = false;

// Firestore 실시간 구독 시작 — 학생 데이터를 캐시에 유지
function ensureStudentsSubscription() {
  if (studentsSubscribed) return;
  studentsSubscribed = true;
  try {
    fsSubscribeStudents((students) => {
      cachedStudents = students;
    });
  } catch (e) {
    console.warn('[att/data] 학생 구독 실패, localStorage 폴백:', e);
  }
}

// 초기 마이그레이션: Firestore에 학생 데이터가 없으면 DEFAULT_STUDENTS 업로드
async function migrateStudentsIfNeeded() {
  try {
    const existing = await fsGetAllStudents();
    if (existing.length === 0) {
      console.log('[att/data] Firestore에 학생 데이터 없음 — DEFAULT_STUDENTS 마이그레이션 시작');
      // localStorage에 저장된 데이터가 있으면 그것을 우선 사용
      const localData = localStorage.getItem(STUDENTS_KEY);
      const studentsToMigrate = localData ? JSON.parse(localData) : DEFAULT_STUDENTS;
      for (const s of studentsToMigrate) {
        await fsCreateStudent({ id: s.id, name: s.name, school: s.school, parent: s.parent });
      }
      console.log(`[att/data] ${studentsToMigrate.length}명 마이그레이션 완료`);
    }
  } catch (e) {
    console.error('[att/data] 마이그레이션 실패:', e);
  }
}

// ===== 초기화 =====
export async function initData() {
  await migrateStudentsIfNeeded();
  ensureStudentsSubscription();
}

// ===== 학생 조회/저장 =====

// async 버전 — Firestore에서 조회, 실패 시 localStorage 폴백
export async function getStudents() {
  try {
    // 캐시가 있으면 캐시 사용 (실시간 구독으로 최신 상태)
    if (cachedStudents !== null) return [...cachedStudents];
    const students = await fsGetAllStudents();
    cachedStudents = students;
    return [...students];
  } catch (e) {
    console.warn('[att/data] getStudents Firestore 실패, localStorage 폴백:', e);
    return getStudentsLocal();
  }
}

// 동기 버전 — 캐시 또는 localStorage (렌더링 시 폴백용)
export function getStudentsSync() {
  if (cachedStudents !== null) return [...cachedStudents];
  return getStudentsLocal();
}

function getStudentsLocal() {
  const saved = localStorage.getItem(STUDENTS_KEY);
  if (!saved) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(DEFAULT_STUDENTS));
    return [...DEFAULT_STUDENTS];
  }
  return JSON.parse(saved);
}

// Firestore에 학생 전체 저장 (useManage의 개별 CRUD로 대체됨)
export async function saveStudents(list) {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
    // 개별 CRUD는 useManage에서 직접 호출
  } catch (e) {
    console.warn('[att/data] saveStudents 실패:', e);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
  }
}

// ===== 출결 기록 조회/저장 =====

export async function getTodayRecords() {
  try {
    return await fsGetTodayRecords();
  } catch (e) {
    console.warn('[att/data] getTodayRecords Firestore 실패, localStorage 폴백:', e);
    return JSON.parse(localStorage.getItem(TODAY_KEY) || '{}');
  }
}

export async function saveTodayRecords(records) {
  try {
    await fsSaveTodayRecords(records);
  } catch (e) {
    console.warn('[att/data] saveTodayRecords Firestore 실패, localStorage 폴백:', e);
    localStorage.setItem(TODAY_KEY, JSON.stringify(records));
  }
}

// ===== Firestore 서비스 re-export =====
export {
  fsDeleteStudentRecord as deleteStudentRecord,
  fsResetTodayRecords as resetTodayRecords,
  fsSubscribeTodayRecords as subscribeTodayRecords,
  fsGetAllStudents as getAllStudents,
  fsSubscribeStudents as subscribeStudents,
  fsCreateStudent as createStudent,
  fsUpdateStudent as updateStudent,
  fsDeleteStudent as deleteStudentFs
};
