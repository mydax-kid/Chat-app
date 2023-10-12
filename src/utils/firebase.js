import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCVU9scFJvVEBilVOFPy4kqGjsTOAcA3TA",
  authDomain: "sami-chat-f21a3.firebaseapp.com",
  projectId: "sami-chat-f21a3",
  storageBucket: "sami-chat-f21a3.appspot.com",
  messagingSenderId: "984332427754",
  appId: "1:984332427754:web:d2739c6dfdf4e2a3cad293"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export { db, auth, storage, provider }