// ===== 설정 Firestore 서비스 =====
// settings/passwords     → 관리자만 읽기 (adminSignup 비밀번호 등)
// publicConfig/attLock   → 누구나 읽기 (출결 태블릿 PIN 해시)
//
// 보안 원칙:
//   - 비밀번호 평문을 publicConfig에 저장하지 않음
//   - SHA-256 해시만 저장 → 원문 복원 불가
//   - 4자리 PIN은 짧아 brute-force 가능하지만 useLock.js에서 rate limit으로 보호

import { db } from '../config.js';
import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const passwordsRef   = doc(db, 'settings', 'passwords');
const attLockRef     = doc(db, 'publicConfig', 'attLock');

// 기본 비밀번호 (최초 배포 시 마이페이지에서 반드시 변경)
const DEFAULTS = {
  adminSignup: '1234',
  attendance: '1234'
};

// SHA-256 해시 (Web Crypto API)
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 비밀번호 문서 조회 (관리자용 — isAdmin 체크는 Firestore rules에서 수행)
export async function getPasswords() {
  const snap = await getDoc(passwordsRef);
  if (snap.exists()) return snap.data();
  // 문서가 없으면 기본값으로 생성
  await setDoc(passwordsRef, DEFAULTS);
  // publicConfig에도 해시 동기화
  await syncAttLockHash(DEFAULTS.attendance);
  return DEFAULTS;
}

// 비밀번호 업데이트 + publicConfig 해시 동기화
export async function updatePasswords(data) {
  await setDoc(passwordsRef, data, { merge: true });
  if (data.attendance) {
    _cachedHash = null;
    await syncAttLockHash(data.attendance);
  }
}

// publicConfig/attLock에 해시 저장 (관리자가 비밀번호 변경할 때 호출)
async function syncAttLockHash(plainPassword) {
  const hash = await sha256(plainPassword);
  await setDoc(attLockRef, { hash }, { merge: true });
}

// ===== 태블릿 잠금 화면에서 사용 =====
let _cachedHash = null;
const HASH_CACHE_TTL = 5 * 60 * 1000;
let _cacheTime = 0;

export async function checkAttendancePassword(input) {
  try {
    let storedHash = _cachedHash;
    if (!storedHash || Date.now() - _cacheTime > HASH_CACHE_TTL) {
      const snap = await getDoc(attLockRef);
      storedHash = snap.exists() ? snap.data().hash : await sha256(DEFAULTS.attendance);
      _cachedHash = storedHash;
      _cacheTime = Date.now();
    }
    return (await sha256(input)) === storedHash;
  } catch (e) {
    console.error('[settingsService] 출결 비밀번호 확인 실패:', e);
    throw e;
  }
}
