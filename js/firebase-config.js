// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// CONFIGURACIÓN FIREBASE

const firebaseConfig = {

  apiKey: "AIzaSyDR4D1IyOqAYOE3JZzsqBhlfpwGwmT4m-A",

  authDomain:
  "mantenimiento-planta-adbfc.firebaseapp.com",

  projectId:
  "mantenimiento-planta-adbfc",

  storageBucket:
  "mantenimiento-planta-adbfc.firebasestorage.app",

  messagingSenderId:
  "182924583347",

  appId:
  "1:182924583347:web:96531f94bc101af2a12bc6",

  measurementId:
  "G-HZ8W5B6ZG3"

};

// INICIALIZAR

const app =
initializeApp(firebaseConfig);

// SERVICIOS

const db =
getFirestore(app);

const auth =
getAuth(app);

// EXPORTAR

export {
  db,
  auth
};