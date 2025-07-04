
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration with fallback values for development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Check if we have actual Firebase configuration
const hasValidConfig = Object.values(firebaseConfig).every(value => 
  value && !value.startsWith('demo-') && value !== "demo-api-key"
);

let app;
let messaging;
let db;

// Always initialize Firebase app for demo purposes
try {
  app = initializeApp(firebaseConfig);
  
  // Only initialize messaging if we have valid config and we're in a browser
  if (hasValidConfig && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
  
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
}

export { messaging, db };

export const requestNotificationPermission = async () => {
  // Skip if no valid Firebase config
  if (!hasValidConfig) {
    console.log('Using demo Firebase config - notifications will work via polling');
    return null;
  }

  if (!messaging) {
    console.warn('Firebase messaging not available - skipping notification permission request');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () => {
  if (!messaging || !hasValidConfig) {
    return new Promise(() => {}); // Return a promise that never resolves
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};
