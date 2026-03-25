// ===== useMeal: 식단표 =====
import { sampleMeals } from '../data/sampleData.js';
import { getWeekDates, isSameDay } from '../utils.js';

let mealWeekOffset = 0;

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

  document.getElementById('mealGrid').innerHTML = dates.map((d, i) => {
    const isToday = isSameDay(d, today);
    return `
      <div class="meal-card ${isToday ? 'today' : ''}">
        <div class="meal-day">${dayNames[i]}</div>
        <div class="meal-date">${d.getDate()}</div>
        <div class="meal-type">점심</div>
        <div class="meal-menu">${sampleMeals.lunch[i].replace(/\n/g, '<br>')}</div>
        <div class="meal-type">간식</div>
        <div class="meal-menu">${sampleMeals.snack[i].replace(/\n/g, '<br>')}</div>
      </div>
    `;
  }).join('');
}

export function initMeal() {
  renderMealGrid();
}

// window에 노출
window.changeMealWeek = changeMealWeek;
