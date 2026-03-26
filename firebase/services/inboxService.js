// ===== 서류함 Firestore 서비스 =====
// 전환 대상: js/hooks/useInbox.js
//
// 현재: inboxItems 배열 (JS 변수, 휘발성)
// 전환: Firestore inbox 컬렉션
//
// 서류함은 결석/투약/등록/상담 제출 시 자동 추가됨
// 각 서비스(absenceService, medicationService 등)에서 제출 시 이 서비스도 호출
//
// type: 'absence' | 'medication' | 'register' | 'consult'

import { inboxCol } from '../collections.js';
import {
  doc, getDocs, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

// 실시간 구독
export function subscribeInbox(callback) {
  const q = query(inboxCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, (error) => {
    console.error('서류함 구독 오류:', error);
  });
}

// 전체 조회
export async function getInboxItems() {
  const q = query(inboxCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 접수번호 생성 — Date.now() 마지막 6자리(ms 단위)로 동시 접수 충돌 방지
function generateReceiptNo(type) {
  const prefix = { absence: 'ABS', medication: 'MED', register: 'REG', consult: 'CON' };
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const ts = String(Date.now()).slice(-6);
  return `${prefix[type] || 'DOC'}-${date}-${ts}`;
}

// 서류 추가 (폼 제출 시 호출)
export async function addInboxItem({ type, name, summary, date, data, consents }) {
  const receiptNo = generateReceiptNo(type);
  const docRef = await addDoc(inboxCol, {
    type, name, summary, date, data, consents, receiptNo,
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, receiptNo };
}

// 내 아동 이름으로 제출 서류 조회
export async function getMySubmissions(childNames) {
  if (!childNames || childNames.length === 0) return [];
  const q = query(inboxCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  // name 필드에 아동 이름이 포함된 항목 필터링
  return items.filter(item =>
    childNames.some(name => item.name && item.name.includes(name))
  );
}

// 서류 삭제
export async function deleteInboxItem(id) {
  const ref = doc(db, 'inbox', id);
  return await deleteDoc(ref);
}
