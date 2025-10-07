import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebase from "firebase/app";
import "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCuYIDbbcyPUvVWsm4l0LrX5OLMgzVIOeE",
  authDomain: "rescueconnect-d83ae.firebaseapp.com",
  databaseURL: "https://rescueconnect-d83ae-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rescueconnect-d83ae",
  storageBucket: "rescueconnect-d83ae.firebasestorage.app",
  messagingSenderId: "334546078137",
  appId: "1:334546078137:web:7384c108f8337973780e68",
  measurementId: "G-4VJE3Q10HS"
};
/*
const firebaseConfig = {
  apiKey: "AIzaSyBOIVay3_mPI3e5qj6m7-o00b2BPBgIaQY",
  authDomain: "hackverse-5ecdd.firebaseapp.com",
  databaseURL: "https://hackverse-5ecdd-default-rtdb.firebaseio.com",
  projectId: "hackverse-5ecdd",
  storageBucket: "hackverse-5ecdd.appspot.com",
  messagingSenderId: "316801498344",
  appId: "1:316801498344:web:f70c7cb41d44f5bcf21d5d",
  measurementId: "G-E8W4PT6DS5"
};
*/
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getFirestore(app);
export const storage = getStorage(app);
export const db = getDatabase();
