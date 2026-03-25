// ===== useMealUpload: 엑셀 식단 업로드 =====
// SheetJS(xlsx) CDN을 통해 전역 XLSX 객체 사용
import { getIsAdmin } from '../state.js';
import { getDateKey } from '../utils.js';
import {
  getMealData as firestoreGetMealData,
  saveMealData as firestoreSaveMealData
} from '../../firebase/services/mealService.js';

let parsedMealData = null; // 파싱된 데이터 캐시

// ===== 업로드 모달 =====
export function openMealUploadModal() {
  if (!getIsAdmin()) {
    showToast('관리자만 사용할 수 있습니다.', 'warning');
    return;
  }

  // 기존 모달 제거
  const existing = document.getElementById('mealUploadOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'mealUploadOverlay';
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal" style="max-width:560px;">
      <div class="modal-title">엑셀 식단 업로드</div>
      <button class="modal-close-x" onclick="closeMealUpload()"></button>

      <div style="margin:16px 0;">
        <p style="font-size:13px;color:#888;margin-bottom:12px;">
          급식업체에서 받은 엑셀 파일을 업로드하면 자동으로 식단이 등록됩니다.<br>
          <strong>형식:</strong> 1열-날짜 / 2열-점심 / 3열-간식
        </p>

        <div class="meal-upload-area" id="mealUploadArea">
          <input type="file" id="mealFileInput" accept=".xlsx,.xls,.csv" style="display:none;" onchange="handleMealFile(this)" />
          <div onclick="document.getElementById('mealFileInput').click()" style="cursor:pointer;padding:32px;text-align:center;border:2px dashed #ddd;border-radius:12px;transition:border-color 0.2s;">
            <div style="font-size:32px;margin-bottom:8px;">&#128196;</div>
            <div style="font-size:14px;color:#666;">클릭하여 파일 선택</div>
            <div style="font-size:12px;color:#aaa;margin-top:4px;">.xlsx, .xls, .csv</div>
          </div>
        </div>

        <div id="mealUploadFileName" style="display:none;margin-top:8px;padding:8px 12px;background:#f0f7ff;border-radius:8px;font-size:13px;color:#2196F3;"></div>
      </div>

      <div id="mealUploadPreview" style="display:none;margin-top:12px;">
        <div style="font-weight:600;font-size:14px;margin-bottom:8px;">미리보기</div>
        <div id="mealUploadTable" style="max-height:300px;overflow-y:auto;border:1px solid #eee;border-radius:8px;"></div>
      </div>

      <div style="display:flex;gap:12px;margin-top:20px;">
        <button class="btn-upload" id="mealApplyBtn" style="flex:1;display:none;" onclick="applyMealUpload()">식단 적용</button>
        <button class="btn-secondary-sm" style="flex:1;" onclick="closeMealUpload()">취소</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMealUpload();
  });
}

// ===== 파일 처리 =====
function handleMealFile(input) {
  const file = input.files[0];
  if (!file) return;

  // XLSX 라이브러리 확인
  if (typeof XLSX === 'undefined') {
    showToast('엑셀 라이브러리를 불러오지 못했습니다. 페이지를 새로고침해 주세요.', 'error');
    return;
  }

  // 파일명 표시
  const nameEl = document.getElementById('mealUploadFileName');
  nameEl.textContent = `선택된 파일: ${file.name}`;
  nameEl.style.display = 'block';

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });

      // 첫 번째 시트 사용
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      parsedMealData = parseMealRows(rows);

      if (parsedMealData.length === 0) {
        showToast('식단 데이터를 찾을 수 없습니다. 형식을 확인해 주세요.', 'warning');
        return;
      }

      renderMealPreview(parsedMealData);
      showToast(`${parsedMealData.length}일분 식단이 파싱되었습니다.`, 'success');
    } catch (err) {
      console.error('엑셀 파싱 오류:', err);
      showToast('파일을 읽을 수 없습니다. 형식을 확인해 주세요.', 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

// ===== 엑셀 행 파싱 =====
function parseMealRows(rows) {
  if (rows.length === 0) return [];

  // 헤더 자동 감지: 첫 행이 날짜/점심/간식 등의 헤더인지 확인
  let startRow = 0;
  const firstRow = rows[0].map(c => String(c).trim().toLowerCase());

  // 헤더 키워드 감지
  const headerKeywords = ['날짜', 'date', '일자', '점심', 'lunch', '간식', 'snack', '메뉴'];
  const isHeader = firstRow.some(cell => headerKeywords.some(kw => cell.includes(kw)));
  if (isHeader) startRow = 1;

  // 날짜/점심/간식 열 인덱스 감지
  let dateCol = 0, lunchCol = 1, snackCol = 2;

  if (isHeader) {
    firstRow.forEach((cell, i) => {
      if (cell.includes('날짜') || cell.includes('date') || cell.includes('일자')) dateCol = i;
      if (cell.includes('점심') || cell.includes('lunch')) lunchCol = i;
      if (cell.includes('간식') || cell.includes('snack')) snackCol = i;
    });
  }

  const result = [];

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const rawDate = row[dateCol];
    const lunch = String(row[lunchCol] || '').trim();
    const snack = String(row[snackCol] || '').trim();

    // 날짜가 없거나 점심/간식 모두 비어있으면 스킵
    if (!rawDate && !lunch && !snack) continue;

    const dateKey = parseDate(rawDate);
    if (!dateKey) continue;

    // 메뉴 항목 정리 (다양한 구분자 지원)
    const cleanLunch = cleanMenu(lunch);
    const cleanSnack = cleanMenu(snack);

    if (!cleanLunch && !cleanSnack) continue;

    result.push({
      dateKey,
      lunch: cleanLunch,
      snack: cleanSnack
    });
  }

  return result;
}

// 날짜 파싱 (다양한 형식 지원)
function parseDate(raw) {
  if (!raw) return null;

  // Date 객체인 경우 (cellDates: true)
  if (raw instanceof Date) {
    return getDateKey(raw);
  }

  const str = String(raw).trim();

  // YYYY-MM-DD
  let match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
  }

  // YYYY/MM/DD
  match = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (match) {
    return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
  }

  // MM/DD or MM-DD (현재 연도 기준)
  match = str.match(/^(\d{1,2})[\/\-.](\d{1,2})$/);
  if (match) {
    const year = new Date().getFullYear();
    return `${year}-${String(match[1]).padStart(2, '0')}-${String(match[2]).padStart(2, '0')}`;
  }

  // M월 D일
  match = str.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (match) {
    const year = new Date().getFullYear();
    return `${year}-${String(match[1]).padStart(2, '0')}-${String(match[2]).padStart(2, '0')}`;
  }

  // Excel serial number
  if (typeof raw === 'number' && raw > 40000) {
    const date = new Date((raw - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return getDateKey(date);
    }
  }

  return null;
}

// 메뉴 텍스트 정리 (다양한 구분자 → 줄바꿈)
function cleanMenu(text) {
  if (!text) return '';
  return text
    .replace(/[,，、]/g, '\n')   // 쉼표 → 줄바꿈
    .replace(/\r\n/g, '\n')      // CRLF → LF
    .replace(/\r/g, '\n')        // CR → LF
    .split('\n')
    .map(s => s.trim())
    .filter(s => s)
    .join('\n');
}

// ===== 미리보기 테이블 =====
function renderMealPreview(data) {
  const previewDiv = document.getElementById('mealUploadPreview');
  const tableDiv = document.getElementById('mealUploadTable');

  previewDiv.style.display = 'block';

  tableDiv.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#f5f5f5;position:sticky;top:0;">
          <th style="padding:8px;text-align:left;border-bottom:1px solid #ddd;width:25%;">날짜</th>
          <th style="padding:8px;text-align:left;border-bottom:1px solid #ddd;width:40%;">점심</th>
          <th style="padding:8px;text-align:left;border-bottom:1px solid #ddd;width:35%;">간식</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(d => {
          const parts = d.dateKey.split('-');
          const displayDate = `${parseInt(parts[1])}/${parseInt(parts[2])}`;
          return `
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;white-space:nowrap;">${displayDate} (${getDayName(d.dateKey)})</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;white-space:pre-line;font-size:12px;">${d.lunch || '-'}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;white-space:pre-line;font-size:12px;">${d.snack || '-'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  // 적용 버튼 표시
  document.getElementById('mealApplyBtn').style.display = 'block';
}

function getDayName(dateKey) {
  const parts = dateKey.split('-');
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
}

// ===== Firestore에 적용 =====
async function applyMealUpload() {
  if (!parsedMealData || parsedMealData.length === 0) {
    showToast('적용할 식단 데이터가 없습니다.', 'warning');
    return;
  }

  try {
    // 기존 Firestore 데이터 조회
    let existing = {};
    try {
      const firestoreData = await firestoreGetMealData();
      if (firestoreData) existing = firestoreData;
    } catch (e) {
      // localStorage 폴백
      try {
        const local = localStorage.getItem('mealData');
        if (local) existing = JSON.parse(local);
      } catch {}
    }

    // 파싱 데이터 병합 (업로드 데이터가 기존 데이터를 덮어씀)
    parsedMealData.forEach(d => {
      existing[d.dateKey] = {
        lunch: d.lunch,
        snack: d.snack
      };
    });

    // Firestore에 저장
    await firestoreSaveMealData(existing);

    // localStorage에도 백업
    localStorage.setItem('mealData', JSON.stringify(existing));

    showToast(`${parsedMealData.length}일분 식단이 적용되었습니다.`, 'success');
    closeMealUpload();

    // 메인 식단 그리드 갱신 (useMeal의 renderMealGrid가 구독으로 자동 갱신되지만, 안전하게 이벤트 발생)
    if (typeof window.changeMealWeek === 'function') {
      window.changeMealWeek(0); // 현재 주 다시 렌더링
    }
  } catch (e) {
    console.error('식단 적용 실패:', e);
    showToast('식단 적용에 실패했습니다.', 'error');
  }
}

// ===== 모달 닫기 =====
function closeMealUpload() {
  const overlay = document.getElementById('mealUploadOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }
  parsedMealData = null;
}

// ===== window 노출 =====
window.openMealUploadModal = openMealUploadModal;
window.handleMealFile = handleMealFile;
window.applyMealUpload = applyMealUpload;
window.closeMealUpload = closeMealUpload;
