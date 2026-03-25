// ===== 출결 시스템 데이터 & localStorage 헬퍼 =====

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

export function getStudents() {
  const saved = localStorage.getItem(STUDENTS_KEY);
  if (!saved) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(DEFAULT_STUDENTS));
    return [...DEFAULT_STUDENTS];
  }
  return JSON.parse(saved);
}

export function saveStudents(list) {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
}

export function getTodayRecords() {
  return JSON.parse(localStorage.getItem(TODAY_KEY) || '{}');
}

export function saveTodayRecords(records) {
  localStorage.setItem(TODAY_KEY, JSON.stringify(records));
}
