// ===== useDataExport: 관리자 데이터 CSV 내보내기 =====
import { getIsAdmin } from '../state.js';

// CSV 생성 유틸리티
function toCSV(headers, rows) {
  const bom = '\uFEFF';  // 엑셀 한글 깨짐 방지
  const headerLine = headers.join(',');
  const dataLines = rows.map(row =>
    row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
  );
  return bom + [headerLine, ...dataLines].join('\n');
}

function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 아동 목록 내보내기
export async function exportChildren() {
  if (!getIsAdmin()) return;
  const { getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
  const { collection } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
  const { db } = await import('../../firebase/config.js');

  const snap = await getDocs(query(collection(db, 'children'), orderBy('name')));
  const children = snap.docs.map(d => d.data());

  const headers = ['이름', '생년월일', '성별', '학교/학년', '보호자', '보호자연락처', '관계', '알레르기', '특이사항', '입소일', '상태'];
  const rows = children.map(c => [
    c.name, c.birth, c.gender, c.school, c.guardianName, c.guardianPhone, c.guardianRelation, c.allergy, c.note, c.enrollDate, c.status
  ]);
  downloadCSV(`아동목록_${new Date().toISOString().split('T')[0]}.csv`, toCSV(headers, rows));
  showToast('아동 목록이 다운로드되었습니다.', 'success');
}

// 공지사항 내보내기
export async function exportNotices() {
  if (!getIsAdmin()) return;
  const { getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
  const { collection } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
  const { db } = await import('../../firebase/config.js');

  const snap = await getDocs(query(collection(db, 'notices'), orderBy('createdAt', 'desc')));
  const notices = snap.docs.map(d => d.data());

  const headers = ['제목', '내용', '분류', '날짜', '첨부파일'];
  const rows = notices.map(n => [n.title, n.content, n.category, n.date, n.file || '']);
  downloadCSV(`공지사항_${new Date().toISOString().split('T')[0]}.csv`, toCSV(headers, rows));
  showToast('공지사항이 다운로드되었습니다.', 'success');
}

// 투약 기록 내보내기
export async function exportMedications() {
  if (!getIsAdmin()) return;
  const { getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
  const { collection } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
  const { db } = await import('../../firebase/config.js');

  const snap = await getDocs(query(collection(db, 'medications'), orderBy('createdAt', 'desc')));
  const meds = snap.docs.map(d => d.data());

  const headers = ['아동명', '약이름', '용량', '시간', '증상', '병원', '시작일', '종료일', '보관', '완료여부'];
  const rows = meds.map(m => [m.name, m.drug, m.dose, m.time, m.symptom, m.hospital, m.from, m.to, m.storage, m.completed ? '완료' : '진행중']);
  downloadCSV(`투약기록_${new Date().toISOString().split('T')[0]}.csv`, toCSV(headers, rows));
  showToast('투약 기록이 다운로드되었습니다.', 'success');
}

// window 노출
window.exportChildren = exportChildren;
window.exportNotices = exportNotices;
window.exportMedications = exportMedications;
