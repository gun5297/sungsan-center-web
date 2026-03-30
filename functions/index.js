const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const crypto = require("crypto");

initializeApp();
const db = getFirestore();

// PIN pepper — 서버에만 존재, 클라이언트에 노출 안 됨
const PIN_PEPPER = "sungsan2026#$center@att";

function hashPin(input) {
  return crypto.createHash("sha256").update(PIN_PEPPER + input).digest("hex");
}

// PIN 검증 Cloud Function
exports.verifyPin = onCall({ region: "asia-northeast3" }, async (request) => {
  const pin = request.data.pin;
  if (!pin || typeof pin !== "string" || pin.length < 4 || pin.length > 8) {
    throw new HttpsError("invalid-argument", "잘못된 PIN 형식");
  }

  // Firestore에서 저장된 해시 읽기
  const doc = await db.doc("publicConfig/attLock").get();
  if (!doc.exists || !doc.data().hash) {
    // 해시가 없으면 기본 PIN 해시 생성 후 저장
    const defaultHash = hashPin("240446");
    await db.doc("publicConfig/attLock").set({ hash: defaultHash }, { merge: true });
    return { valid: pin === "240446" };
  }

  const storedHash = doc.data().hash;
  const inputHash = hashPin(pin);
  return { valid: storedHash === inputHash };
});

// PIN 변경 Cloud Function (관리자 전용)
exports.changePin = onCall({ region: "asia-northeast3" }, async (request) => {
  // 인증 확인
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "로그인이 필요합니다");
  }

  // 관리자 권한 확인
  const userDoc = await db.doc(`users/${request.auth.uid}`).get();
  if (!userDoc.exists) {
    throw new HttpsError("permission-denied", "사용자를 찾을 수 없습니다");
  }
  const userData = userDoc.data();
  const adminRoles = ["admin", "director", "teacher", "social_worker"];
  if (!adminRoles.includes(userData.role) || !userData.approved) {
    throw new HttpsError("permission-denied", "관리자 권한이 필요합니다");
  }

  const newPin = request.data.pin;
  if (!newPin || typeof newPin !== "string" || newPin.length < 6) {
    throw new HttpsError("invalid-argument", "PIN은 6자리 이상이어야 합니다");
  }

  const newHash = hashPin(newPin);
  await db.doc("publicConfig/attLock").set({ hash: newHash }, { merge: true });
  return { success: true };
});
