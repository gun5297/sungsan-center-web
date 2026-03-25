// ===== useAttendance: 출석 현황 (메인 페이지 표시용) =====

function getAttStudents() {
  return JSON.parse(localStorage.getItem('att_students') || '[]');
}

function getAttRecords() {
  const key = `att_${new Date().toISOString().split('T')[0]}`;
  return JSON.parse(localStorage.getItem(key) || '{}');
}

export function renderAttendance() {
  const attStudents = getAttStudents();
  const records = getAttRecords();

  if (attStudents.length === 0) {
    document.getElementById('attendanceSummary').innerHTML = '';
    document.getElementById('attendanceList').innerHTML =
      '<div class="empty-state">출결 시스템에 등록된 아동이 없습니다</div>';
    return;
  }

  let presentCount = 0, leftCount = 0, absentCount = 0;
  attStudents.forEach(s => {
    const r = records[s.id];
    if (!r) absentCount++;
    else if (r.outTime) leftCount++;
    else presentCount++;
  });

  document.getElementById('attendanceSummary').innerHTML = `
    <div class="att-summary-card">
      <div class="att-summary-number present">${presentCount}</div>
      <div class="att-summary-label">출석 중</div>
    </div>
    <div class="att-summary-card">
      <div class="att-summary-number late">${leftCount}</div>
      <div class="att-summary-label">하원</div>
    </div>
    <div class="att-summary-card">
      <div class="att-summary-number absent">${absentCount}</div>
      <div class="att-summary-label">미출석</div>
    </div>
  `;

  document.getElementById('attendanceList').innerHTML = attStudents.map(s => {
    const r = records[s.id];
    let statusClass, statusLabel, timeInfo;

    if (!r) {
      statusClass = 'absent';
      statusLabel = '미출석';
      timeInfo = '';
    } else if (r.outTime) {
      statusClass = 'late';
      statusLabel = '하원';
      timeInfo = `등원 ${r.inTime} · 하원 ${r.outTime}`;
    } else {
      statusClass = 'present';
      statusLabel = '출석 중';
      timeInfo = `등원 ${r.inTime}`;
    }

    return `
      <div class="att-item">
        <div class="att-avatar ${statusClass}">${s.name.charAt(0)}</div>
        <div class="att-info">
          <div class="att-name">${s.name}</div>
          <div class="att-status">${statusLabel}${timeInfo ? ` · ${timeInfo}` : ''}</div>
        </div>
        <div class="att-school">${s.school}</div>
      </div>
    `;
  }).join('');
}

let autoRefreshTimer = null;

export function initAttendance() {
  renderAttendance();
  autoRefreshTimer = setInterval(renderAttendance, 30000);
}

// window에 노출
window.renderAttendance = renderAttendance;
