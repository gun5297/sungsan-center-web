// ===== useDataExport: 관리자 데이터 CSV 내보내기 =====
import { getIsAdmin } from '../state.js';
import { escapeCSV } from '../utils.js';

function toCSV(headers, rows) {
  const bom = '\uFEFF';
  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines = rows.map(row => row.map(escapeCSV).join(','));
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
  const { getDocs, query, orderBy, collection } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
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
  const { getDocs, query, orderBy, collection } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
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
  const { getDocs, query, orderBy, collection } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
  const { db } = await import('../../firebase/config.js');

  const snap = await getDocs(query(collection(db, 'medications'), orderBy('createdAt', 'desc')));
  const meds = snap.docs.map(d => d.data());

  const headers = ['아동명', '약이름', '용량', '시간', '증상', '병원', '시작일', '종료일', '보관', '완료여부'];
  const rows = meds.map(m => [m.name, m.drug, m.dose, m.time, m.symptom, m.hospital, m.from, m.to, m.storage, m.completed ? '완료' : '진행중']);
  downloadCSV(`투약기록_${new Date().toISOString().split('T')[0]}.csv`, toCSV(headers, rows));
  showToast('투약 기록이 다운로드되었습니다.', 'success');
}

// 전체 데이터 백업 (Excel — SheetJS 사용)
export async function exportFullBackup() {
  if (!getIsAdmin()) return;
  if (!window.XLSX) {
    showToast('Excel 라이브러리를 불러올 수 없습니다. 페이지를 새로고침해 주세요.', 'error');
    return;
  }

  showToast('전체 백업 준비 중...', 'info', 5000);

  try {
    const { getDocs, query, orderBy, collection } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");
    const { db } = await import('../../firebase/config.js');

    const wb = XLSX.utils.book_new();

    const collections = [
      { name: '아동목록', col: 'children' },
      { name: '공지사항', col: 'notices' },
      { name: '투약기록', col: 'medications' },
      { name: '결석기록', col: 'absences' },
      { name: '서류함', col: 'inbox' },
      { name: '출석기록', col: 'attendance' },
      { name: '활동일지', col: 'dailyLogs' },
    ];

    for (const c of collections) {
      try {
        const snap = await getDocs(query(collection(db, c.col)));
        const data = snap.docs.map(d => {
          const raw = d.data();
          const flat = { id: d.id };
          for (const [k, v] of Object.entries(raw)) {
            if (v && typeof v === 'object' && v.seconds) {
              flat[k] = new Date(v.seconds * 1000).toLocaleString('ko-KR');
            } else if (typeof v === 'object' && v !== null) {
              flat[k] = JSON.stringify(v);
            } else {
              flat[k] = v;
            }
          }
          return flat;
        });
        if (data.length > 0) {
          const ws = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, ws, c.name);
        }
      } catch (e) {
        console.warn(`[backup] ${c.col} 컬렉션 백업 실패:`, e);
      }
    }

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `성산센터_전체백업_${dateStr}.xlsx`);
    showToast('전체 데이터가 다운로드되었습니다.', 'success');
  } catch (e) {
    console.error('전체 백업 실패:', e);
    showToast('백업 중 오류가 발생했습니다.', 'error');
  }
}

// 이벤트 위임 등록
import { on } from '../events.js';
on('exportChildren', () => exportChildren());
on('exportNotices', () => exportNotices());
on('exportMedications', () => exportMedications());
on('exportFullBackup', () => exportFullBackup());
