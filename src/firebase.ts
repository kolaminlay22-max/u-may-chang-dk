import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDXFwM3NePgs5wvJZdwY9BnWdXW2njE-4",
  authDomain: "u-may-chang.firebaseapp.com",
  projectId: "u-may-chang",
  storageBucket: "u-may-chang.firebasestorage.app",
  messagingSenderId: "474954315801",
  appId: "1:474954315801:web:3f5d10143b4f8153c41288",
  measurementId: "G-VQ7ERZGY0T",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
