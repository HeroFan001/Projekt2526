import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEWLAX4NNKQEinc2598HQExSpqVOB44xk",
  authDomain: "prj2526-a6351.firebaseapp.com",
  databaseURL: "https://prj2526-a6351-default-rtdb.firebaseio.com",
  projectId: "prj2526-a6351",
  storageBucket: "prj2526-a6351.appspot.com",
  messagingSenderId: "446203117002",
  appId: "1:446203117002:web:0bd186f53199041e0da333"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);