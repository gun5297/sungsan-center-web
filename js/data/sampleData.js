// ===== 초기 데모 데이터 =====

export const initialNotices = [
  {
    id: 0,
    title: '3월 30일(월) 특식 안내 - 돈까스',
    content: '안녕하세요, 성산지역아동센터입니다.\n\n3월 30일(월) 아이들과 함께 외식을 나갑니다!\n\n🍽️ 메뉴: 돈까스\n📍 장소: 추후 안내\n🕐 시간: 점심시간\n\n맛있는 돈까스 먹으러 가요! 기대해 주세요.\n\n감사합니다.',
    category: '통신문',
    date: '2026.03.25',
    file: null
  },
  {
    id: 1,
    title: '3월 현장학습 안내',
    content: '안녕하세요, 성산지역아동센터입니다.\n\n3월 28일(금) 봄맞이 현장학습을 진행합니다.\n\n장소: OO공원\n시간: 오전 10시 ~ 오후 2시\n준비물: 도시락, 물, 돗자리\n\n참가 동의서를 3월 25일까지 제출해 주세요.\n\n감사합니다.',
    category: '통신문',
    date: '2026.03.22',
    file: '현장학습_동의서.pdf'
  },
  {
    id: 2,
    title: '4월 특별활동 프로그램 변경 안내',
    content: '안녕하세요.\n\n4월부터 특별활동 프로그램이 아래와 같이 변경됩니다.\n\n문의사항은 담임 선생님께 연락 주세요.',
    category: '공지',
    date: '2026.03.20',
    file: null
  },
  {
    id: 3,
    title: '수족구병 주의 안내',
    content: '최근 수족구병이 유행하고 있습니다.\n\n아이에게 발열, 입안 물집, 손발 발진 등의 증상이 있을 경우 등원을 자제하시고 병원 진료를 받아주세요.\n\n센터 내 소독을 강화하고 있으며, 손씻기 지도를 철저히 하겠습니다.',
    category: '긴급',
    date: '2026.03.18',
    file: null
  }
];

export const sampleMeals = {
  lunch: [
    '쌀밥\n된장찌개\n제육볶음\n시금치나물\n깍두기',
    '잡곡밥\n미역국\n생선구이\n콩나물무침\n배추김치',
    '쌀밥\n소고기무국\n계란말이\n오이무침\n깍두기',
    '카레라이스\n유부장국\n과일샐러드\n단무지\n배추김치',
    '비빔밥\n콩나물국\n돈까스\n양배추샐러드\n깍두기'
  ],
  snack: [
    '우유\n고구마',
    '딸기\n식빵',
    '바나나\n요거트',
    '우유\n쿠키',
    '귤\n떡'
  ]
};

export const initialAbsenceRecords = [
  { type: '결석', name: '홍길동', school: '증산초 3학년', reason: '독감 (OO소아과 진료)', from: '2026-03-20', to: '2026-03-21', date: '2026.03.19' },
  { type: '조퇴', name: '홍길동', school: '수색초 2학년', reason: '치과 정기검진', from: '2026-03-18', to: '2026-03-18', date: '2026.03.18' },
];

export const initialMedRecords = [
  { name: '홍길동', drug: '아목시실린', dose: '1포', time: '점심 식후', symptom: '중이염', from: '2026-03-22', to: '2026-03-28', storage: '실온 보관' },
  { name: '홍길동', drug: '타이레놀시럽', dose: '5ml', time: '오후 간식 후', symptom: '감기/발열', from: '2026-03-24', to: '2026-03-26', storage: '실온 보관' },
];

export const initialPickupStudents = [
  { name: '홍길동', school: '증산초 1학년', times: { 월: '13:00', 화: '13:00', 수: '12:30', 목: '13:00', 금: '12:30' } },
  { name: '홍길동', school: '수색초 1학년', times: { 월: '13:10', 화: '13:10', 수: '12:40', 목: '13:10', 금: '12:40' } },
  { name: '홍길동', school: '증산초 2학년', times: { 월: '13:30', 화: '14:00', 수: '13:00', 목: '14:00', 금: '13:00' } },
  { name: '홍길동', school: '수색초 2학년', times: { 월: '13:30', 화: '14:00', 수: '13:00', 목: '14:00', 금: '13:00' } },
  { name: '홍길동', school: '증산초 1학년', times: { 월: '13:00', 화: '13:00', 수: '12:30', 목: '13:00', 금: '12:30' } },
];

export const initialGalleryItems = [
  { title: '봄맞이 미술 수업', category: '미술 활동', date: '2026.03.20', photo: null },
  { title: '실내 체육 시간', category: '체육 활동', date: '2026.03.18', photo: null },
  { title: '봄 현장학습', category: '현장학습', date: '2026.03.15', photo: null },
  { title: '쿠키 만들기', category: '요리 활동', date: '2026.03.12', photo: null },
];

export const initialInboxItems = [
  {
    type: 'absence', name: '홍길동 (결석)', summary: '독감 (OO소아과 진료) | 2026-03-20 ~ 2026-03-21', date: '2026.03.19',
    data: { type: '결석', name: '홍길동', school: '증산초 3학년', guardian: '홍부모', phone: '010-1234-5678', reason: '독감 (OO소아과 진료)', from: '2026-03-20', to: '2026-03-21', absDate: '2026-03-19' },
    consents: ['운영규정 안내 동의']
  },
  {
    type: 'absence', name: '홍길동 (조퇴)', summary: '치과 정기검진 | 2026-03-18', date: '2026.03.18',
    data: { type: '조퇴', name: '홍길동', school: '수색초 2학년', guardian: '홍부모', phone: '010-2345-6789', reason: '치과 정기검진', from: '2026-03-18', to: '2026-03-18', absDate: '2026-03-18' },
    consents: ['운영규정 안내 동의']
  },
  {
    type: 'medication', name: '홍길동 (아목시실린)', summary: '1포 · 점심 식후 · 2026-03-22~2026-03-28', date: '2026.03.22',
    data: { name: '홍길동', drug: '아목시실린', dose: '1포', time: '점심 식후', symptom: '중이염', from: '2026-03-22', to: '2026-03-28', storage: '실온 보관', hospital: 'OO소아과', note: '페니실린 알레르기 없음 확인' },
    consents: ['부작용 안내 동의', '약 정보 책임 확인', '응급조치 동의']
  },
  {
    type: 'medication', name: '홍길동 (타이레놀시럽)', summary: '5ml · 오후 간식 후 · 2026-03-24~2026-03-26', date: '2026.03.24',
    data: { name: '홍길동', drug: '타이레놀시럽', dose: '5ml', time: '오후 간식 후', symptom: '감기/발열', from: '2026-03-24', to: '2026-03-26', storage: '실온 보관', hospital: 'XX의원', note: '' },
    consents: ['부작용 안내 동의', '약 정보 책임 확인', '응급조치 동의']
  },
  {
    type: 'register', name: '홍길동 (신규등록)', summary: '증산초 1학년 · 보호자: 홍부모', date: '2026.03.15',
    data: { name: '홍길동', birth: '2019-05-12', gender: '남', school: '증산초 1학년', guardian: '홍부모', relation: '모', phone: '010-5678-9012', emergency: '010-9999-8888', address: '서울시 은평구 증산동 123-45', days: '월, 화, 수, 목, 금', note: '견과류 알레르기' },
    consents: ['이용규정 동의', '개인정보 수집 동의', '사진촬영 동의']
  },
  {
    type: 'consult', name: '홍길동 (상담)', summary: '교우 관계 · 보호자: 홍부모', date: '2026.03.23',
    data: { guardian: '홍부모', phone: '010-3456-7890', child: '홍길동', dateTime: '2026-03-28T15:00', topic: '교우 관계', detail: '최근 친구와 다툼이 잦아졌다고 합니다. 학교에서도 비슷한 상황이 있는지, 센터에서 어떻게 지도하고 계신지 상담 받고 싶습니다.' },
    consents: ['상담기록 보관 동의']
  },
];

export const GALLERY_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
];

export const ADMIN_PASSWORD = '1234';
