// ===== useAttReport: 월별 출석 통계 리포트 (HTML → window.print 기반 PDF) =====
import { getIsAdmin } from '../state.js';
import { on } from '../events.js';
import { getRecordsByMonth } from '../../firebase/services/attendanceService.js';
import { getAllStudents } from '../../firebase/services/studentService.js';

let reportData = null;

export function openAttendanceReport() {
  if (!getIsAdmin()) {
    showToast('관리자만 사용할 수 있습니다.', 'warning');
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const existing = document.getElementById('attReportOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'attReportOverlay';
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal att-report-modal">
      <div class="modal-title">월별 출석 리포트</div>
      <button class="modal-close-x" data-action="closeAttReport"></button>

      <div class="att-report-selectors">
        <div class="form-group">
          <label class="form-label">연도</label>
          <select id="reportYear" class="input-field">
            ${[year - 1, year, year + 1].map(y =>
              `<option value="${y}" ${y === year ? 'selected' : ''}>${y}년</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">월</label>
          <select id="reportMonth" class="input-field">
            ${Array.from({ length: 12 }, (_, i) =>
              `<option value="${i + 1}" ${i + 1 === month ? 'selected' : ''}>${i + 1}월</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div id="reportPreview" class="att-report-preview"></div>

      <div class="att-report-actions">
        <button class="btn-upload" data-action="generateAttReport">리포트 생성</button>
        <button class="btn-secondary-sm hidden" id="reportPrintBtn" data-action="printAttReport">PDF 저장 / 인쇄</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAttReport();
  });
}

async function generateAttReport() {
  const year = parseInt(document.getElementById('reportYear').value);
  const month = parseInt(document.getElementById('reportMonth').value);
  const preview = document.getElementById('reportPreview');

  preview.innerHTML = '<div class="att-report-loading">데이터를 불러오는 중...</div>';

  try {
    const [monthRecords, students] = await Promise.all([
      getRecordsByMonth(year, month),
      getAllStudents()
    ]);

    if (students.length === 0) {
      preview.innerHTML = '<div class="att-report-loading">등록된 학생이 없습니다.</div>';
      return;
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const weekdays = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dow = date.getDay();
      if (dow >= 1 && dow <= 5) weekdays.push(d);
    }

    const stats = students.map(student => {
      let attendDays = 0, lateDays = 0, leftDays = 0;
      let totalInMinutes = 0, totalOutMinutes = 0, inCount = 0, outCount = 0;

      Object.entries(monthRecords).forEach(([dateKey, records]) => {
        const record = records[student.id];
        if (!record) return;
        attendDays++;
        if (record.inTime) {
          const [h, m] = record.inTime.split(':').map(Number);
          totalInMinutes += h * 60 + m;
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

      return {
        name: student.name,
        school: student.school || '',
        id: student.id,
        attendDays,
        absentDays: weekdays.length - attendDays,
        lateDays,
        leftDays,
        avgIn: inCount > 0 ? formatMinutes(Math.round(totalInMinutes / inCount)) : '-',
        avgOut: outCount > 0 ? formatMinutes(Math.round(totalOutMinutes / outCount)) : '-',
        attendRate: weekdays.length > 0 ? Math.round((attendDays / weekdays.length) * 100) : 0
      };
    });

    const totalStudents = students.length;
    const avgAttendRate = Math.round(stats.reduce((sum, s) => sum + s.attendRate, 0) / totalStudents);
    reportData = { year, month, stats, weekdays, totalStudents, avgAttendRate };

    preview.innerHTML = `
      <div class="att-report-summary">
        <div class="att-report-summary-row">
          <div class="att-report-stat">
            <div class="att-report-stat-num primary">${totalStudents}</div>
            <div class="att-report-stat-label">전체 학생</div>
          </div>
          <div class="att-report-stat">
            <div class="att-report-stat-num blue">${weekdays.length}</div>
            <div class="att-report-stat-label">수업일</div>
          </div>
          <div class="att-report-stat">
            <div class="att-report-stat-num green">${avgAttendRate}%</div>
            <div class="att-report-stat-label">평균 출석률</div>
          </div>
        </div>
      </div>
      <div class="att-report-table-wrap">
        <table class="att-report-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>출석</th>
              <th>결석</th>
              <th>출석률</th>
            </tr>
          </thead>
          <tbody>
            ${stats.map(s => `
              <tr>
                <td>${s.name}</td>
                <td>${s.attendDays}</td>
                <td>${s.absentDays}</td>
                <td class="${s.attendRate >= 90 ? 'att-report-rate-high' : s.attendRate >= 70 ? 'att-report-rate-mid' : 'att-report-rate-low'}">${s.attendRate}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('reportPrintBtn').classList.remove('hidden');
    showToast('리포트가 생성되었습니다.', 'success');
  } catch (e) {
    console.error('리포트 생성 실패:', e);
    preview.innerHTML = '<div class="att-report-error">데이터를 불러올 수 없습니다.</div>';
    showToast('리포트 생성에 실패했습니다.', 'error');
  }
}

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
    @media print { body { padding: 15px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>성산지역아동센터</h1>
    <div class="sub">월별 출석 통계 리포트</div>
    <div class="period">${year}년 ${month}월 (수업일 ${weekdays.length}일)</div>
  </div>
  <div class="summary">
    <div class="summary-item"><div class="num">${totalStudents}</div><div class="label">전체 학생</div></div>
    <div class="summary-item"><div class="num">${weekdays.length}</div><div class="label">수업일</div></div>
    <div class="summary-item"><div class="num" style="color:#4CAF50;">${avgAttendRate}%</div><div class="label">평균 출석률</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:5%;">No.</th><th style="width:12%;">이름</th><th style="width:15%;">소속</th>
        <th style="width:10%;">출석일</th><th style="width:10%;">결석일</th><th style="width:10%;">지각</th>
        <th style="width:10%;">하원</th><th style="width:10%;">평균 등원</th><th style="width:10%;">평균 하원</th><th style="width:8%;">출석률</th>
      </tr>
    </thead>
    <tbody>
      ${stats.map((s, i) => `
        <tr>
          <td>${i + 1}</td><td style="text-align:left;">${s.name}</td><td>${s.school || '-'}</td>
          <td>${s.attendDays}</td><td>${s.absentDays}</td><td>${s.lateDays}</td><td>${s.leftDays}</td>
          <td>${s.avgIn}</td><td>${s.avgOut}</td>
          <td class="${s.attendRate >= 90 ? 'rate-high' : s.attendRate >= 70 ? 'rate-mid' : 'rate-low'}">${s.attendRate}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">출력일: ${new Date().toLocaleDateString('ko-KR')} | 성산지역아동센터</div>
  <div class="no-print att-report-print-wrap">
    <button class="att-report-print-btn" onclick="window.print()">인쇄 / PDF 저장</button>
  </div>
</body>
</html>`;

  const printWin = window.open('', '_blank');
  printWin.document.write(printHTML);
  printWin.document.close();
}

function closeAttReport() {
  const overlay = document.getElementById('attReportOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }
}

function formatMinutes(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ===== 이벤트 위임 등록 =====
on('closeAttReport', () => closeAttReport());
on('generateAttReport', () => generateAttReport());
on('printAttReport', () => printAttReport());
