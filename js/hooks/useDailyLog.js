// ===== useDailyLog: 일일 활동 일지 =====
import { getDailyLog, saveDailyLog, getRecentLogs } from '../../firebase/services/dailyLogService.js';
import { getCurrentUser } from '../state.js';
// [개선] getDateKey import 추가 — UTC 기반 todayKey 대체
import { escapeHtml, getDateKey } from '../utils.js';
import { on, onAll } from '../events.js';

// [보안] UTC → 로컬 시간대 기반으로 변경 (KST 00:00~08:59 날짜 오류 방지)
function todayKey() {
  return getDateKey(new Date());
}

function formatDisplayDate(key) {
  const d = new Date(key + 'T00:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// ===== 일지 작성 모달 =====
export async function openDailyLogEditor(dateKey) {
  // 목록 모달이 열려있으면 닫기
  closeDailyLogList();

  const key = dateKey || todayKey();
  const user = getCurrentUser();
  if (!user) { showToast('로그인이 필요합니다.', 'warning'); return; }

  let existing = null;
  try { existing = await getDailyLog(key); } catch (e) { /* 무시 */ }

  const weatherOptions = [
    { value: '맑음', icon: '☀️' },
    { value: '흐림', icon: '☁️' },
    { value: '비', icon: '🌧️' },
    { value: '눈', icon: '🌨️' },
    { value: '안개', icon: '🌫️' }
  ];
  const programs = existing?.programs || [{ time: '', name: '', participants: '', note: '' }];

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'dailyLogOverlay';
  overlay.onclick = (e) => { if (e.target === overlay) closeDailyLogEditor(); };

  overlay.innerHTML = `
    <div class="modal dailylog-modal">
      <div class="log-header">
        <div class="log-header-top">
          <div>
            <div class="log-title">${existing ? '활동 일지 수정' : '활동 일지 작성'}</div>
            <div class="log-subtitle">${formatDisplayDate(key)}</div>
          </div>
          <button class="log-close-btn" data-action="closeDailyLogEditor">✕</button>
        </div>
      </div>

      <div class="log-body">
        <div class="log-meta-row">
          <div class="log-field">
            <div class="log-field-label">날짜</div>
            <input type="date" id="logDate" class="input-field" value="${key}" />
          </div>
          <div class="log-field">
            <div class="log-field-label">날씨</div>
            <select id="logWeather" class="input-field">
              ${weatherOptions.map(w => `<option value="${escapeHtml(w.value)}" ${existing?.weather === w.value ? 'selected' : ''}>${w.icon} ${escapeHtml(w.value)}</option>`).join('')}
            </select>
          </div>
          <div class="log-field">
            <div class="log-field-label">출석 아동 수</div>
            <input type="number" id="logTotal" class="input-field" placeholder="0" value="${existing?.totalChildren || ''}" />
          </div>
        </div>

        <div class="log-section-title">프로그램 활동</div>
        <div id="logPrograms">
          ${programs.map((p, i) => programRow(p, i)).join('')}
        </div>
        <button class="log-add-program" data-action="addProgramRow">+ 프로그램 추가</button>

        <div class="log-section-title">특이사항</div>
        <textarea id="logNotes" class="input-field log-notes-field" rows="4" placeholder="오늘의 특이사항, 아동 관찰 내용 등을 기록하세요...">${escapeHtml(existing?.specialNotes || '')}</textarea>
      </div>

      <div class="log-footer">
        <button class="log-btn log-btn-cancel" data-action="closeDailyLogEditor">취소</button>
        <button class="log-btn log-btn-save" data-action="saveDailyLogForm">저장</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function programRow(p, idx) {
  return `
    <div class="program-row" data-idx="${idx}">
      <button class="prog-delete-btn" data-action="removeProgramRow">✕</button>
      <div class="prog-grid">
        <div>
          <div class="prog-label">시간</div>
          <input type="time" class="input-field prog-time" value="${escapeHtml(p.time || '')}" />
        </div>
        <div>
          <div class="prog-label">프로그램명</div>
          <input type="text" class="input-field prog-name" placeholder="예: 미술활동" value="${escapeHtml(p.name || '')}" />
        </div>
        <div>
          <div class="prog-label">인원</div>
          <input type="number" class="input-field prog-participants" placeholder="0" value="${escapeHtml(String(p.participants || ''))}" />
        </div>
      </div>
      <div class="prog-grid-full" style="margin-top:8px;">
        <div class="prog-label">비고</div>
        <input type="text" class="input-field prog-note" placeholder="활동 내용, 특이사항 등" value="${escapeHtml(p.note || '')}" />
      </div>
    </div>
  `;
}

function addProgramRow() {
  const container = document.getElementById('logPrograms');
  if (!container) return;
  const idx = container.querySelectorAll('.program-row').length;
  const div = document.createElement('div');
  div.innerHTML = programRow({ time: '', name: '', participants: '', note: '' }, idx);
  container.appendChild(div.firstElementChild);
}

function removeProgramRow(el) {
  const row = el.closest('.program-row');
  if (row) row.remove();
}

async function saveDailyLogForm() {
  const user = getCurrentUser();
  if (!user) return;

  const dateKey = document.getElementById('logDate')?.value;
  const weather = document.getElementById('logWeather')?.value;
  const totalChildren = parseInt(document.getElementById('logTotal')?.value) || 0;
  const specialNotes = document.getElementById('logNotes')?.value || '';

  const programRows = document.querySelectorAll('#logPrograms .program-row');
  const programs = Array.from(programRows).map(row => ({
    time: row.querySelector('.prog-time')?.value || '',
    name: row.querySelector('.prog-name')?.value || '',
    participants: parseInt(row.querySelector('.prog-participants')?.value) || 0,
    note: row.querySelector('.prog-note')?.value || ''
  })).filter(p => p.name.trim() !== '');

  if (!dateKey) { showToast('날짜를 선택해 주세요.', 'warning'); return; }

  try {
    await saveDailyLog(dateKey, {
      author: user.name || user.email,
      authorUid: user.uid,
      weather,
      totalChildren,
      programs,
      specialNotes
    });
    showToast('활동 일지가 저장되었습니다.', 'success');
    closeDailyLogEditor();
  } catch (e) {
    console.error('일지 저장 실패:', e);
    showToast('저장에 실패했습니다: ' + e.message, 'error');
  }
}

export function closeDailyLogEditor() {
  const overlay = document.getElementById('dailyLogOverlay');
  if (overlay) { overlay.remove(); document.body.style.overflow = ''; }
}

// ===== 일지 목록 모달 =====
export async function openDailyLogList() {
  const user = getCurrentUser();
  if (!user) { showToast('로그인이 필요합니다.', 'warning'); return; }

  let logs = [];
  try { logs = await getRecentLogs(14); } catch (e) { console.error('최근 일지 조회 실패:', e); }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'dailyLogListOverlay';
  overlay.onclick = (e) => { if (e.target === overlay) closeDailyLogList(); };

  const days = ['일', '월', '화', '수', '목', '금', '토'];

  overlay.innerHTML = `
    <div class="modal dailylog-modal dailylog-list-modal">
      <div class="log-header">
        <div class="log-header-top">
          <div>
            <div class="log-title">활동 일지 목록</div>
            <div class="log-subtitle">최근 2주간 기록</div>
          </div>
          <button class="log-close-btn" data-action="closeDailyLogList">✕</button>
        </div>
      </div>
      <div class="log-body">
        ${logs.length === 0
          ? `<div class="dailylog-empty">
              <div class="dailylog-empty-icon">📋</div>
              <div class="dailylog-empty-text">작성된 활동 일지가 없습니다</div>
              <div class="dailylog-empty-desc">활동 일지 작성 버튼으로 첫 일지를 기록해 보세요</div>
            </div>`
          : logs.map(log => {
              const d = new Date(log.date + 'T00:00:00');
              return `
                <div class="dailylog-item" data-action="openDailyLogFromList" data-date="${escapeHtml(log.date)}">
                  <div class="dailylog-item-date-box">
                    <div class="dailylog-date-day">${d.getDate()}</div>
                    <div class="dailylog-date-dow">${days[d.getDay()]}</div>
                  </div>
                  <div class="dailylog-item-content">
                    <div class="dailylog-item-meta">${d.getMonth() + 1}월 ${d.getDate()}일 활동 일지</div>
                    <div class="dailylog-item-tags">
                      <span class="log-tag log-tag-weather">${escapeHtml(log.weather || '-')}</span>
                      <span class="log-tag log-tag-count">출석 ${log.totalChildren || 0}명</span>
                      <span class="log-tag log-tag-programs">${(log.programs || []).length}개 프로그램</span>
                    </div>
                  </div>
                  <div class="dailylog-item-author">${escapeHtml(log.author || '')}</div>
                  <div class="dailylog-item-arrow">›</div>
                </div>
              `;
            }).join('')
        }
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

export function closeDailyLogList() {
  const overlay = document.getElementById('dailyLogListOverlay');
  if (overlay) { overlay.remove(); document.body.style.overflow = ''; }
}

// 이벤트 위임 등록
on('openDailyLogEditor', () => openDailyLogEditor());
on('closeDailyLogEditor', () => closeDailyLogEditor());
on('openDailyLogList', () => openDailyLogList());
on('closeDailyLogList', () => closeDailyLogList());
on('addProgramRow', () => addProgramRow());
on('removeProgramRow', (e, el) => removeProgramRow(el));
on('saveDailyLogForm', () => saveDailyLogForm());
on('openDailyLogFromList', (e, el) => {
  closeDailyLogList();
  openDailyLogEditor(el.dataset.date);
});
