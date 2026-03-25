// ===== useAdmin: Firebase Auth + Firestore 역할 기반 관리자 =====
import { getIsAdmin, setIsAdmin, setCurrentUser, setUserRole, isDirector, canManage } from '../state.js';
import { logout, onAuthChange } from '../../firebase/auth.js';
import { getUserDoc, createUserDoc, hasNoDirector } from '../../firebase/services/userService.js';

// 관리자 상태 변경 시 재렌더링할 콜백 목록
let renderCallbacks = [];

export function onAdminRender(fn) {
  renderCallbacks.push(fn);
}

function reRenderAll() {
  renderCallbacks.forEach(fn => fn());
}

export async function toggleAdminLogin() {
  if (getIsAdmin()) {
    await logout();
    setIsAdmin(false);
    setCurrentUser(null);
    setUserRole(null);
    document.body.classList.remove('admin-mode', 'director-mode', 'manage-mode');
    const btn = document.getElementById('toolbarAdminBtn');
    if (btn) { btn.textContent = '로그인'; btn.classList.remove('logged-in'); }
    reRenderAll();
    return;
  }
  window.location.href = 'login.html';
}

export function initAdmin() {
  onAuthChange(async (user) => {
    const btn = document.getElementById('toolbarAdminBtn');

    if (user) {
      // Firestore에서 역할 조회
      let userDoc = await getUserDoc(user.uid);

      // Firestore 문서가 없으면 자동 생성 (Firebase Console에서 직접 만든 계정)
      if (!userDoc) {
        const noDirector = await hasNoDirector();
        await createUserDoc(user.uid, {
          email: user.email,
          name: user.email.split('@')[0],
          role: noDirector ? 'director' : 'teacher',
          phone: ''
        });
        userDoc = await getUserDoc(user.uid);
      }

      // 미승인 계정 처리
      if (!userDoc.approved) {
        await logout();
        alert('센터장의 승인을 기다리고 있습니다.');
        return;
      }

      const role = userDoc.role;
      setIsAdmin(true);
      setCurrentUser({ uid: user.uid, email: user.email, name: userDoc.name, role });
      setUserRole(role);

      // body 클래스 설정
      document.body.classList.add('admin-mode');
      if (role === 'director') document.body.classList.add('director-mode');
      if (role === 'director' || role === 'teacher') document.body.classList.add('manage-mode');

      if (btn) {
        btn.textContent = `${userDoc.name} 로그아웃`;
        btn.classList.add('logged-in');
      }
    } else {
      setIsAdmin(false);
      setCurrentUser(null);
      setUserRole(null);
      document.body.classList.remove('admin-mode', 'director-mode', 'manage-mode');
      if (btn) { btn.textContent = '로그인'; btn.classList.remove('logged-in'); }
    }

    reRenderAll();
  });
}

// window에 노출
window.toggleAdminLogin = toggleAdminLogin;
