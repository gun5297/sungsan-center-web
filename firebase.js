// ===== Firebase 설정 =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPoHWA-Ty5Z_ij34p9SOp_fjI_y9x9E1g",
  authDomain: "sungsan-center.firebaseapp.com",
  projectId: "sungsan-center",
  storageBucket: "sungsan-center.firebasestorage.app",
  messagingSenderId: "411205546719",
  appId: "1:411205546719:web:7b20d8c02d6391787faf6a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db, auth,
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
};
