# 성산지역아동센터 홈페이지

## 프로젝트 개요

서울시 은평구 증산서길 90 소재 성산지역아동센터의 선생님-학부모 소통 웹사이트.

- **배포**: GitHub Pages
- **기술스택**: HTML / CSS / Vanilla JS (ES Modules, 빌드 도구 없음)
- **디자인**: 토스 스타일 — 소프트 코랄(`#FF7854`) + 웜 베이지, Pretendard 폰트
- **백엔드**: Firebase (Firestore, Auth, Storage)

## 아키텍처

React 커스텀 훅 패턴을 바닐라 JS로 구현:
- **컴포넌트**: HTML 문자열을 반환하는 순수 함수
- **훅**: 상태 + DOM 조작 로직 캡슐화, `window` 노출로 `onclick` 연동
- **상태 관리**: `state.js`의 옵저버 패턴 (`onAdminChange` 구독)
- **인증**: Firebase Auth 기반, 역할(`admin`/`general`), `body.admin-mode` 클래스로 권한 분기

## 규칙

### HTML
- **미니멀 셸 패턴**: HTML 파일은 ~12줄. `<link>`, `<div id="app">`, `<script type="module">` 만 포함
- 인라인 `<style>`, 인라인 `<script>` 금지 (모두 외부 파일로 분리)
- 정적 콘텐츠 페이지(privacy.html 등)는 예외적으로 HTML 본문 허용, 단 CSS는 외부 파일

### CSS
- **@import 인덱스 패턴**: 루트 CSS 파일(`style.css`, `login.css`, `mypage.css`, `attendance.css`)은 `@import` 목록만 포함
- **ID 스코핑**: 각 섹션 CSS는 `#sectionId .class` 형태로 충돌 방지
- **인라인 스타일 금지**: JS 템플릿 리터럴에서 `style="..."` 사용 금지 → CSS 클래스로 대체
- **CSS 변수 필수**: `:root`에 정의된 변수 사용 (`var(--primary)`, `var(--text-sub)` 등), 하드코딩 색상 금지
- **글로벌 클래스**: `base.css`의 공통 UI (`modal`, `btn-upload`, `input-field`, `hidden` 등)
- **공유 스타일**: `month-btn`/`month-label`은 여러 섹션에서 공유, `notice-card` 계열은 모달에서도 사용
- 새 CSS 모듈 추가 시 해당 인덱스 파일에 `@import` 등록 필수

### JS
- **컴포넌트**: `components/` 디렉토리, PascalCase 파일명, HTML 문자열 반환 순수 함수
- **훅**: `hooks/` 디렉토리, `use*` camelCase 파일명, 상태+DOM 캡슐화
- **window 노출**: `onclick` 핸들러 연동 시 `window.funcName = funcName` 패턴
- **훅 크기**: 400줄 이하 권장, 초과 시 책임 단위로 분리
- **진입점**: `app.js` / `app-*.js` — 컴포넌트 마운트 → 훅 초기화 순서

### Firebase
- `firebase/` 디렉토리에 서비스 레이어 (`services/*.js`)
- 컬렉션명은 `firebase/collections.js`에 정의
- `firebase/auth.js`에 인증 로직 (`login`, `signup`, `logout`, `onAuthChange`)

### 네이밍
- 컴포넌트: `PascalCase.js` (예: `LoginForm.js`, `Hero.js`)
- 훅: `useCamelCase.js` (예: `useAdmin.js`, `useCalendar.js`)
- CSS 파일: `kebab-case.css` (예: `att-report.css`, `meal-upload.css`)
- CSS 클래스: `kebab-case` (예: `.att-report-modal`, `.mypage-card`)
- 진입점: `app.js` 또는 `app-*.js` (예: `app-login.js`, `app-pending.js`)
