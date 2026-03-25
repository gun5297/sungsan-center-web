// ===== 회원가입 페이지 진입점 =====
import { SignupForm } from './components/SignupForm.js';
import { initSignup } from './hooks/useSignup.js';

// 1단계: 컴포넌트 마운트
document.getElementById('app').innerHTML = SignupForm();

// 2단계: 훅 초기화
initSignup();
