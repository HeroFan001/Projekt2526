import firebaseConfig from '../config';
import firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDEWLAX4NNKQEinc2598HQExSpqVOB44xk",
  authDomain: "prj2526-a6351.firebaseapp.com",
  databaseURL: "https://prj2526-a6351-default-rtdb.firebaseio.com",
  projectId: "prj2526-a6351",
  storageBucket: "prj2526-a6351.firebasestorage.app",
  messagingSenderId: "446203117002",
  appId: "1:446203117002:web:0bd186f53199041e0da333"
};

firebase.initializeApp(firebaseConfig); 
export const auth = firebase.auth();