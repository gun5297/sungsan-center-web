// ===== Firebase 초기화 =====
// 앱 전체에서 공유하는 Firebase 인스턴스

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-check.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPoHWA-Ty5Z_ij34p9SOp_fjI_y9x9E1g",
  authDomain: "sungsan-center.firebaseapp.com",
  projectId: "sungsan-center",
  storageBucket: "sungsan-center.firebasestorage.app",
  messagingSenderId: "411205546719",
  appId: "1:411205546719:web:7b20d8c02d6391787faf6a"
};

const app = initializeApp(firebaseConfig);

// ===== App Check (reCAPTCHA v3) =====
// 봇/스크립트 도구의 Firestore 직접 접근 차단
// RECAPTCHA_SITE_KEY: Google reCAPTCHA 관리 콘솔에서 발급
// https://www.google.com/recaptcha/admin/create (유형: reCAPTCHA v3)
const RECAPTCHA_SITE_KEY = '6LdfipgsAAAAAK7_6Czc055MFcKn9-KX-GkpBydv';

if (RECAPTCHA_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn('[config] App Check 초기화 실패 (기능에 영향 없음):', e);
  }
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
