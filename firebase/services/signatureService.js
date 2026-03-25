// ===== 전자서명 Storage 서비스 =====
// 전자서명 PNG dataURL을 Storage에 업로드하고 URL 반환

import { storage } from '../config.js';
import { ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

export async function uploadSignature(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;
  const storageRef = ref(storage, `signatures/${Date.now()}.png`);
  await uploadString(storageRef, dataUrl, 'data_url');
  return await getDownloadURL(storageRef);
}
