import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyA9-M7WGQu94R53i5wSEN8oLcTBUry6FG8",
  authDomain: "trellis-1ddec.firebaseapp.com",
  projectId: "trellis-1ddec",
  storageBucket: "trellis-1ddec.firebasestorage.app",
  messagingSenderId: "973515954816",
  appId: "1:973515954816:web:d4c10a8484ce55b3632465",
  measurementId: "G-ZMDDYE002F"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);