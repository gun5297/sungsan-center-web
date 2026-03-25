// ===== 마이페이지 진입점 =====
import { initMyPage } from './hooks/useMyPage.js';

document.getElementById('app').innerHTML = '<div class="auth-page"><div class="auth-container" id="mypageRoot"></div></div>';
initMyPage();
