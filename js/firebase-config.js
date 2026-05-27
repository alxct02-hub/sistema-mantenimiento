// ======================================
// FIREBASE CONFIG
// ======================================

const firebaseConfig = {

    apiKey: "AIzaSyDR4D1IyOqAYOE3JZzsqBhlfpwGwmT4m-A",

    authDomain: "mantenimiento-planta-adbfc.firebaseapp.com",

    projectId: "mantenimiento-planta-adbfc",

    storageBucket: "mantenimiento-planta-adbfc.firebasestorage.app",

    messagingSenderId: "182924583347",

    appId: "1:182924583347:web:96531f94bc101af2a12bc6",

    measurementId: "G-HZ8W5B6ZG3"

};

// ======================================
// INICIALIZAR FIREBASE
// ======================================

firebase.initializeApp(firebaseConfig);

// ======================================
// SERVICIOS
// ======================================

const db = firebase.firestore();

const auth = firebase.auth();

const storage = firebase.storage();

// ======================================
// OFFLINE
// ======================================

firebase.firestore()

.enablePersistence()

.catch((err) => {

    console.log(

        'Persistencia no disponible',

        err

    );

});