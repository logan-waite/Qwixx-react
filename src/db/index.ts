import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  setLogLevel,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDOH4aj4bLXV5UnFCc_5JhOo7jNqjoH0w",
  authDomain: "qwixx-clone.firebaseapp.com",
  projectId: "qwixx-clone",
  storageBucket: "qwixx-clone.appspot.com",
  messagingSenderId: "592784811174",
  appId: "1:592784811174:web:6872fd00ce7f5d561c4067",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
//TODO: only run this in DEV
connectFirestoreEmulator(db, "localhost", 8080);
