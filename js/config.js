// =============================================
// CONFIGURACIÓN DE FIREBASE - Órdenes CCP
// =============================================

const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",           // ← Cambia esto
    authDomain: "TU-PROYECTO.firebaseapp.com",                  // ← Cambia esto
    projectId: "TU-PROYECTO",                                   // ← Cambia esto
    storageBucket: "TU-PROYECTO.appspot.com",                   // ← Cambia esto
    messagingSenderId: "1234567890",                            // ← Cambia esto
    appId: "1:1234567890:web:XXXXXXXXXXXXXXXXXXXXXXXX"         // ← Cambia esto
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar las instancias que vamos a usar
const auth = firebase.auth();
const db = firebase.firestore();

// Opcional: Configuración adicional
db.settings({ timestampsInSnapshots: true });

console.log("✅ Firebase configurado correctamente - CCP Sistema");

// Para poder usar estas variables en otros archivos
window.auth = auth;
window.db = db;