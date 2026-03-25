# 성산지역아동센터 웹사이트 — TODO

## 완료된 작업
- [x] HTML 컴포넌트 모듈화 (index.html 747줄 → 16줄 셸 + 14개 컴포넌트)
- [x] JS 훅 패턴 분리 (script.js → 11개 hooks + state/utils)
- [x] CSS ID 스코핑 적용 (섹션별 충돌 방지)
- [x] 출결 시스템 모듈화 (attendance 3파일 → 21개 모듈)
- [x] Firebase 모듈 구조 설계 (firebase/ 디렉토리 스캐폴딩)

---

## 1단계: Firebase 연동 (데모 → Firestore)

### 인증
- [ ] Firebase Auth 설정 (Firebase 콘솔에서 이메일/비밀번호 인증 활성화)
- [ ] `useAdmin.js` → `firebase/auth.js` 연동 (하드코딩 비밀번호 제거)
- [ ] 출결 `useLock.js` / `useManage.js` → Firebase Auth 연동
- [ ] 기존 `firebase.js` (루트) 삭제 → `firebase/config.js`로 완전 대체

### 메인 페이지 hooks 전환
- [ ] `useNotices.js` → `noticeService.js` 연동 (공지사항 CRUD)
- [ ] `useMeal.js` → `mealService.js` 연동 (식단표)
- [ ] `useAbsence.js` → `absenceService.js` 연동 (결석/조퇴 신청)
- [ ] `useMedication.js` → `medicationService.js` 연동 (투약 의뢰)
- [ ] `useGallery.js` → `galleryService.js` 연동 (갤러리 + Storage 이미지)
- [ ] `usePickup.js` → `pickupService.js` 연동 (픽업 일정)
- [ ] `useInbox.js` → `inboxService.js` 연동 (서류함)
- [ ] `useRegister.js` → 등록/상담 제출 시 Firestore 저장

### 출결 시스템 전환
- [ ] `att/data.js` localStorage → `studentService.js` 연동 (학생 목록)
- [ ] `att/hooks/useInput.js` → `attendanceService.js` 연동 (출결 기록)
- [ ] `att/hooks/useAdmin.js` → Firestore 기반 타임라인/요약

### 데모 데이터 정리
- [ ] `sampleData.js` → 실제 데이터로 교체 또는 Firestore 초기 시드로 활용
- [ ] Firestore 연동 완료 후 `sampleData.js` 제거

---

## 2단계: 보안 & 규칙

- [ ] Firestore 보안 규칙 작성 (읽기: 전체, 쓰기: 인증된 관리자만)
- [ ] Storage 보안 규칙 작성 (갤러리 이미지 업로드 제한)
- [ ] 관리자 계정 생성 (Firebase 콘솔)
- [ ] API 키 도메인 제한 설정 (Firebase 콘솔 → 승인된 도메인)

---

## 3단계: 실운영 준비

- [ ] 데모 데이터 → 실제 센터 데이터 입력 (아동 이름, 연락처 등)
- [ ] 학사일정 `schoolEvents.js` 실제 2026 일정 확인/수정
- [ ] SMS 연동 (알리고 API) — 출결 알림 문자 발송 (건당 ~12원)
- [ ] 도메인 연결 (선택사항)
- [ ] HTTPS 인증서 확인 (GitHub Pages 기본 제공)

---

## 개선 사항 (우선순위 낮음)

- [ ] 이미지 최적화 (갤러리 업로드 시 리사이즈/압축)
- [ ] 오프라인 캐싱 (Firestore `enablePersistence`)
- [ ] PWA 설정 (manifest.json, service worker) — 태블릿 홈화면 앱
- [ ] 접근성 개선 (ARIA 라벨, 키보드 네비게이션)
- [ ] 출결 시스템 통계/리포트 (월간 출석률 등)
