// ===== useMeal: 식단표 (Firestore + localStorage 폴백) =====
import { sampleMeals } from '../data/sampleData.js';
import { getWeekDates, isSameDay, getDateKey } from '../utils.js';
import { on } from '../events.js';
import {
  getMealData as firestoreGetMealData,
  saveMealData as firestoreSaveMealData,
  subscribeMealData
} from '../../firebase/services/mealService.js';

let mealWeekOffset = 0;
let cachedMealData = null; // 메모리 캐시

// ===== 데이터 접근 레이어 =====

// localStorage 폴백
function getLocalMealData() {
  try {
    const saved = localStorage.getItem('mealData');
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveLocalMealData(data) {
  localStorage.setItem('mealData', JSON.stringify(data));
}

// 캐시된 데이터 가져오기 (동기)
function getMealDataSync() {
  return cachedMealData || getLocalMealData();
}

// Firestore에 저장 + localStorage 백업
async function saveMealDataToStore(data) {
  cachedMealData = data;
  saveLocalMealData(data); // 항상 localStorage에도 백업

  try {
    await firestoreSaveMealData(data);
  } catch (e) {
    console.warn('Firestore 식단 저장 실패 (localStorage에 저장됨):', e);
  }
}

// 특정 날짜의 식단 가져오기 (저장된 데이터 우선, 없으면 sampleData)
function getDayMeal(date, dayIndex) {
  const key = getDateKey(date);
  const saved = getMealDataSync();
  if (saved[key]) return saved[key];
  // sampleData에서 기본값 (주간 index 기반)
  return {
    lunch: sampleMeals.lunch[dayIndex] || '',
    snack: sampleMeals.snack[dayIndex] || ''
  };
}

export function changeMealWeek(delta) {
  mealWeekOffset += delta;
  renderMealGrid();
}

export function renderMealGrid() {
  const dates = getWeekDates(mealWeekOffset);
  const dayNames = ['월', '화', '수', '목', '금'];
  const today = new Date();

  const startDate = dates[0];
  const endDate = dates[4];
  document.getElementById('mealWeekLabel').textContent =
    `${startDate.getMonth() + 1}/${startDate.getDate()} ~ ${endDate.getMonth() + 1}/${endDate.getDate()}`;

  const saved = getMealDataSync();
  document.getElementById('mealGrid').innerHTML = dates.map((d, i) => {
    const isToday = isSameDay(d, today);
    const key = getDateKey(d);
    const meal = saved[key] || { lunch: sampleMeals.lunch[i] || '', snack: sampleMeals.snack[i] || '' };
    return `
      <div class="meal-card ${isToday ? 'today' : ''}">
        <div class="meal-day">${dayNames[i]}</div>
        <div class="meal-date">${d.getDate()}</div>
        <div class="meal-type">점심</div>
        <div class="meal-menu">${(meal.lunch || '').replace(/\n/g, '<br>')}</div>
        <div class="meal-type">간식</div>
        <div class="meal-menu">${(meal.snack || '').replace(/\n/g, '<br>')}</div>
      </div>
    `;
  }).join('');
}

// ===== 달력형 식단 수정 모달 =====
let editingDate = null; // 현재 수정 중인 날짜
let editorMonth = null; // 에디터에서 보고 있는 월

export function openMealEditor() {
  const now = new Date();
  editorMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  renderMealEditorModal();
}

function renderMealEditorModal() {
  // 기존 모달 제거
  const existing = document.getElementById('mealEditorOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'mealEditorOverlay';
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal meal-editor-modal">
      <div class="modal-title">식단 수정</div>
      <button class="modal-close-x" data-action="closeMealEditor"></button>

      <div class="meal-editor-nav">
        <button class="month-btn" data-action="changeMealEditorMonth" data-dir="-1">&lt;</button>
        <span class="month-label" id="mealEditorMonthLabel"></span>
        <button class="month-btn" data-action="changeMealEditorMonth" data-dir="1">&gt;</button>
      </div>

      <div class="meal-editor-calendar" id="mealEditorCalendar"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMealEditor();
  });
  renderMealEditorCalendar();
}

function renderMealEditorCalendar() {
  const year = editorMonth.getFullYear();
  const month = editorMonth.getMonth();
  const saved = getMealDataSync();

  document.getElementById('mealEditorMonthLabel').textContent = `${year}년 ${month + 1}월`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '';
  ['일','월','화','수','목','금','토'].forEach(h => {
    html += `<div class="meal-cal-header">${h}</div>`;
  });

  // 빈 칸
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="meal-cal-day empty"></div>';
  }

  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    const key = getDateKey(date);
    const hasMeal = saved[key] ? true : false;
    const isToday = isSameDay(date, today);
    const isWeekend = dow === 0 || dow === 6;

    let classes = 'meal-cal-day';
    if (isToday) classes += ' today';
    if (hasMeal) classes += ' has-meal';
    if (isWeekend) classes += ' weekend';

    html += `<div class="${classes}" data-action="openMealDayEditor" data-key="${key}">${d}${hasMeal ? '<span class="meal-dot"></span>' : ''}</div>`;
  }

  document.getElementById('mealEditorCalendar').innerHTML = html;
}

export function changeMealEditorMonth(delta) {
  editorMonth.setMonth(editorMonth.getMonth() + delta);
  renderMealEditorCalendar();
}

export function openMealDayEditor(dateKey) {
  editingDate = dateKey;
  const saved = getMealDataSync();
  const meal = saved[dateKey] || { lunch: '', snack: '' };

  // dateKey를 파싱해서 표시
  const parts = dateKey.split('-');
  const displayDate = `${parseInt(parts[1])}월 ${parseInt(parts[2])}일`;

  // 달력을 날짜 에디터로 교체
  const modal = document.querySelector('.meal-editor-modal');
  modal.innerHTML = `
    <div class="modal-title">식단 수정</div>
    <button class="modal-close-x" data-action="closeMealEditor"></button>

    <div class="meal-day-editor">
      <div class="meal-day-nav">
        <button class="month-btn" data-action="moveMealDay" data-dir="-1">&lt;</button>
        <span class="meal-day-label" id="mealDayLabel">${displayDate}</span>
        <button class="month-btn" data-action="moveMealDay" data-dir="1">&gt;</button>
      </div>

      <div class="form-group">
        <label class="form-label">점심</label>
        <textarea id="mealEditLunch" class="input-field textarea" rows="5" placeholder="메뉴를 줄바꿈으로 구분&#10;예: 쌀밥&#10;된장찌개&#10;제육볶음">${meal.lunch}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">간식</label>
        <textarea id="mealEditSnack" class="input-field textarea" rows="3" placeholder="메뉴를 줄바꿈으로 구분&#10;예: 우유&#10;고구마">${meal.snack}</textarea>
      </div>

      <div style="display:flex;gap:12px;margin-top:16px;align-items:center;">
        <button class="btn-upload" style="margin-top:0;" data-action="saveMealDay">저장</button>
        <button class="btn-secondary-sm" data-action="backToMealCalendar">달력으로</button>
      </div>
    </div>
  `;
}

export function moveMealDay(delta) {
  // 현재 입력 내용 임시 저장
  saveMealDaySilent();

  // 날짜 이동
  const parts = editingDate.split('-');
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  date.setDate(date.getDate() + delta);
  const newKey = getDateKey(date);
  openMealDayEditor(newKey);
}

function saveMealDaySilent() {
  const lunch = document.getElementById('mealEditLunch').value.trim();
  const snack = document.getElementById('mealEditSnack').value.trim();
  if (lunch || snack) {
    const data = getMealDataSync();
    data[editingDate] = { lunch, snack };
    // silent 저장은 동기적으로 캐시+localStorage만 업데이트 (Firestore는 최종 저장 시)
    cachedMealData = data;
    saveLocalMealData(data);
  }
}

export async function saveMealDay() {
  const lunch = document.getElementById('mealEditLunch').value.trim();
  const snack = document.getElementById('mealEditSnack').value.trim();

  const data = getMealDataSync();
  if (lunch || snack) {
    data[editingDate] = { lunch, snack };
  } else {
    delete data[editingDate]; // 비어있으면 삭제
  }
  await saveMealDataToStore(data);
  renderMealGrid(); // 메인 식단표 갱신
  showToast('식단이 저장되었습니다.', 'success');
  backToMealCalendar();
}

export function backToMealCalendar() {
  renderMealEditorModal();
}

export function closeMealEditor() {
  const overlay = document.getElementById('mealEditorOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }
  renderMealGrid(); // 메인 식단표 갱신
}

// ===== 이벤트 위임 등록 =====

on('changeMealWeek', (e, el) => {
  changeMealWeek(parseInt(el.dataset.dir));
});

on('openMealEditor', () => {
  openMealEditor();
});

on('closeMealEditor', () => {
  closeMealEditor();
});

on('changeMealEditorMonth', (e, el) => {
  changeMealEditorMonth(parseInt(el.dataset.dir));
});

on('openMealDayEditor', (e, el) => {
  openMealDayEditor(el.dataset.key);
});

on('moveMealDay', (e, el) => {
  moveMealDay(parseInt(el.dataset.dir));
});

on('saveMealDay', () => {
  saveMealDay();
});

on('backToMealCalendar', () => {
  backToMealCalendar();
});

// ===== 초기화 =====

export async function initMeal() {
  // 1) localStorage에서 먼저 로드 (빠른 초기 렌더링)
  cachedMealData = getLocalMealData();
  renderMealGrid();

  // 2) Firestore에서 로드 시도
  try {
    const firestoreData = await firestoreGetMealData();
    const localData = getLocalMealData();
    const hasLocal = Object.keys(localData).length > 0;
    const hasFirestore = firestoreData && Object.keys(firestoreData).length > 0;

    if (hasFirestore) {
      // Firestore 데이터가 있으면 사용
      cachedMealData = firestoreData;
      saveLocalMealData(firestoreData); // localStorage도 동기화
      renderMealGrid();
    } else if (hasLocal && !hasFirestore) {
      // localStorage에만 데이터가 있으면 Firestore로 마이그레이션
      console.log('식단 데이터 Firestore 마이그레이션 중...');
      await firestoreSaveMealData(localData);
      cachedMealData = localData;
      console.log('식단 데이터 마이그레이션 완료');
    }

    // 3) 실시간 구독 시작
    subscribeMealData((data) => {
      if (data) {
        cachedMealData = data;
        saveLocalMealData(data); // localStorage 동기화
        renderMealGrid();
      }
    });
  } catch (e) {
    console.warn('Firestore 식단 로드 실패 (localStorage 데이터 사용):', e);
    // localStorage 데이터로 이미 렌더링되어 있으므로 추가 작업 불필요
  }
}
