import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// LÓGICA DEL FORMULARIO DE LOGIN
// (solo se ejecuta en login.html)
// ======================================

const loginForm = document.getElementById('loginForm');

if (loginForm) {

  const usuarioInput = document.getElementById('usuario');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('loginError');
  const loginButton = loginForm.querySelector('button');

  loginForm.addEventListener('submit', async function(e) {

    e.preventDefault();

    if (loginError) {
      loginError.textContent = '';
      loginError.style.display = 'none';
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Verificando...';

    const mostrarError = (mensaje) => {
      if (loginError) {
        loginError.textContent = mensaje;
        loginError.style.display = 'block';
      } else {
        alert(mensaje);
      }
      loginButton.disabled = false;
      loginButton.textContent = 'Iniciar Sesión';
    };

    try {

      const usuario = usuarioInput.value.trim();
      const password = passwordInput.value;

      if (!usuario || !password) {
        mostrarError('Por favor completa todos los campos');
        return;
      }

      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('usuario', '==', usuario));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        mostrarError('Usuario o contraseña incorrectos');
        return;
      }

      const usuarioDoc = querySnapshot.docs[0];
      const usuarioData = usuarioDoc.data();
      const uid = usuarioDoc.id;

      if (!usuarioData.password) {
        mostrarError('Error: Usuario sin contraseña configurada');
        return;
      }

      if (password !== usuarioData.password) {
        mostrarError('Usuario o contraseña incorrectos');
        return;
      }

      if (usuarioData.estado === 'inactivo') {
        mostrarError('Este usuario ha sido desactivado');
        return;
      }

      const sesionData = {
        uid: uid,
        usuario: usuarioData.usuario,
        nombre: usuarioData.nombre || usuarioData.usuario,
        rol: usuarioData.rol,
        tecnicoId: usuarioData.tecnicoId || null,
        timestamp: new Date().getTime()
      };

      localStorage.setItem('sesion', JSON.stringify(sesionData));
      localStorage.setItem('token', uid);

      // Redirigir según rol
      switch (usuarioData.rol) {
        case 'admin':
          window.location.href = './pages/dashboard.html';
          break;
        case 'jefe_planta':
          window.location.href = './pages/presolicitudes.html';
          break;
        case 'tecnico':
          window.location.href = './pages/app-tecnico.html';
          break;
        default:
          mostrarError('Rol no reconocido. Contacta al administrador.');
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      if (loginError) {
        loginError.textContent = 'Error en el sistema. Intenta de nuevo.';
        loginError.style.display = 'block';
      }
      loginButton.disabled = false;
      loginButton.textContent = 'Iniciar Sesión';
    }

  });

}

// ======================================
// FUNCIONES EXPORTADAS
// (usadas por otras páginas)
// ======================================

export function cerrarSesion() {
  localStorage.removeItem('sesion');
  localStorage.removeItem('token');
  window.location.href = '../login.html';
}

export function obtenerUsuarioActual() {
  const sesion = localStorage.getItem('sesion');
  return sesion ? JSON.parse(sesion) : null;
}

export function verificarSesion() {
  const sesion = localStorage.getItem('sesion');
  const token = localStorage.getItem('token');
  if (!sesion || !token) {
    window.location.href = '../login.html';
    return false;
  }
  return true;
}

export function verificarSesionRol(rolesPermitidos) {
  const sesion = localStorage.getItem('sesion');
  const token = localStorage.getItem('token');

  if (!sesion || !token) {
    window.location.href = '../login.html';
    return null;
  }

  const datos = JSON.parse(sesion);

  if (!rolesPermitidos.includes(datos.rol)) {
    if (datos.rol === 'tecnico') {
      window.location.href = './app-tecnico.html';
    } else if (datos.rol === 'jefe_planta') {
      window.location.href = './presolicitudes.html';
    } else {
      window.location.href = './dashboard.html';
    }
    return null;
  }

  return datos;
}

console.log('✅ Sistema de autenticación cargado');
