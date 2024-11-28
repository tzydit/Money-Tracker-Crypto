import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6QMysflfyaS1gdoNpwqqZz7OUWxFWnAk",
  authDomain: "crypto-dashboard-145dd.firebaseapp.com",
  projectId: "crypto-dashboard-145dd",
  storageBucket: "crypto-dashboard-145dd.firebasestorage.app",
  messagingSenderId: "875032611725",
  appId: "1:875032611725:web:f2197799068138d90f8bc4",
  measurementId: "G-3HYE3WQN6C",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); 
const analytics = getAnalytics(app);
