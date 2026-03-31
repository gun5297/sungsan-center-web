// ===== 사용 가이드 페이지 =====
import { initEvents, on } from './events.js';
initEvents();
import './toast.js';

const GUIDES = [
  {
    title: '공지사항 작성하기',
    audience: 'admin',
    steps: [
      '메인 페이지에서 "공지사항" 섹션으로 이동합니다.',
      '"새 공지 작성" 버튼을 클릭합니다.',
      '제목, 내용, 분류를 입력하고 필요시 파일을 첨부합니다.',
      '"등록" 버튼을 누르면 공지가 게시됩니다.',
      '게시된 공지는 수정/삭제가 가능합니다.'
    ]
  },
  {
    title: '출석 확인하기',
    audience: 'admin',
    steps: [
      '우상단 메뉴(+)를 열고 "출석"을 클릭합니다.',
      '출석 태블릿 화면에서 아동이 직접 체크인합니다.',
      '메인 페이지 "출석 현황"에서 실시간 현황을 확인합니다.',
      '"출석기록" 페이지에서 날짜별 상세 기록을 볼 수 있습니다.'
    ]
  },
  {
    title: '아동 관리하기',
    audience: 'admin',
    steps: [
      '우상단 메뉴에서 "아동관리"를 클릭합니다.',
      '"아동 추가" 버튼으로 새 아동을 등록합니다.',
      '이름, 학교, 보호자 정보, 알레르기 등을 입력합니다.',
      '기존 아동의 "수정" 버튼으로 정보를 변경합니다.',
      '"퇴소" 버튼으로 퇴소 처리합니다 (데이터는 보존됩니다).'
    ]
  },
  {
    title: '회원 계정 승인하기',
    audience: 'admin',
    steps: [
      '마이페이지로 이동합니다.',
      '"승인 대기 계정" 섹션에서 가입 신청을 확인합니다.',
      '"승인" 또는 "거절" 버튼을 클릭합니다.',
      '"계정 관리" 섹션에서 역할 변경 및 비활성화가 가능합니다.'
    ]
  },
  {
    title: '데이터 백업하기',
    audience: 'admin',
    steps: [
      '마이페이지 → "데이터 내보내기" 섹션으로 이동합니다.',
      '"전체 데이터 백업 (Excel)" 버튼을 클릭합니다.',
      'Excel 파일이 자동으로 다운로드됩니다.',
      '매월 1회 이상 백업을 권장합니다.',
      '삭제된 데이터는 "휴지통"에서 복구할 수 있습니다.'
    ]
  },
  {
    title: '서류함 관리하기',
    audience: 'admin',
    steps: [
      '우상단 메뉴에서 "서류함"을 클릭합니다.',
      '학부모가 제출한 결석/투약/등록/상담 서류를 확인합니다.',
      '탭으로 유형별 필터링, 검색/정렬이 가능합니다.',
      '"출력" 버튼으로 공식 양식을 인쇄합니다.',
      '"수정" 버튼으로 내용을 수정할 수 있습니다.'
    ]
  },
  {
    title: '결석/조퇴 신청하기',
    audience: 'general',
    steps: [
      '메인 페이지에서 "결석/조퇴 신청서" 섹션으로 이동합니다.',
      '구분(결석/조퇴/지각), 아동 이름, 사유를 입력합니다.',
      '날짜를 선택하고 동의 항목에 체크합니다.',
      '"제출하기" 버튼을 누르면 접수번호가 발급됩니다.',
      '제출 이력은 우상단 메뉴 "내 제출 이력"에서 확인합니다.'
    ]
  },
  {
    title: '투약 의뢰하기',
    audience: 'general',
    steps: [
      '메인 페이지에서 "투약 의뢰" 섹션으로 이동합니다.',
      '아동 이름, 약 이름, 용량, 투약 시간을 입력합니다.',
      '동의 항목에 모두 체크하고 전자서명합니다.',
      '"제출하기" 버튼을 누르면 접수됩니다.'
    ]
  },
  {
    title: '내 아이 연결하기',
    audience: 'general',
    steps: [
      '마이페이지로 이동합니다.',
      '"내 아이 관리" 섹션에서 "아이 연결하기" 버튼을 클릭합니다.',
      '목록에서 내 아이를 검색하고 선택합니다.',
      '관계(부/모 등)를 선택하고 "연결" 버튼을 누릅니다.',
      '연결되면 메인 페이지에서 내 아이의 출석을 확인할 수 있습니다.'
    ]
  },
  {
    title: '시스템 오류 대응하기',
    audience: 'admin',
    steps: [
      '대시보드의 "시스템 상태" 카드를 확인합니다.',
      '빨간색이면 클릭하여 오류 내용과 해결 방법을 확인합니다.',
      '"캐시 초기화" 버튼으로 오래된 캐시를 삭제할 수 있습니다.',
      '인터넷 연결이 끊어진 경우 Wi-Fi/데이터를 확인해 주세요.',
      '문제가 지속되면 개발자에게 문의해 주세요.'
    ]
  }
];

document.getElementById('app').innerHTML = `
  <div class="auth-page">
    <div class="auth-container guide-container">
      <a href="index.html" class="auth-logo">성산<span>지역아동센터</span></a>
      <h1 class="guide-title">사용 가이드</h1>
      <div class="guide-list">
        ${GUIDES.map((g, i) => `
          <div class="guide-card" data-action="toggleGuide" data-index="${i}">
            <div class="guide-card-header">
              <span class="guide-card-title">${g.title}</span>
              <span class="guide-card-audience guide-card-audience-${g.audience === 'admin' ? 'admin' : 'general'}">${g.audience === 'admin' ? '관리자' : '학부모'}</span>
            </div>
            <div class="guide-card-body hidden" id="guideBody${i}">
              <ol>${g.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            </div>
          </div>
        `).join('')}
      </div>
      <a href="mypage.html" class="mypage-back-link">&larr; 마이페이지로</a>
    </div>
  </div>
`;

on('toggleGuide', (e, el) => {
  const card = el.closest('.guide-card');
  const index = card?.dataset.index;
  if (index == null) return;
  const body = document.getElementById('guideBody' + index);
  if (body) body.classList.toggle('hidden');
});
