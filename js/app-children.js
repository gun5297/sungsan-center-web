// ===== 아동관리 진입점 =====
import { initEvents } from './events.js';
initEvents();

import './toast.js';
import './confirm.js';
import { initChildren } from './hooks/useChildren.js';
import { initSessionTimeout } from '../firebase/auth.js';

document.getElementById('app').innerHTML = '<div class="ch-page"><div id="childrenRoot"></div></div>';
initChildren();
initSessionTimeout();
