// ===== Firebase 초기화 =====
// 앱 전체에서 공유하는 Firebase 인스턴스

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPoHWA-Ty5Z_ij34p9SOp_fjI_y9x9E1g",
  authDomain: "sungsan-center.firebaseapp.com",
  projectId: "sungsan-center",
  storageBucket: "sungsan-center.firebasestorage.app",
  messagingSenderId: "411205546719",
  appId: "1:411205546719:web:7b20d8c02d6391787faf6a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
