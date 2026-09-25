import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC70E9FrMpOLYrFLYFlTXu6XGiu6nWdMPM",
  authDomain: "caffe-manegment.firebaseapp.com",
  projectId: "caffe-manegment",
  storageBucket: "caffe-manegment.firebasestorage.app",
  messagingSenderId: "1010047469459",
  appId: "1:1010047469459:web:f4090068f176df51b6ca66",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export default app;