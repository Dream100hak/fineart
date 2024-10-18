// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCY8LVY1lJChCAcRipkVkZXPMNib_CSo2c",
    authDomain: "fineartportaltest.firebaseapp.com",
    projectId: "fineartportaltest",
    storageBucket: "fineartportaltest.appspot.com",
    messagingSenderId: "192740918915",
    appId: "1:192740918915:web:6b1e32d50d779120d27db6",
    measurementId: "G-1WVH688CC8"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
