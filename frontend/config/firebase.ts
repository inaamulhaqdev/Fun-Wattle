import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration

// This information is safe to have public as they are identification keys, not authentication keys
const firebaseConfig = {
  apiKey: "AIzaSyAikGgqso-8nj7MeWcw-eREqOXYWJCQiO8",
  authDomain: "funwattle-app-c8fef.firebaseapp.com",
  projectId: "funwattle-app-c8fef",
  storageBucket: "funwattle-app-c8fef.firebasestorage.app",
  messagingSenderId: "18524485461",
  appId: "1:18524485461:web:fb0171a030fbdf3b34a1dc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export default app;