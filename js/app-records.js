// ===== 출석기록 진입점 =====
import { initEvents } from './events.js';
initEvents();

import './toast.js';
import './confirm.js';
import { initRecords } from './hooks/useRecords.js';
import { initSessionTimeout } from '../firebase/auth.js';

document.getElementById('app').innerHTML = '<div class="records-page"><div id="recordsRoot"></div></div>';
initRecords();
initSessionTimeout();
