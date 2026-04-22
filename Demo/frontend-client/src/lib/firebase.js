import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAJBKL3ODddvEfF-F6E6mUAKfOZLq4tp4g",
  authDomain: "fixithub-5fe6e.firebaseapp.com",
  projectId: "fixithub-5fe6e",
  storageBucket: "fixithub-5fe6e.firebasestorage.app",
  messagingSenderId: "195418006444",
  appId: "1:195418006444:web:9963dceedc260bb5625009",
  measurementId: "G-EJJ91HJXYM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, db, storage, functions };

