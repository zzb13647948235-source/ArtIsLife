import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAqxSTYim77L4Pj5_RyMsT9UDlWs5VliOE",
  authDomain: "artislife-7384f.firebaseapp.com",
  projectId: "artislife-7384f",
  storageBucket: "artislife-7384f.firebasestorage.app",
  messagingSenderId: "903244105465",
  appId: "1:903244105465:web:6d28c446ad2a47d09c4428"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
