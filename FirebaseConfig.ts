// Import the functions you need from the SDKs you need
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUl04GUiSkzi7AxxbPFJEyHeU1qEOyZ-c",
  authDomain: "studyspace-tracker-app.firebaseapp.com",
  projectId: "studyspace-tracker-app",
  storageBucket: "studyspace-tracker-app.firebasestorage.app",
  messagingSenderId: "245200279316",
  appId: "1:245200279316:web:1e37c8d6d62a60ebab9401",
  measurementId: "G-8SCNKY2949"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported
let analytics: any = null;
isSupported().then(yes => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});
export { analytics };

// Initialize Auth
export const auth = getAuth(app);

// Ensure we're NOT using emulator in production
// Only connect to emulator if explicitly in development mode
if (__DEV__ && false) { // Disabled emulator for now
  // connectAuthEmulator would go here if needed
}

export const db = getFirestore(app);
export const storage = getStorage(app);