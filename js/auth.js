const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {

  e.preventDefault();

  const correo = document.getElementById('correo').value;
  const password = document.getElementById('password').value;

  const errorBox = document.getElementById('errorBox');
  const loadingText = document.getElementById('loadingText');

  errorBox.style.display = 'none';
  loadingText.style.display = 'block';

  try {

    const userCredential = await auth.signInWithEmailAndPassword(
      correo,
      password
    );

    const user = userCredential.user;

    console.log("Usuario logueado:", user.email);

    window.location.href = "dashboard.html";

  } catch (error) {

    console.error(error);

    errorBox.style.display = 'block';

    switch(error.code){

      case 'auth/user-not-found':
        errorBox.innerText = 'Usuario no encontrado';
        break;

      case 'auth/wrong-password':
        errorBox.innerText = 'Contraseña incorrecta';
        break;

      case 'auth/invalid-email':
        errorBox.innerText = 'Correo inválido';
        break;

      default:
        errorBox.innerText = 'Error al iniciar sesión';
        break;
    }

  } finally {

    loadingText.style.display = 'none';

  }

});