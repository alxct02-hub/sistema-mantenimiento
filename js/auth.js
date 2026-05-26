// Importar auth
import { auth } from './firebase-config.js';

import {

  signInWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Formulario
const loginForm = document.getElementById('loginForm');

// Evento login
loginForm.addEventListener('submit', iniciarSesion);

// Función login
async function iniciarSesion(e){

    e.preventDefault();

    // Obtener datos
    const email = document.getElementById('email').value;

    const password = document.getElementById('password').value;

    try{

        // Mostrar en consola
        console.log("Intentando iniciar sesión...");

        // Login Firebase
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        console.log("Login correcto:", userCredential.user);

        // Redireccionar
        window.location.href = "./pages/dashboard.html";

    }catch(error){

        console.error("ERROR FIREBASE:", error);

        alert(error.message);

    }

}
