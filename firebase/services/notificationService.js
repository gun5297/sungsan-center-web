// ===== 알림 서비스 (카카오 알림톡 연동 준비) =====
// 현재: Firestore에 알림 큐를 저장 → 추후 Cloud Functions에서 카카오 API 호출
// 실제 발송은 서버(Cloud Functions) 배포 후 활성화

import { db } from '../config.js';
import {
  collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const notiCol = collection(db, 'notifications');

// 알림 유형
export const NOTI_TYPES = {
  ATTENDANCE_IN: 'attendance_in',     // 등원 알림
  ATTENDANCE_OUT: 'attendance_out',   // 하원 알림
  NOTICE_NEW: 'notice_new',          // 새 공지사항
  MEDICATION_DONE: 'medication_done', // 투약 완료
  ABSENCE_CONFIRM: 'absence_confirm', // 결석 승인
};

// 알림 큐에 추가 (Cloud Functions가 처리할 예정)
export async function queueNotification({ type, recipientPhone, recipientName, childName, message, data }) {
  return await addDoc(notiCol, {
    type,
    recipientPhone,
    recipientName,
    childName: childName || '',
    message,
    data: data || {},
    status: 'pending', // pending → sent → failed
    createdAt: serverTimestamp()
  });
}

// 보호자에게 출결 알림 큐잉
export async function queueAttendanceNotification(childName, parentPhone, parentName, type) {
  const isIn = type === 'in';
  const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  await queueNotification({
    type: isIn ? NOTI_TYPES.ATTENDANCE_IN : NOTI_TYPES.ATTENDANCE_OUT,
    recipientPhone: parentPhone,
    recipientName: parentName,
    childName,
    message: `[성산지역아동센터] ${childName} 학생이 ${time}에 ${isIn ? '등원' : '하원'}하였습니다.`
  });
}

// 투약 완료 알림 큐잉
export async function queueMedicationNotification(childName, drug, completedBy) {
  await queueNotification({
    type: NOTI_TYPES.MEDICATION_DONE,
    recipientPhone: '', // 추후 아동-보호자 연결에서 조회
    recipientName: '',
    childName,
    message: `[성산지역아동센터] ${childName} 학생의 ${drug} 투약이 완료되었습니다. (담당: ${completedBy})`
  });
}

// 새 공지 알림 큐잉 (전체 보호자)
export async function queueNoticeNotification(title) {
  await queueNotification({
    type: NOTI_TYPES.NOTICE_NEW,
    recipientPhone: 'all', // Cloud Functions에서 전체 학부모 조회
    recipientName: '전체',
    message: `[성산지역아동센터] 새 공지가 등록되었습니다: ${title}`
  });
}

// 최근 알림 내역 조회 (관리자용)
export async function getRecentNotifications(count = 20) {
  const q = query(notiCol, orderBy('createdAt', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 알림 상태 업데이트 (Cloud Functions용)
export async function updateNotificationStatus(id, status) {
  const ref = doc(db, 'notifications', id);
  await updateDoc(ref, { status });
}
