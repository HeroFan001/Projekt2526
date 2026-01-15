import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEWLAX4NNKQEinc2598HQExSpqVOB44xk",
  authDomain: "prj2526-a6351.firebaseapp.com",
  databaseURL: "https://prj2526-a6351-default-rtdb.firebaseio.com",
  projectId: "prj2526-a6351",
  storageBucket: "prj2526-a6351.firebasestorage.app",
  messagingSenderId: "446203117002",
  appId: "1:446203117002:web:9dafe878eab3617c0da333"
};

const app = initializeApp(firebaseConfig);
// Initialize Firebase
export const auth = getAuth(app);
// Firestore
export const db = getFirestore(app);