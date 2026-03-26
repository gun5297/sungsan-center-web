// ===== 마이페이지 진입점 =====
import { initEvents } from './events.js';
initEvents();

import './toast.js';
import './confirm.js';
import { initMyPage } from './hooks/useMyPage.js';
import { initSessionTimeout } from '../firebase/auth.js';

document.getElementById('app').innerHTML = '<div class="auth-page"><div class="auth-container" id="mypageRoot"></div></div>';
initMyPage();
initSessionTimeout();
