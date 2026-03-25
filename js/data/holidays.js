// ===== 공휴일 자동 갱신 (Google Calendar API) =====
// 한국 공휴일 캘린더를 가져와서 schoolEvents에 병합
// 임시공휴일, 대체공휴일 등 자동 반영

const GOOGLE_CALENDAR_ID = 'ko.south_korea%23holiday%40group.v.calendar.google.com';
const GOOGLE_API_KEY = 'AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs'; // Google 공개 캘린더용 키
const CACHE_KEY = 'holidays_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

// 캐시에서 로드
function loadCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) return null;
    return data;
  } catch { return null; }
}

// 캐시에 저장
function saveCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
}

// Google Calendar에서 공휴일 가져오기
async function fetchFromGoogle(year) {
  const timeMin = `${year}-01-01T00:00:00Z`;
  const timeMax = `${year}-12-31T23:59:59Z`;
  const url = `https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CALENDAR_ID}/events?key=${GOOGLE_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  const holidays = {};
  for (const item of json.items || []) {
    const date = item.start.date; // YYYY-MM-DD
    const name = item.summary;
    if (date && name) {
      if (!holidays[date]) holidays[date] = [];
      holidays[date].push(`${name} (휴일)`);
    }
  }
  return holidays;
}

// 공휴일 데이터 가져오기 (캐시 우선)
export async function getHolidays(year) {
  const cached = loadCache();
  if (cached && cached[year]) return cached[year];

  try {
    const holidays = await fetchFromGoogle(year);
    const allData = cached || {};
    allData[year] = holidays;
    saveCache(allData);
    return holidays;
  } catch (e) {
    console.warn('공휴일 데이터 가져오기 실패:', e);
    return {};
  }
}

// 이벤트 이름에서 핵심 키워드 추출 (중복 비교용)
function normalizeEventName(name) {
  return name
    .replace(/\s*\(휴일\)\s*/g, '')
    .replace(/\s*\(공휴일\)\s*/g, '')
    .replace(/\[.*?\]\s*/g, '')
    .replace(/\s*연휴\s*/g, '')
    .replace(/\s*대체공휴일\s*/g, '')
    .trim();
}

// schoolEvents에 병합 (기존 이벤트 유지, 공휴일 추가, 중복 제거)
export function mergeHolidays(schoolEvents, holidays) {
  const merged = { ...schoolEvents };
  for (const [date, names] of Object.entries(holidays)) {
    if (!merged[date]) {
      merged[date] = names;
    } else {
      for (const name of names) {
        const nameKey = normalizeEventName(name);
        const isDuplicate = merged[date].some(e => {
          const existingKey = normalizeEventName(e);
          return existingKey.includes(nameKey) || nameKey.includes(existingKey);
        });
        if (!isDuplicate) merged[date].push(name);
      }
    }
  }
  return merged;
}
