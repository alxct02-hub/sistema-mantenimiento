// ======================================
// LOGIN
// ======================================

document.getElementById(

    'loginForm'

)

.addEventListener(

    'submit',

    async (e) => {

        e.preventDefault();

        const correo = document.getElementById(

            'correo'

        ).value;

        const password = document.getElementById(

            'password'

        ).value;

        const errorBox = document.getElementById(

            'errorBox'

        );

        const loadingText = document.getElementById(

            'loadingText'

        );

        try {

            loadingText.style.display = 'block';

            errorBox.style.display = 'none';

            // LOGIN FIREBASE
            await auth.signInWithEmailAndPassword(

                correo,

                password

            );

            // REDIRECCIÓN
            window.location.href =

            './pages/dashboard.html';

        }

        catch (error) {

            console.error(error);

            errorBox.style.display = 'block';

            errorBox.innerText =

            'Error al iniciar sesión';

        }

        finally {

            loadingText.style.display = 'none';

        }

    }

);