// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArkVhatl7xpDV4Ntf84Ytum4lpddc9hyE",
  authDomain: "flashcardsaas-6d2c7.firebaseapp.com",
  projectId: "flashcardsaas-6d2c7",
  storageBucket: "flashcardsaas-6d2c7.appspot.com",
  messagingSenderId: "200143556789",
  appId: "1:200143556789:web:9ae8d9c25ff7d08071eefc",
  measurementId: "G-MQGRWXK80D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const db=getFirestore(app)
export {db}