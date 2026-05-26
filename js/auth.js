import { db } from './firebase-config.js';

import {

    collection,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// LOGIN
document.getElementById(

    'loginForm'

)

.addEventListener(

    'submit',

    async (e) => {

        e.preventDefault();

        const usuario = document.getElementById(

            'usuario'

        ).value.trim();

        const password = document.getElementById(

            'password'

        ).value.trim();

        try {

            const snapshot = await getDocs(

                collection(db, 'usuarios')

            );

            let acceso = false;

            snapshot.forEach((doc) => {

                const user = doc.data();

                if (

                    user.usuario === usuario &&

                    user.password === password

                ) {

                    acceso = true;

                    localStorage.setItem(

                        'usuarioLogueado',

                        JSON.stringify(user)

                    );

                    // REDIRECCIÓN
                    if (user.rol === 'director') {

                        window.location.href =

                        './pages/dashboard.html';

                    }

                    else if (

                        user.rol === 'supervisor'

                    ) {

                        window.location.href =

                        './pages/nueva-orden.html';

                    }

                }

            });

            if (!acceso) {

                mostrarError(

                    'Usuario o contraseña incorrectos'

                );

            }

        } catch (error) {

            console.error(error);

            mostrarError(

                'Error al iniciar sesión'

            );

        }

    }

);

// ERROR
function mostrarError(texto) {

    const error = document.getElementById(

        'error'

    );

    error.classList.remove('hidden');

    error.innerText = texto;

}