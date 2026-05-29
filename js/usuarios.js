import { db } from './firebase-config.js';
import { registrarEvento } from './bitacora-utils.js';
import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// VERIFICAR SESIÓN - SOLO ADMIN
// ======================================

const sesionGuardada = localStorage.getItem('sesion');
const tokenGuardado = localStorage.getItem('token');

if (!sesionGuardada || !tokenGuardado) {
    window.location.href = '../login.html';
}

const sesionActual = sesionGuardada ? JSON.parse(sesionGuardada) : null;

if (!sesionActual || sesionActual.rol !== 'admin') {
    window.location.href = '../login.html';
}

// ======================================
// CERRAR SESIÓN
// ======================================

document.getElementById('btnCerrarSesion').addEventListener('click', () => {
    localStorage.removeItem('sesion');
    localStorage.removeItem('token');
    window.location.href = '../login.html';
});

// ======================================
// ESTADO GLOBAL
// ======================================

let todosLosUsuarios = [];
let modoEdicion = false;

// ======================================
// ELEMENTOS DOM
// ======================================

const tablaUsuarios  = document.getElementById('tablaUsuarios');
const filtroRol      = document.getElementById('filtroRol');
const filtroEstado   = document.getElementById('filtroEstado');
const modal          = document.getElementById('modalUsuario');
const modalConfirmar = document.getElementById('modalConfirmar');
const formUsuario    = document.getElementById('formUsuario');
const tituloModal    = document.getElementById('tituloModal');
const labelPassword  = document.getElementById('labelPassword');
const passwordHint   = document.getElementById('passwordHint');
const mensajeModal   = document.getElementById('mensajeModal');
const campoTecnicoIdWrapper = document.getElementById('campoTecnicoIdWrapper');

// ======================================
// CARGAR USUARIOS
// ======================================

async function cargarUsuarios() {
    tablaUsuarios.innerHTML = `
        <tr><td colspan="6" class="px-6 py-10 text-center text-gray-400">Cargando...</td></tr>
    `;

    try {
        const snapshot = await getDocs(collection(db, 'usuarios'));
        todosLosUsuarios = [];

        snapshot.forEach(docSnap => {
            todosLosUsuarios.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Ordenar: admin primero, luego jefe_planta, luego tecnico
        const orden = { admin: 0, jefe_planta: 1, tecnico: 2 };
        todosLosUsuarios.sort((a, b) => (orden[a.rol] ?? 9) - (orden[b.rol] ?? 9));

        renderTabla();

    } catch (error) {
        console.error('Error:', error);
        tablaUsuarios.innerHTML = `
            <tr><td colspan="6" class="px-6 py-10 text-center text-red-500">Error al cargar usuarios</td></tr>
        `;
    }
}

// ======================================
// RENDERIZAR TABLA
// ======================================

function renderTabla() {
    const rol    = filtroRol.value;
    const estado = filtroEstado.value;

    const filtrados = todosLosUsuarios.filter(u => {
        if (rol    && u.rol    !== rol)    return false;
        if (estado && u.estado !== estado) return false;
        return true;
    });

    if (filtrados.length === 0) {
        tablaUsuarios.innerHTML = `
            <tr><td colspan="6" class="px-6 py-10 text-center text-gray-400">No hay usuarios con ese filtro</td></tr>
        `;
        return;
    }

    tablaUsuarios.innerHTML = '';

    filtrados.forEach(usuario => {

        const rolBadge =
            usuario.rol === 'admin'
                ? '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Administrador</span>'
            : usuario.rol === 'jefe_planta'
                ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Jefe de Planta</span>'
                : '<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Técnico</span>';

        const estadoBadge =
            usuario.estado === 'activo'
                ? '<span class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"><span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Activo</span>'
                : '<span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold"><span class="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>Inactivo</span>';

        const esAdmin = usuario.rol === 'admin';

        const tr = document.createElement('tr');
        tr.id = `fila-${usuario.id}`;
        tr.className = `hover:bg-gray-50 transition ${usuario.estado === 'inactivo' ? 'opacity-60' : ''}`;
        tr.innerHTML = `
            <td class="px-6 py-4">
                <span class="font-mono font-bold text-gray-800">${usuario.usuario}</span>
            </td>
            <td class="px-6 py-4" id="celda-nombre-${usuario.id}">
                ${celdaNombreTexto(usuario)}
            </td>
            <td class="px-6 py-4">${rolBadge}</td>
            <td class="px-6 py-4">
                ${usuario.tecnicoId
                    ? `<span class="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">${usuario.tecnicoId}</span>`
                    : '<span class="text-gray-300">—</span>'
                }
            </td>
            <td class="px-6 py-4">${estadoBadge}</td>
            <td class="px-6 py-4">
                <div class="flex gap-2">
                    <button
                        onclick="editarUsuario('${usuario.id}')"
                        class="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                    >
                        ✏️ Editar
                    </button>
                    ${!esAdmin ? `
                        <button
                            onclick="toggleEstado('${usuario.id}', '${usuario.estado}')"
                            class="${usuario.estado === 'activo'
                                ? 'bg-red-100 hover:bg-red-200 text-red-700'
                                : 'bg-green-100 hover:bg-green-200 text-green-700'
                            } text-xs font-bold px-3 py-2 rounded-lg transition"
                        >
                            ${usuario.estado === 'activo' ? '🔒 Desactivar' : '🔓 Activar'}
                        </button>
                    ` : ''}
                </div>
            </td>
        `;

        tablaUsuarios.appendChild(tr);
    });
}

// ======================================
// CELDA NOMBRE — MODO TEXTO (con hint de edición)
// ======================================

function celdaNombreTexto(usuario) {
    return `
        <div
            class="group flex items-center gap-2 cursor-pointer"
            onclick="activarEdicionNombre('${usuario.id}')"
            title="Clic para editar nombre"
        >
            <span class="text-gray-800 font-medium">${usuario.nombre || '-'}</span>
            <span class="opacity-0 group-hover:opacity-100 transition text-gray-400 text-xs select-none">✏️</span>
        </div>
    `;
}

// ======================================
// ACTIVAR EDICIÓN EN LÍNEA DEL NOMBRE
// ======================================

window.activarEdicionNombre = function(id) {
    const usuario = todosLosUsuarios.find(u => u.id === id);
    if (!usuario) return;

    const celda = document.getElementById(`celda-nombre-${id}`);
    if (!celda) return;

    // Evitar activar si ya está en modo edición
    if (celda.querySelector('input')) return;

    const nombreActual = usuario.nombre || '';

    celda.innerHTML = `
        <div class="flex items-center gap-2">
            <input
                type="text"
                id="input-nombre-${id}"
                value="${nombreActual.replace(/"/g, '&quot;')}"
                class="border-2 border-yellow-400 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-44"
                maxlength="60"
                autofocus
            >
            <button
                onclick="guardarNombreInline('${id}')"
                class="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-2 py-1.5 rounded-lg transition whitespace-nowrap"
                title="Guardar"
            >✓</button>
            <button
                onclick="cancelarEdicionNombre('${id}')"
                class="bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-bold px-2 py-1.5 rounded-lg transition whitespace-nowrap"
                title="Cancelar"
            >✕</button>
        </div>
    `;

    const input = document.getElementById(`input-nombre-${id}`);
    input.focus();
    input.select();

    // Guardar con Enter, cancelar con Escape
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            guardarNombreInline(id);
        }
        if (e.key === 'Escape') {
            cancelarEdicionNombre(id);
        }
    });
};

// ======================================
// GUARDAR NOMBRE DESDE LA TABLA
// ======================================

window.guardarNombreInline = async function(id) {
    const input = document.getElementById(`input-nombre-${id}`);
    if (!input) return;

    const nuevoNombre = input.value.trim();
    const celda       = document.getElementById(`celda-nombre-${id}`);

    if (!nuevoNombre) {
        input.classList.add('border-red-500');
        input.placeholder = 'El nombre no puede estar vacío';
        input.focus();
        return;
    }

    // Mostrar indicador de guardando
    input.disabled = true;
    celda.querySelector('button').textContent = '...';

    try {
        await updateDoc(doc(db, 'usuarios', id), { nombre: nuevoNombre });

        // Actualizar en memoria local
        const idx = todosLosUsuarios.findIndex(u => u.id === id);
        if (idx !== -1) todosLosUsuarios[idx].nombre = nuevoNombre;

        // Bitácora
        const usuarioObj = todosLosUsuarios.find(u => u.id === id);
        await registrarEvento(
            'nombre_actualizado',
            `Nombre de "${usuarioObj?.usuario || id}" actualizado a "${nuevoNombre}"`,
            { objetivo: usuarioObj?.usuario || id }
        );

        // Mostrar badge de éxito brevemente, luego volver al texto
        celda.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-gray-800 font-medium">${nuevoNombre}</span>
                <span class="text-green-600 text-xs font-bold animate-pulse">✅ Guardado</span>
            </div>
        `;

        setTimeout(() => {
            const usuarioActualizado = todosLosUsuarios.find(u => u.id === id);
            if (celda) celda.innerHTML = celdaNombreTexto(usuarioActualizado || { id, nombre: nuevoNombre });
        }, 1500);

    } catch (error) {
        console.error('Error guardando nombre:', error);
        celda.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-red-500 text-xs font-bold">❌ Error al guardar</span>
                <button onclick="activarEdicionNombre('${id}')" class="text-xs text-blue-500 underline">Reintentar</button>
            </div>
        `;
        setTimeout(() => {
            const usuario = todosLosUsuarios.find(u => u.id === id);
            if (celda && usuario) celda.innerHTML = celdaNombreTexto(usuario);
        }, 3000);
    }
};

// ======================================
// CANCELAR EDICIÓN EN LÍNEA
// ======================================

window.cancelarEdicionNombre = function(id) {
    const usuario = todosLosUsuarios.find(u => u.id === id);
    const celda   = document.getElementById(`celda-nombre-${id}`);
    if (celda && usuario) {
        celda.innerHTML = celdaNombreTexto(usuario);
    }
};

// ======================================
// ABRIR MODAL NUEVO USUARIO
// ======================================

document.getElementById('btnNuevoUsuario').addEventListener('click', () => {
    modoEdicion = false;
    tituloModal.textContent = 'Nuevo Usuario';
    formUsuario.reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('campoUsuario').disabled = false;
    labelPassword.innerHTML = 'Contraseña <span class="text-red-500">*</span>';
    passwordHint.classList.add('hidden');
    document.getElementById('campoPassword').required = true;
    campoTecnicoIdWrapper.classList.add('hidden');
    ocultarMensaje();
    modal.classList.remove('hidden');
});

// ======================================
// EDITAR USUARIO
// ======================================

window.editarUsuario = function(id) {
    const usuario = todosLosUsuarios.find(u => u.id === id);
    if (!usuario) return;

    modoEdicion = true;
    tituloModal.textContent = 'Editar Usuario';

    document.getElementById('usuarioId').value       = id;
    document.getElementById('campoUsuario').value    = usuario.usuario;
    document.getElementById('campoUsuario').disabled = true;
    document.getElementById('campoNombre').value     = usuario.nombre || '';
    document.getElementById('campoPassword').value   = '';
    document.getElementById('campoPassword').required = false;
    document.getElementById('campoRol').value        = usuario.rol || '';
    document.getElementById('campoTecnicoId').value  = usuario.tecnicoId || '';

    labelPassword.innerHTML = 'Nueva contraseña';
    passwordHint.classList.remove('hidden');

    // Mostrar campo ID técnico si aplica
    if (usuario.rol === 'tecnico') {
        campoTecnicoIdWrapper.classList.remove('hidden');
    } else {
        campoTecnicoIdWrapper.classList.add('hidden');
    }

    // Estado
    document.querySelector(`input[name="estado"][value="${usuario.estado || 'activo'}"]`).checked = true;

    ocultarMensaje();
    modal.classList.remove('hidden');
};

// ======================================
// MOSTRAR/OCULTAR ID TÉCNICO SEGÚN ROL
// ======================================

document.getElementById('campoRol').addEventListener('change', function() {
    if (this.value === 'tecnico') {
        campoTecnicoIdWrapper.classList.remove('hidden');
    } else {
        campoTecnicoIdWrapper.classList.add('hidden');
    }
});

// ======================================
// VER / OCULTAR CONTRASEÑA
// ======================================

document.getElementById('btnVerPassword').addEventListener('click', () => {
    const campo = document.getElementById('campoPassword');
    const btn   = document.getElementById('btnVerPassword');
    if (campo.type === 'password') {
        campo.type = 'text';
        btn.textContent = '🙈';
    } else {
        campo.type = 'password';
        btn.textContent = '👁';
    }
});

// ======================================
// GUARDAR USUARIO
// ======================================

formUsuario.addEventListener('submit', async function(e) {
    e.preventDefault();

    const btnGuardar = document.getElementById('btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
        const id         = document.getElementById('usuarioId').value;
        const usuario    = document.getElementById('campoUsuario').value.trim();
        const nombre     = document.getElementById('campoNombre').value.trim();
        const password   = document.getElementById('campoPassword').value;
        const rol        = document.getElementById('campoRol').value;
        const tecnicoId  = document.getElementById('campoTecnicoId').value.trim();
        const estado     = document.querySelector('input[name="estado"]:checked').value;

        // Validaciones básicas
        if (!usuario || !nombre || !rol) {
            mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar';
            return;
        }

        if (!modoEdicion && !password) {
            mostrarMensaje('La contraseña es requerida para nuevos usuarios', 'error');
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar';
            return;
        }

        if (password && password.length < 6) {
            mostrarMensaje('La contraseña debe tener mínimo 6 caracteres', 'error');
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar';
            return;
        }

        if (modoEdicion) {
            // ACTUALIZAR usuario existente
            const datos = { nombre, rol, estado };
            if (password) datos.password = password;
            if (rol === 'tecnico') datos.tecnicoId = tecnicoId;
            else datos.tecnicoId = null;

            await updateDoc(doc(db, 'usuarios', id), datos);

            // Bitácora
            await registrarEvento(
                'usuario_editado',
                `Usuario "${usuario}" actualizado — Rol: ${rol}, Estado: ${estado}`,
                { objetivo: usuario }
            );

            mostrarMensaje('✅ Usuario actualizado correctamente', 'success');

        } else {
            // CREAR nuevo usuario
            const snapshot = await getDocs(query(collection(db, 'usuarios')));
            const yaExiste = snapshot.docs.some(d => d.data().usuario === usuario);

            if (yaExiste) {
                mostrarMensaje('⚠️ Ese nombre de usuario ya está en uso', 'error');
                btnGuardar.disabled = false;
                btnGuardar.textContent = 'Guardar';
                return;
            }

            const docId = usuario.replace(/[^a-zA-Z0-9_]/g, '') + '_' + Date.now();
            const datos = { usuario, nombre, password, rol, estado };
            if (rol === 'tecnico' && tecnicoId) datos.tecnicoId = tecnicoId;

            await setDoc(doc(db, 'usuarios', docId), datos);

            // Bitácora
            await registrarEvento(
                'usuario_creado',
                `Usuario "${usuario}" creado — Nombre: ${nombre}, Rol: ${rol}`,
                { objetivo: usuario }
            );

            mostrarMensaje('✅ Usuario creado correctamente', 'success');
        }

        setTimeout(() => {
            modal.classList.add('hidden');
            cargarUsuarios();
        }, 1200);

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('❌ Error al guardar. Intenta de nuevo.', 'error');
    }

    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';
});

// ======================================
// ACTIVAR / DESACTIVAR USUARIO
// ======================================

window.toggleEstado = function(id, estadoActual) {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    const usuario     = todosLosUsuarios.find(u => u.id === id);

    const icono   = nuevoEstado === 'inactivo' ? '🔒' : '🔓';
    const titulo  = nuevoEstado === 'inactivo' ? 'Desactivar usuario' : 'Activar usuario';
    const mensaje = nuevoEstado === 'inactivo'
        ? `"${usuario?.nombre || id}" ya no podrá ingresar al sistema.`
        : `"${usuario?.nombre || id}" podrá volver a ingresar al sistema.`;

    document.getElementById('iconoConfirmar').textContent  = icono;
    document.getElementById('tituloConfirmar').textContent = titulo;
    document.getElementById('textoConfirmar').textContent  = mensaje;

    const btnSi = document.getElementById('btnConfirmarSi');
    btnSi.className = nuevoEstado === 'inactivo'
        ? 'flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition'
        : 'flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition';
    btnSi.textContent = nuevoEstado === 'inactivo' ? 'Desactivar' : 'Activar';

    modalConfirmar.classList.remove('hidden');

    // Limpiar listener previo clonando el botón
    const btnNuevo = btnSi.cloneNode(true);
    btnSi.parentNode.replaceChild(btnNuevo, btnSi);

    btnNuevo.addEventListener('click', async () => {
        try {
            await updateDoc(doc(db, 'usuarios', id), { estado: nuevoEstado });

            // Bitácora
            const tipoEvento = nuevoEstado === 'activo' ? 'usuario_activado' : 'usuario_desactivado';
            const accion     = nuevoEstado === 'activo' ? 'activado' : 'desactivado';
            await registrarEvento(
                tipoEvento,
                `Usuario "${usuario?.usuario || id}" (${usuario?.nombre || ''}) ${accion}`,
                { objetivo: usuario?.usuario || id }
            );

            modalConfirmar.classList.add('hidden');
            cargarUsuarios();
        } catch (err) {
            console.error(err);
            alert('Error al actualizar estado');
            modalConfirmar.classList.add('hidden');
        }
    });
};

// ======================================
// CERRAR MODALES
// ======================================

['btnCerrarModal', 'btnCancelar'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
        modal.classList.add('hidden');
    });
});

document.getElementById('btnConfirmarNo').addEventListener('click', () => {
    modalConfirmar.classList.add('hidden');
});

// Cerrar modal al hacer clic en el fondo
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});
modalConfirmar.addEventListener('click', (e) => {
    if (e.target === modalConfirmar) modalConfirmar.classList.add('hidden');
});

// ======================================
// FILTROS
// ======================================

filtroRol.addEventListener('change', renderTabla);
filtroEstado.addEventListener('change', renderTabla);

// ======================================
// MENSAJES
// ======================================

function mostrarMensaje(texto, tipo) {
    mensajeModal.textContent = texto;
    mensajeModal.className = tipo === 'success'
        ? 'rounded-lg px-4 py-3 text-sm font-semibold bg-green-100 text-green-700'
        : 'rounded-lg px-4 py-3 text-sm font-semibold bg-red-100 text-red-700';
    mensajeModal.classList.remove('hidden');
}

function ocultarMensaje() {
    mensajeModal.classList.add('hidden');
}

// ======================================
// INICIALIZAR
// ======================================

cargarUsuarios();
