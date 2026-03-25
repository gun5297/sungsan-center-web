// ===== useAttReport: 월별 출석 통계 리포트 (HTML → window.print 기반 PDF) =====
import { getIsAdmin } from '../state.js';
import { getRecordsByMonth } from '../../firebase/services/attendanceService.js';
import { getAllStudents } from '../../firebase/services/studentService.js';

let reportData = null; // 생성된 리포트 캐시

// ===== 모달: 월 선택 UI =====
export function openAttendanceReport() {
  if (!getIsAdmin()) {
    showToast('관리자만 사용할 수 있습니다.', 'warning');
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // 기존 모달 제거
  const existing = document.getElementById('attReportOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'attReportOverlay';
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal" style="max-width:420px;">
      <div class="modal-title">월별 출석 리포트</div>
      <button class="modal-close-x" onclick="closeAttReport()"></button>

      <div style="display:flex;gap:12px;margin:20px 0;">
        <div class="form-group" style="flex:1">
          <label class="form-label">연도</label>
          <select id="reportYear" class="input-field">
            ${[year - 1, year, year + 1].map(y =>
              `<option value="${y}" ${y === year ? 'selected' : ''}>${y}년</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group" style="flex:1">
          <label class="form-label">월</label>
          <select id="reportMonth" class="input-field">
            ${Array.from({ length: 12 }, (_, i) =>
              `<option value="${i + 1}" ${i + 1 === month ? 'selected' : ''}>${i + 1}월</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div id="reportPreview" style="margin-top:12px;"></div>

      <div style="display:flex;gap:12px;margin-top:20px;">
        <button class="btn-upload" style="flex:1;" onclick="generateAttReport()">리포트 생성</button>
        <button class="btn-secondary-sm" id="reportPrintBtn" style="flex:1;display:none;" onclick="printAttReport()">PDF 저장 / 인쇄</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAttReport();
  });
}

// ===== 리포트 생성 =====
async function generateAttReport() {
  const year = parseInt(document.getElementById('reportYear').value);
  const month = parseInt(document.getElementById('reportMonth').value);
  const preview = document.getElementById('reportPreview');

  preview.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">데이터를 불러오는 중...</div>';

  try {
    // Firestore에서 해당 월의 출결 + 학생 목록 조회
    const [monthRecords, students] = await Promise.all([
      getRecordsByMonth(year, month),
      getAllStudents()
    ]);

    if (students.length === 0) {
      preview.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">등록된 학생이 없습니다.</div>';
      return;
    }

    // 해당 월의 평일 수 계산
    const daysInMonth = new Date(year, month, 0).getDate();
    const weekdays = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dow = date.getDay();
      if (dow >= 1 && dow <= 5) weekdays.push(d);
    }

    // 학생별 통계 집계
    const stats = students.map(student => {
      let attendDays = 0;
      let lateDays = 0; // 10시 이후 등원
      let leftDays = 0; // 하원 기록 있는 날
      let totalInMinutes = 0;
      let totalOutMinutes = 0;
      let inCount = 0;
      let outCount = 0;

      Object.entries(monthRecords).forEach(([dateKey, records]) => {
        const record = records[student.id];
        if (!record) return;

        attendDays++;

        if (record.inTime) {
          const [h, m] = record.inTime.split(':').map(Number);
          const mins = h * 60 + m;
          totalInMinutes += mins;
          inCount++;
          if (h >= 10) lateDays++;
        }

        if (record.outTime) {
          leftDays++;
          const [h, m] = record.outTime.split(':').map(Number);
          totalOutMinutes += h * 60 + m;
          outCount++;
        }
      });

      const avgIn = inCount > 0 ? formatMinutes(Math.round(totalInMinutes / inCount)) : '-';
      const avgOut = outCount > 0 ? formatMinutes(Math.round(totalOutMinutes / outCount)) : '-';
      const attendRate = weekdays.length > 0 ? Math.round((attendDays / weekdays.length) * 100) : 0;

      return {
        name: student.name,
        school: student.school || '',
        id: student.id,
        attendDays,
        absentDays: weekdays.length - attendDays,
        lateDays,
        leftDays,
        avgIn,
        avgOut,
        attendRate
      };
    });

    // 전체 요약
    const totalStudents = students.length;
    const avgAttendRate = Math.round(stats.reduce((sum, s) => sum + s.attendRate, 0) / totalStudents);

    reportData = { year, month, stats, weekdays, totalStudents, avgAttendRate };

    // 미리보기 렌더링
    preview.innerHTML = `
      <div style="background:#f8f8f8;border-radius:12px;padding:16px;margin-bottom:8px;">
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <div style="text-align:center;flex:1;min-width:80px;">
            <div style="font-size:24px;font-weight:700;color:var(--primary,#FF7854);">${totalStudents}</div>
            <div style="font-size:12px;color:#888;">전체 학생</div>
          </div>
          <div style="text-align:center;flex:1;min-width:80px;">
            <div style="font-size:24px;font-weight:700;color:#2196F3;">${weekdays.length}</div>
            <div style="font-size:12px;color:#888;">수업일</div>
          </div>
          <div style="text-align:center;flex:1;min-width:80px;">
            <div style="font-size:24px;font-weight:700;color:#4CAF50;">${avgAttendRate}%</div>
            <div style="font-size:12px;color:#888;">평균 출석률</div>
          </div>
        </div>
      </div>
      <div style="max-height:240px;overflow-y:auto;border:1px solid #eee;border-radius:8px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f5f5f5;position:sticky;top:0;">
              <th style="padding:8px;text-align:left;border-bottom:1px solid #ddd;">이름</th>
              <th style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">출석</th>
              <th style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">결석</th>
              <th style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">출석률</th>
            </tr>
          </thead>
          <tbody>
            ${stats.map(s => `
              <tr>
                <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;">${s.name}</td>
                <td style="padding:6px 8px;text-align:center;border-bottom:1px solid #f0f0f0;">${s.attendDays}</td>
                <td style="padding:6px 8px;text-align:center;border-bottom:1px solid #f0f0f0;">${s.absentDays}</td>
                <td style="padding:6px 8px;text-align:center;border-bottom:1px solid #f0f0f0;font-weight:600;color:${s.attendRate >= 90 ? '#4CAF50' : s.attendRate >= 70 ? '#FF9800' : '#F44336'};">${s.attendRate}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // 인쇄 버튼 표시
    document.getElementById('reportPrintBtn').style.display = 'block';
    showToast('리포트가 생성되었습니다.', 'success');
  } catch (e) {
    console.error('리포트 생성 실패:', e);
    preview.innerHTML = '<div style="text-align:center;padding:20px;color:#F44336;">데이터를 불러올 수 없습니다.</div>';
    showToast('리포트 생성에 실패했습니다.', 'error');
  }
}

// ===== 인쇄 (새 창) =====
function printAttReport() {
  if (!reportData) {
    showToast('먼저 리포트를 생성해주세요.', 'warning');
    return;
  }

  const { year, month, stats, weekdays, totalStudents, avgAttendRate } = reportData;

  const printHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>출석 리포트 - ${year}년 ${month}월</title>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Pretendard', sans-serif; padding: 30px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FF7854; padding-bottom: 20px; }
    .header h1 { font-size: 22px; color: #333; margin-bottom: 4px; }
    .header .sub { font-size: 14px; color: #888; }
    .header .period { font-size: 16px; font-weight: 600; color: #FF7854; margin-top: 8px; }
    .summary { display: flex; justify-content: center; gap: 40px; margin-bottom: 30px; padding: 16px; background: #FFF5F2; border-radius: 8px; }
    .summary-item { text-align: center; }
    .summary-item .num { font-size: 28px; font-weight: 700; }
    .summary-item .label { font-size: 12px; color: #888; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f5f5f5; padding: 8px 6px; text-align: center; border: 1px solid #ddd; font-weight: 600; }
    th:first-child, td:first-child { text-align: left; padding-left: 10px; }
    td { padding: 6px; text-align: center; border: 1px solid #eee; }
    tr:nth-child(even) { background: #fafafa; }
    .rate-high { color: #4CAF50; font-weight: 600; }
    .rate-mid { color: #FF9800; font-weight: 600; }
    .rate-low { color: #F44336; font-weight: 600; }
    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
    @media print {
      body { padding: 15px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>성산지역아동센터</h1>
    <div class="sub">월별 출석 통계 리포트</div>
    <div class="period">${year}년 ${month}월 (수업일 ${weekdays.length}일)</div>
  </div>

  <div class="summary">
    <div class="summary-item">
      <div class="num">${totalStudents}</div>
      <div class="label">전체 학생</div>
    </div>
    <div class="summary-item">
      <div class="num">${weekdays.length}</div>
      <div class="label">수업일</div>
    </div>
    <div class="summary-item">
      <div class="num" style="color:#4CAF50;">${avgAttendRate}%</div>
      <div class="label">평균 출석률</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:5%;">No.</th>
        <th style="width:12%;">이름</th>
        <th style="width:15%;">소속</th>
        <th style="width:10%;">출석일</th>
        <th style="width:10%;">결석일</th>
        <th style="width:10%;">지각</th>
        <th style="width:10%;">하원</th>
        <th style="width:10%;">평균 등원</th>
        <th style="width:10%;">평균 하원</th>
        <th style="width:8%;">출석률</th>
      </tr>
    </thead>
    <tbody>
      ${stats.map((s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td style="text-align:left;">${s.name}</td>
          <td>${s.school || '-'}</td>
          <td>${s.attendDays}</td>
          <td>${s.absentDays}</td>
          <td>${s.lateDays}</td>
          <td>${s.leftDays}</td>
          <td>${s.avgIn}</td>
          <td>${s.avgOut}</td>
          <td class="${s.attendRate >= 90 ? 'rate-high' : s.attendRate >= 70 ? 'rate-mid' : 'rate-low'}">${s.attendRate}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    출력일: ${new Date().toLocaleDateString('ko-KR')} | 성산지역아동센터
  </div>

  <div class="no-print" style="text-align:center;margin-top:20px;">
    <button onclick="window.print()" style="padding:10px 32px;background:#FF7854;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;font-family:inherit;">
      인쇄 / PDF 저장
    </button>
  </div>
</body>
</html>`;

  const printWin = window.open('', '_blank');
  printWin.document.write(printHTML);
  printWin.document.close();
}

// ===== 모달 닫기 =====
function closeAttReport() {
  const overlay = document.getElementById('attReportOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }
}

// ===== 유틸 =====
function formatMinutes(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ===== window 노출 =====
window.openAttendanceReport = openAttendanceReport;
window.generateAttReport = generateAttReport;
window.printAttReport = printAttReport;
window.closeAttReport = closeAttReport;
