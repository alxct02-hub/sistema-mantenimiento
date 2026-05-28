// ======================================
// SISTEMA DE AUTENTICACIÓN - USUARIO/CONTRASEÑA
// ======================================

import { db } from './firebase-config.js';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// ======================================
// ELEMENTOS DEL FORMULARIO
// ======================================

const loginForm = document.getElementById('loginForm');
const usuarioInput = document.getElementById('usuario');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const loginButton = loginForm.querySelector('button');

// ======================================
// EVENT LISTENERS
// ======================================

loginForm.addEventListener('submit', iniciarSesion);

// ======================================
// FUNCIÓN: INICIAR SESIÓN
// ======================================

async function iniciarSesion(e) {
  e.preventDefault();

  // Limpiar errores previos
  if (loginError) {
    loginError.textContent = '';
    loginError.style.display = 'none';
  }

  // Deshabilitar botón durante el proceso
  loginButton.disabled = true;
  loginButton.textContent = 'Verificando...';

  try {
    // Obtener valores
    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value;

    // Validar campos
    if (!usuario || !password) {
      mostrarError('Por favor completa todos los campos');
      loginButton.disabled = false;
      loginButton.textContent = 'Iniciar Sesión';
      return;
    }

    console.log('🔍 Buscando usuario:', usuario);

    // Buscar usuario en Firestore
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('usuario', '==', usuario));
    const querySnapshot = await getDocs(q);

    // Verificar si el usuario existe
    if (querySnapshot.empty) {
      mostrarError('Usuario o contraseña incorrectos');
      loginButton.disabled = false;
      loginButton.textContent = 'Iniciar Sesión';
      return;
    }

    // Obtener documento del usuario
    const usuarioDoc = querySnapshot.docs[0];
    const usuarioData = usuarioDoc.data();
    const uid = usuarioDoc.id;

    console.log('✅ Usuario encontrado:', usuarioData);

    // Verificar que la contraseña no esté vacía
    if (!usuarioData.password) {
      mostrarError('Error: Usuario sin contraseña configurada');
      loginButton.disabled = false;
      loginButton.textContent = 'Iniciar Sesión';
      return;
    }

    // Comparar contraseña (simple - en producción usar hashing)
    // NOTA: En producción, usa bcryptjs u otra librería de hashing
    const passwordValida = await verificarContraseña(
      password, 
      usuarioData.password
    );

    if (!passwordValida) {
      mostrarError('Usuario o contraseña incorrectos');
      loginButton.disabled = false;
      loginButton.textContent = 'Iniciar Sesión';
      return;
    }

    // Verificar si usuario está activo
    if (usuarioData.estado === 'inactivo') {
      mostrarError('Este usuario ha sido desactivado');
      loginButton.disabled = false;
      loginButton.textContent = 'Iniciar Sesión';
      return;
    }

    console.log('✅ Contraseña correcta. Iniciando sesión...');

    // Guardar sesión en localStorage
    const sesionData = {
      uid: uid,
      usuario: usuarioData.usuario,
      nombre: usuarioData.nombre || usuarioData.usuario,
      rol: usuarioData.rol || 'tecnico',
      email: usuarioData.email || '',
      timestamp: new Date().getTime()
    };

    localStorage.setItem('sesion', JSON.stringify(sesionData));
    localStorage.setItem('token', uid); // Token simple

    console.log('✅ Sesión guardada:', sesionData);

    // Redirigir según el rol
    redirigirPorRol(usuarioData.rol || 'tecnico');

  } catch (error) {
    console.error('❌ Error en login:', error);
    mostrarError('Error en el sistema. Intenta de nuevo.');
    loginButton.disabled = false;
    loginButton.textContent = 'Iniciar Sesión';
  }
}

// ======================================
// FUNCIÓN: VERIFICAR CONTRASEÑA
// ======================================

async function verificarContraseña(passwordIngresada, passwordGuardada) {
  
  // OPCIÓN 1: Comparación simple (NO RECOMENDADO para producción)
  // return passwordIngresada === passwordGuardada;

  // OPCIÓN 2: Usar bcryptjs (MÁS SEGURO - requiere librería)
  // return await bcrypt.compare(passwordIngresada, passwordGuardada);

  // OPCIÓN 3: Usar librería simétrica
  try {
    // Aquí se implementaría una función de hash seguro
    // Por ahora usamos comparación simple
    // En producción, implementa bcryptjs o similar
    return passwordIngresada === passwordGuardada;
  } catch (error) {
    console.error('Error verificando contraseña:', error);
    return false;
  }
}

// ======================================
// FUNCIÓN: MOSTRAR ERROR
// ======================================

function mostrarError(mensaje) {
  if (loginError) {
    loginError.textContent = mensaje;
    loginError.style.display = 'block';
    loginError.style.color = '#e74c3c';
    loginError.style.marginBottom = '15px';
    loginError.style.padding = '12px';
    loginError.style.backgroundColor = '#fadbd8';
    loginError.style.borderRadius = '5px';
    loginError.style.fontSize = '14px';
  } else {
    alert(mensaje);
  }
}

// ======================================
// FUNCIÓN: REDIRIGIR SEGÚN ROL
// ======================================

function redirigirPorRol(rol) {
  
  switch(rol.toLowerCase()) {
    case 'admin':
      window.location.href = './pages/dashboard.html';
      break;
    case 'supervisor':
      window.location.href = './pages/dashboard.html';
      break;
    case 'tecnico':
      window.location.href = './pages/app-tecnico.html';
      break;
    default:
      window.location.href = './pages/app-tecnico.html';
  }
}

// ======================================
// FUNCIÓN: CERRAR SESIÓN
// ======================================

export function cerrarSesion() {
  localStorage.removeItem('sesion');
  localStorage.removeItem('token');
  window.location.href = './login.html';
}

// ======================================
// FUNCIÓN: OBTENER USUARIO ACTUAL
// ======================================

export function obtenerUsuarioActual() {
  const sesion = localStorage.getItem('sesion');
  return sesion ? JSON.parse(sesion) : null;
}

// ======================================
// FUNCIÓN: VERIFICAR SESIÓN
// ======================================

export function verificarSesion() {
  const sesion = localStorage.getItem('sesion');
  const token = localStorage.getItem('token');
  
  if (!sesion || !token) {
    window.location.href = './login.html';
    return false;
  }
  
  return true;
}

// ======================================
// FUNCIÓN: CAMBIAR CONTRASEÑA
// ======================================

export async function cambiarContraseña(usuarioId, nuevaPassword) {
  try {
    const usuarioRef = doc(db, 'usuarios', usuarioId);
    await updateDoc(usuarioRef, {
      password: nuevaPassword,
      ultimaModificacion: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return { success: false, error: error.message };
  }
}

console.log('✅ Sistema de autenticación usuario/contraseña cargado');