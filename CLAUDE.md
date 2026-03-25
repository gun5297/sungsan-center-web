# 성산지역아동센터 홈페이지

## 프로젝트 개요

서울시 은평구 증산서길 90 소재 성산지역아동센터의 선생님-학부모 소통 웹사이트.
센터장님 시연용 + 실제 운영 목적으로 제작.

- **배포**: GitHub Pages
- **기술스택**: HTML / CSS / Vanilla JS (ES Modules, 빌드 도구 없음)
- **디자인**: 토스 스타일 — 소프트 코랄(`#FF7854`) + 웜 베이지, Pretendard 폰트
- **Firebase**: SDK 설정 완료 (`firebase.js`), Firestore/Auth 연동 준비 상태

## 아키텍처

React 커스텀 훅 패턴을 바닐라 JS로 구현:
- **컴포넌트**: HTML 문자열을 반환하는 순수 함수
- **훅**: 상태 + DOM 조작 로직 캡슐화, `window` 노출로 `onclick` 연동
- **상태 관리**: `state.js`의 옵저버 패턴 (`onAdminChange` 구독)
- **CSS**: `@import` 기반 모듈화 + 섹션 ID 스코핑 (`#notice .notice-card`)

## 파일 구조

```
sungsan-center-web/
├── index.html              # 메인 페이지 (12줄 셸)
├── style.css               # 메인 CSS @import 인덱스
├── firebase.js             # Firebase SDK 초기화
│
├── js/                     # 메인 페이지 JS
│   ├── app.js              # 진입점: 컴포넌트 조립 → #app 마운트 → 훅 초기화
│   ├── state.js            # 공유 상태 (isAdmin) + 옵저버 패턴
│   ├── utils.js            # 날짜 포맷, 모달 닫기, 주간 날짜 계산
│   ├── data/
│   │   ├── sampleData.js   # 데모 데이터 (공지, 식단, 결석, 투약, 픽업, 갤러리, 서류함)
│   │   └── schoolEvents.js # 2026 학사일정 (증산초, 수색초, 증산중, 공휴일)
│   ├── components/         # 14개 컴포넌트 (HTML 반환 함수)
│   │   ├── Nav.js          # 네비게이션 바
│   │   ├── Toolbar.js      # 우측 고정 버튼 (관리자 로그인, 서류함, 출결 링크)
│   │   ├── Hero.js         # 히어로 배너 + 통계 카드
│   │   ├── Notice.js       # 공지사항 / 가정통신문
│   │   ├── Calendar.js     # 월별 캘린더 + 일별 시간표
│   │   ├── Meal.js         # 주간 식단표
│   │   ├── Attendance.js   # 출석 현황 요약
│   │   ├── Gallery.js      # 활동 갤러리
│   │   ├── Absence.js      # 조퇴/결석 신청서
│   │   ├── Medication.js   # 투약 의뢰서 + 일정표
│   │   ├── Pickup.js       # 저학년 픽업 일정표
│   │   ├── Register.js     # 신규 등록 + 상담 신청
│   │   ├── Contact.js      # 긴급 연락처
│   │   └── Footer.js       # 푸터 + 관리자 바
│   └── hooks/              # 11개 훅 (로직 + DOM 조작)
│       ├── useAdmin.js     # 관리자 로그인/로그아웃, onAdminRender 콜백
│       ├── useNotices.js   # 공지 CRUD, 모달 상세보기
│       ├── useCalendar.js  # 캘린더 렌더링, 월 이동, 일정 표시
│       ├── useMeal.js      # 식단 주간 네비게이션
│       ├── useAttendance.js# localStorage에서 출결 읽기, 30초 자동 갱신
│       ├── useAbsence.js   # 결석/조퇴 폼 제출 → 서류함
│       ├── useMedication.js# 투약 의뢰 제출 + 일정 관리
│       ├── usePickup.js    # 픽업 테이블 주간 렌더링
│       ├── useGallery.js   # 갤러리 CRUD, FileReader 이미지 업로드
│       ├── useRegister.js  # 등록/상담 폼 제출 → 서류함
│       └── useInbox.js     # 서류함 모달 (탭 필터, 출력 기능)
│
├── css/                    # 메인 CSS 모듈 (ID 스코핑 적용)
│   ├── base.css            # 리셋, CSS 변수, 공통 (input, button, modal, 애니메이션)
│   ├── nav.css             # nav 요소
│   ├── toolbar.css         # .fixed-toolbar, .admin-bar, .admin-only
│   ├── hero.css            # #hero (히어로 + 통계 카드)
│   ├── notice.css          # #notice (업로드 폼) + 공지 카드 (글로벌, 모달에서도 사용)
│   ├── calendar.css        # #schedule + 공유 nav (#meal, #pickup의 month-btn)
│   ├── meal.css            # #meal
│   ├── attendance.css      # #attendance
│   ├── gallery.css         # #gallery
│   ├── form.css            # 공통 폼 + #medication, #pickup, #register 전용
│   ├── contact.css         # #contact + #footer
│   ├── inbox.css           # #inboxModal + 글로벌 badge
│   ├── print.css           # @media print
│   └── responsive.css      # 768px / 480px 브레이크포인트
│
├── attendance.html         # 출결 시스템 (12줄 셸, 태블릿 전용)
├── attendance.css          # 출결 CSS @import 인덱스
│
└── att/                    # 출결 시스템 JS + CSS
    ├── app.js              # 진입점: 4개 화면 조립 → #app 마운트
    ├── data.js             # 상수, DEFAULT_STUDENTS, localStorage 헬퍼
    ├── components/         # 4개 화면 컴포넌트
    │   ├── LockScreen.js   # 잠금 화면 (비밀번호 입력)
    │   ├── MainScreen.js   # 메인 (번호 입력 패드 + 시계)
    │   ├── SuccessScreen.js# 등원/하원 성공 피드백
    │   └── AdminScreen.js  # 관리 (출결 기록 + 아동 관리 탭)
    ├── hooks/              # 7개 훅
    │   ├── useScreen.js    # 화면 전환, 히스토리 관리, 뒤로가기 방지
    │   ├── useLock.js      # 잠금 화면 입력
    │   ├── useInput.js     # 4자리 번호 입력 → 출결 기록 → 성공 화면
    │   ├── useAdmin.js     # 관리 화면 렌더링, 타임라인, CSV 내보내기
    │   ├── useManage.js    # 아동 CRUD (추가/수정/삭제)
    │   ├── useClock.js     # 실시간 시계
    │   └── useBell.js      # Web Audio API 종소리 (등원↑ / 하원↓)
    └── css/                # 8개 CSS 모듈 (ID 스코핑)
        ├── base.css        # 리셋, 변수, .screen, .hidden, .dot
        ├── lock.css        # #screenLock
        ├── numpad.css      # .numpad (잠금+메인 공유)
        ├── main.css        # #screenMain + .admin-toggle + .back-to-main
        ├── success.css     # #screenSuccess
        ├── admin.css       # #screenAdmin (헤더, 탭, 요약, 타임라인)
        ├── manage.css      # #screenAdmin 아동 관리 탭
        └── responsive.css  # 480px / 768px / 가로 모드
```

## 기능 목록

### 메인 페이지 (index.html)

| 기능 | 설명 | 권한 |
|------|------|------|
| 공지사항 / 가정통신문 | CRUD, 파일 첨부, 모달 상세보기 | 관리자: 전체 / 학부모: 읽기 |
| 캘린더 & 학사일정 | 월별 캘린더, 학교별 색상 구분 (증산초🟢, 수색초🔵, 증산중🟣, 공휴일🔴) | 전체: 읽기 |
| 일별 시간표 | 평일 09:00~19:00, 색상 점으로 활동 구분 | 전체: 읽기 |
| 식단표 | 주간 점심/간식, 주 이동, 오늘 하이라이트 | 전체: 읽기 |
| 출석 현황 | localStorage 연동, 30초 자동 갱신 | 전체: 읽기 |
| 활동 갤러리 | 카드형 사진, FileReader 업로드 | 관리자: CRUD / 학부모: 읽기 |
| 조퇴/결석 신청서 | 공식 양식, 동의 체크, 출력/온라인 제출 | 전체: 제출 |
| 투약 의뢰서 & 일정 | 약 정보 + 투약 중 아동 목록 | 관리자: 삭제 / 학부모: 제출 |
| 픽업 일정표 | 주간 테이블, 상태(완료/대기/예정) | 전체: 읽기 |
| 신규 원생 등록 | 아동/보호자 정보, 희망 요일, 동의서 | 전체: 제출 |
| 상담 신청 | 주제/일시/내용 | 전체: 제출 |
| 서류함 | 제출된 모든 서류 통합 관리, 유형별 탭, 출력 | 관리자 전용 |
| 긴급 연락처 | tel: 링크로 바로 전화 | 전체: 읽기 |

### 출결 시스템 (attendance.html)

| 기능 | 설명 |
|------|------|
| 잠금 화면 | 비밀번호 4자리 입력으로 잠금 해제 |
| 번호 입력 패드 | 4자리 학생 번호 입력 |
| 자동 등/하원 판별 | 첫 태그=등원, 재태그=하원, 종소리 구분 |
| SMS 시뮬레이션 | 보호자 번호로 발송 예정 표시, 60초 내 취소 가능 |
| 관리 화면 | 출결 타임라인, 요약 카드 (출석/하원/미출석) |
| 아동 관리 | 학생 CRUD (비밀번호 보호) |
| CSV 내보내기 | 엑셀 다운로드 |
| 가로 모드 최적화 | 태블릿 가로 모드 2분할 레이아웃 |

## 관리자 시스템

- **비밀번호**: `1234` (메인: `sampleData.js`의 `ADMIN_PASSWORD` / 출결: `att/data.js`의 `ATT_PASSWORD`)
- **메인 로그인**: 우측 고정 툴바 "관리자 로그인" → 비밀번호 모달
- **로그인 효과**: `body.admin-mode` 클래스 → `.admin-only` 요소 표시
- **출결 로그인**: 잠금 화면 비밀번호 + 아동 관리 탭 별도 비밀번호

## 데이터 저장

| 데이터 | 저장 방식 | 위치 |
|--------|-----------|------|
| 공지, 식단, 투약, 갤러리 등 | JS 변수 (휘발성) | `sampleData.js` |
| 학사일정 | JS 객체 (정적) | `schoolEvents.js` |
| 출결 기록 | localStorage | 키: `att_YYYY-MM-DD` |
| 학생 목록 | localStorage | 키: `att_students` |

### 향후 백엔드 전환

| 현재 | 전환 대상 | 비고 |
|------|-----------|------|
| JS 변수 | Firebase Firestore | `firebase.js` 설정 완료 |
| localStorage | Firebase Firestore | 출결 기록 |
| 문자 시뮬레이션 | 알리고 API (SMS) | 건당 ~12원 |
| 하드코딩 비밀번호 | Firebase Auth | 실제 인증 |

## CSS 구조

- **모듈화**: `style.css` / `attendance.css`가 @import 인덱스 역할
- **ID 스코핑**: 각 섹션 CSS가 `#sectionId .class` 형태로 충돌 방지
- **글로벌 유지**: `base.css` (공통 UI), `notice-card` 계열 (모달에서도 사용), `.numpad` (잠금+메인 공유)
- **공유 스타일**: `month-btn`/`month-label`은 `#schedule`, `#meal`, `#pickup` 세 섹션에 적용
- **디자인 변수**: `:root`에 색상, 그림자, 간격, 폰트, 트랜지션 정의

## 초기화 흐름

### 메인 (js/app.js)
1. 14개 컴포넌트 import → HTML 문자열 조합 → `#app.innerHTML`에 마운트
2. `onAdminRender`에 재렌더 콜백 등록 (공지, 결석, 투약, 갤러리, 픽업, 서류함)
3. IntersectionObserver로 `.fade-up` 스크롤 애니메이션 설정
4. 각 훅의 `init()` 호출

### 출결 (att/app.js)
1. 4개 화면 컴포넌트 → `#app.innerHTML`에 마운트
2. 훅 import (side-effect로 `window` 함수 등록)
3. `initClock()`, `initNavigation()` 호출

## 참고

- 아동 이름: 데모용 "홍길동" 통일
- 숫자 데이터: 99로 플레이스홀더
- 연락처: XXX-XXXX로 플레이스홀더
- 학사일정: 2026학년도 서울시 기준
- 실제 운영 시 위 데이터를 실제 값으로 교체 필요
