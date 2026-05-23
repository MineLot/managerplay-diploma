// app/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD...", // ← ВСТАВЬТЕ ВАШИ ДАННЫЕ
  authDomain: "managerplay-dev.firebaseapp.com",
  projectId: "managerplay-dev",
  storageBucket: "managerplay-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};

// Инициализация приложения
const app = initializeApp(firebaseConfig);

// Экспорт сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);