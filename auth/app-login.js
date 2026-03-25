// ===== 로그인 페이지 진입점 =====
import { LoginForm } from './components/LoginForm.js';
import { initLogin } from './hooks/useLogin.js';

// 1단계: 컴포넌트 마운트
document.getElementById('app').innerHTML = LoginForm();

// 2단계: 훅 초기화
initLogin();
