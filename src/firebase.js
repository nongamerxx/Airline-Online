import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// วาง config ของคุณตรงนี้
const firebaseConfig = {
    apiKey: "AIzaSyDRlvFbB0cCT3vffazYKZXJglqLlDWuSDg",
    authDomain: "dr-songkran.firebaseapp.com",
    projectId: "dr-songkran",
    storageBucket: "dr-songkran.firebasestorage.app",
    messagingSenderId: "358270433376",
    appId: "1:358270433376:web:f398aed2bbac0a08602b05",
    measurementId: "G-14K1FKGEBB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);