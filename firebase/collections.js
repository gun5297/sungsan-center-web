// ===== Firestore 컬렉션 레퍼런스 =====
// 모든 서비스에서 공유하는 컬렉션 참조
//
// Firestore 구조:
// ├── notices/           {id, title, content, category, date, file, createdAt}
// ├── meals/             {id, weekKey, lunch[], snack[]}
// ├── students/          {id, name, school, parent}
// ├── attendance/        {id: "YYYY-MM-DD", records: {studentId: {inTime, inTs, outTime, outTs}}}
// ├── absences/          {id, type, name, school, reason, from, to, date, ...}
// ├── medications/       {id, name, drug, dose, time, symptom, from, to, storage, ...}
// ├── pickups/           {id, name, school, times: {월,화,수,목,금}}
// ├── gallery/           {id, title, category, date, photoUrl, createdAt}
// ├── inbox/             {id, type, name, summary, date, data, consents, createdAt}
// └── schoolEvents/      {id: "YYYY-MM-DD", events[]}  (선택: 정적 데이터로 유지 가능)

import { db } from './config.js';
import { collection } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export const noticesCol    = collection(db, 'notices');
export const mealsCol      = collection(db, 'meals');
export const studentsCol   = collection(db, 'students');
export const attendanceCol = collection(db, 'attendance');
export const absencesCol   = collection(db, 'absences');
export const medicationsCol = collection(db, 'medications');
export const pickupsCol    = collection(db, 'pickups');
export const galleryCol    = collection(db, 'gallery');
export const inboxCol      = collection(db, 'inbox');
