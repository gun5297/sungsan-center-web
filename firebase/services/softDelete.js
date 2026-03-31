// ===== Soft Delete 공유 유틸리티 =====
// 5개 서비스(absence, child, inbox, medication, notice)에서 공통 사용

import {
  doc, getDocs, updateDoc, deleteDoc, query, orderBy, serverTimestamp, deleteField
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from '../config.js';

export function makeSoftDelete(collectionName, collectionRef) {
  return {
    async softDelete(id) {
      return await updateDoc(doc(db, collectionName, id), { deletedAt: serverTimestamp() });
    },
    async restore(id) {
      return await updateDoc(doc(db, collectionName, id), { deletedAt: deleteField() });
    },
    async permanentDelete(id) {
      return await deleteDoc(doc(db, collectionName, id));
    },
    async getDeleted() {
      const q = query(collectionRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.deletedAt);
    }
  };
}
