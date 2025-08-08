import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwBI6KYqhXh9NVhZfEdFRc81aRPdCCCFE",
  authDomain: "fcm-notif-demo-824eb.firebaseapp.com",
  projectId: "fcm-notif-demo-824eb",
  storageBucket: "fcm-notif-demo-824eb.firebasestorage.app",
  messagingSenderId: "999361923562",
  appId: "1:999361923562:web:1019178ea5ee97d47c4a93",
  measurementId: "G-CENP41L3EB"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export { app, messaging };
