  const firebaseConfig = {
    apiKey: "AIzaSyDR4D1IyOqAYOE3JZzsqBhlfpwGwmT4m-A",
    authDomain: "mantenimiento-planta-adbfc.firebaseapp.com",
    projectId: "mantenimiento-planta-adbfc",
    storageBucket: "mantenimiento-planta-adbfc.firebasestorage.app",
    messagingSenderId: "182924583347",
    appId: "1:182924583347:web:96531f94bc101af2a12bc6",
    measurementId: "G-HZ8W5B6ZG3"

  };

  firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

firebase.firestore().enablePersistence()
  .then(() => {
    console.log("Modo offline activado correctamente");
  })
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log("Varias pestañas abiertas");
    } else if (err.code == 'unimplemented') {
      console.log("Navegador no compatible");
    }
  });

const auth = firebase.auth();
const storage = firebase.storage();