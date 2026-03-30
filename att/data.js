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
  getAllStudentsWithContacts as fsGetAllStudentsWithContacts,
  subscribeStudents as fsSubscribeStudents,
  createStudent as fsCreateStudent,
  updateStudent as fsUpdateStudent,
  deleteStudent as fsDeleteStudent
} from '../firebase/services/studentService.js';

// ATT_PASSWORD 제거됨 — Firestore publicConfig/attLock 해시로 대체 (settingsService.js 참조)
// localStorage 키는 캐시 목적으로만 유지 (인증 우회 수단 아님)
export const STUDENTS_KEY = 'att_students';
// [보안] UTC 기반 → 로컬 시간대 기반으로 변경
const _now = new Date();
const _todayStr = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;
export const TODAY_KEY = `att_${_todayStr}`;

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
// 익명 사용자(출결 태블릿)는 students 읽기 권한 없음 → 승인된 사용자만 구독
function ensureStudentsSubscription() {
  if (studentsSubscribed) return;
  studentsSubscribed = true;
  try {
    fsSubscribeStudents(
      (students) => { cachedStudents = students; },
      (err) => { console.warn('[att/data] 학생 구독 권한 없음 (익명 사용자 정상):', err.code); }
    );
  } catch (e) {
    console.error('[att/data] 학생 구독 실패:', e);
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
  // 캐시가 있으면 캐시 사용 (실시간 구독으로 최신 상태)
  if (cachedStudents !== null) return [...cachedStudents];
  // 캐시 없으면 Firestore 직접 조회 (localStorage 폴백 없음)
  const students = await fsGetAllStudents();
  cachedStudents = students;
  return [...students];
}

// 동기 버전 — 캐시만 사용 (캐시 없으면 빈 배열)
export function getStudentsSync() {
  return cachedStudents !== null ? [...cachedStudents] : [];
}

// saveStudents는 개별 CRUD(useManage)로 대체됨 — 더 이상 사용하지 않음
// localStorage에는 학생 데이터를 저장하지 않음
export async function saveStudents(_list) {
  console.warn('[att/data] saveStudents는 deprecated. useManage의 개별 CRUD를 사용하세요.');
}

// ===== 출결 기록 조회/저장 =====

export async function getTodayRecords() {
  try {
    return await fsGetTodayRecords();
  } catch (e) {
    // 읽기 실패: 빈 객체 반환 (조용한 폴백은 보안상 허용, 단순 표시 문제)
    console.error('[att/data] getTodayRecords Firestore 실패:', e);
    return {};
  }
}

export async function saveTodayRecords(records) {
  // 쓰기 실패: localStorage 폴백 없이 예외 전파
  // → 출결 기록이 localStorage에 저장되면 Firestore 규칙 우회 가능성 있음
  await fsSaveTodayRecords(records);
}

// ===== Firestore 서비스 re-export =====
export {
  fsDeleteStudentRecord as deleteStudentRecord,
  fsResetTodayRecords as resetTodayRecords,
  fsSubscribeTodayRecords as subscribeTodayRecords,
  fsGetAllStudents as getAllStudents,
  fsGetAllStudentsWithContacts as getAllStudentsWithContacts,
  fsSubscribeStudents as subscribeStudents,
  fsCreateStudent as createStudent,
  fsUpdateStudent as updateStudent,
  fsDeleteStudent as deleteStudentFs
};
