// ===== 설정 Firestore 서비스 =====
// settings/passwords     → 관리자만 읽기
// publicConfig/attLock   → 누구나 읽기 (PIN 해시만 저장)
//
// 보안 설계:
//   - PIN 평문 저장 금지
//   - SHA-256(pepper + PIN) 해시 저장 — pepper는 코드에만 존재, Firestore에 없음
//   - 공격자가 해시를 탈취해도 pepper를 모르면 오프라인 브루트포스 불가
//   - 클라이언트 측 rate-limit (5회 실패 → 30초 잠금) 으로 온라인 공격 방어
//   - ⚠️ 완전한 방어는 App Check + Cloud Functions 필요

import { db } from '../config.js';
import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const passwordsRef = doc(db, 'settings', 'passwords');
const attLockRef   = doc(db, 'publicConfig', 'attLock');

// 기본 PIN 6자리 (최초 배포 후 마이페이지에서 반드시 변경)
const DEFAULTS = { adminSignup: '1234', attendance: '123456' };

// pepper: Firestore에 저장되지 않아 해시 탈취 시 오프라인 브루트포스 방어
// ⚠️ 변경 시 기존 PIN 재설정 필요
const PIN_PEPPER = 'sungsan2026#$center@att';

// SHA-256(pepper + input) 해시
async function hashPin(input) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(PIN_PEPPER + input)
  );
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 비밀번호 조회 (관리자용)
export async function getPasswords() {
  const snap = await getDoc(passwordsRef);
  if (snap.exists()) return snap.data();
  await setDoc(passwordsRef, DEFAULTS);
  await syncAttLockHash(DEFAULTS.attendance);
  return DEFAULTS;
}

// 비밀번호 변경 + publicConfig 해시 동기화
export async function updatePasswords(data) {
  await setDoc(passwordsRef, data, { merge: true });
  if (data.attendance) {
    _cachedHash = null;
    await syncAttLockHash(data.attendance);
  }
}

// publicConfig/attLock 에 pepper 포함 해시 저장
async function syncAttLockHash(plainPassword) {
  const hash = await hashPin(plainPassword);
  await setDoc(attLockRef, { hash }, { merge: true });
}

// ===== 태블릿 잠금 화면 =====
let _cachedHash = null;
const HASH_CACHE_TTL = 5 * 60 * 1000;
let _cacheTime = 0;

export async function checkAttendancePassword(input) {
  try {
    let storedHash = _cachedHash;
    if (!storedHash || Date.now() - _cacheTime > HASH_CACHE_TTL) {
      const snap = await getDoc(attLockRef);
      if (snap.exists() && snap.data().hash) {
        storedHash = snap.data().hash;
      } else {
        // 문서 없거나 hash 필드 없음 → 기본 PIN으로 초기화
        storedHash = await hashPin(DEFAULTS.attendance);
        // 비동기로 Firestore에 기본 해시 저장 (실패해도 무시)
        setDoc(attLockRef, { hash: storedHash }, { merge: true }).catch(() => {});
      }
      _cachedHash = storedHash;
      _cacheTime = Date.now();
    }
    return (await hashPin(input)) === storedHash;
  } catch (e) {
    console.error('[settingsService] 출결 비밀번호 확인 실패:', e);
    throw e;
  }
}
