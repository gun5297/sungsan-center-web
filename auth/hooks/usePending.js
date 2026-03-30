// ===== usePending: 승인 대기 페이지 로직 =====
import { auth, db } from '../../firebase/config.js';
import { logout, onAuthChange } from '../../firebase/auth.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export function initPending() {
  document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
    window.location.href = 'login.html';
  });

  // Firestore 실시간 구독: 승인 상태 변경 감지 → 자동 리다이렉트
  onAuthChange((user) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists() && snap.data().approved === true) {
        unsubscribe();
        window.location.href = 'index.html';
      }
    }, (err) => {
      console.warn('[usePending] 승인 상태 구독 실패:', err);
    });
  });
}
