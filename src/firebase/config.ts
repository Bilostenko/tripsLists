import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUOvm7MSy0MA19fvkj14sYjyB_XPKvj7M",
  authDomain: "traveltracker-app-1c2fc.firebaseapp.com",
  projectId: "traveltracker-app-1c2fc",
  storageBucket: "traveltracker-app-1c2fc.firebasestorage.app",
  messagingSenderId: "197953642017",
  appId: "1:197953642017:web:b17756bf4ceb941bba4d60"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);