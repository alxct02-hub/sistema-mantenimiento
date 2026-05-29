import { db } from './firebase-config.js';
import { registrarEvento } from './bitacora-utils.js';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    orderBy,
    limit,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { verificarSesion, cerrarSesion, obtenerUsuarioActual } from './auth.js';

// ======================================
// VERIFICAR SESIÓN
// ======================================

verificarSesion();

// ======================================
// ELEMENTOS DEL DOM
// ======================================

const modalPresolicitud        = document.getElementById('modalPresolicitud');
const modalDetalles            = document.getElementById('modalDetalles');
const formPresolicitud         = document.getElementById('formPresolicitud');
const btnNuevaPresolicitud     = document.getElementById('btnNuevaPresolicitud');
const btnCerrarModal           = document.getElementById('btnCerrarModal');
const btnCancelarModal         = document.getElementById('btnCancelarModal');
const btnCerrarDetalles        = document.getElementById('btnCerrarDetalles');
const contenedorPresolicitudes = document.getElementById('contenedorPresolicitudes');
const mensajePresolicitud      = document.getElementById('mensajePresolicitud');
const folioPresolicitud        = document.getElementById('folioPresolicitud');
const filtroEstado             = document.getElementById('filtroEstado');
const btnCerrarSesion          = document.getElementById('btnCerrarSesion');

// ======================================
// EVENT LISTENERS
// ======================================

btnNuevaPresolicitud.addEventListener('click', abrirModalNuevaPresolicitud);
btnCerrarModal.addEventListener('click', cerrarModal);
btnCancelarModal.addEventListener('click', cerrarModal);
btnCerrarDetalles.addEventListener('click', cerrarModalDetalles);
formPresolicitud.addEventListener('submit', guardarPresolicitud);
filtroEstado.addEventListener('change', cargarPresolicitudes);
btnCerrarSesion.addEventListener('click', cerrarSesion);

// Cerrar modal al clic en fondo
modalPresolicitud.addEventListener('click', (e) => {
    if (e.target === modalPresolicitud) cerrarModal();
});

// ======================================
// INICIALIZAR
// ======================================

window.addEventListener('load', () => {
    generarFolioPresolicitud();
    cargarPresolicitudes();
});

// ======================================
// GENERAR FOLIO
// ======================================

async function generarFolioPresolicitud() {
    try {
        const presolicitudesRef = collection(db, 'presolicitudes');
        const q = query(presolicitudesRef, orderBy('folioNumero', 'desc'), limit(1));
        const snapshot = await getDocs(q);

        let nuevoNumero = 1;
        if (!snapshot.empty) {
            const ultima = snapshot.docs[0].data();
            nuevoNumero = (ultima.folioNumero || 1) + 1;
        }

        folioPresolicitud.value = 'PS-26' + String(nuevoNumero).padStart(5, '0');

    } catch (error) {
        console.error('Error generando folio:', error);
        folioPresolicitud.value = 'PS-2600001';
    }
}

// ======================================
// ABRIR MODAL
// ======================================

async function abrirModalNuevaPresolicitud() {
    formPresolicitud.reset();
    mensajePresolicitud.innerHTML = '';
    await generarFolioPresolicitud();
    modalPresolicitud.classList.remove('hidden');
}

// ======================================
// CERRAR MODALES
// ======================================

function cerrarModal() {
    modalPresolicitud.classList.add('hidden');
    formPresolicitud.reset();
    mensajePresolicitud.innerHTML = '';
}

function cerrarModalDetalles() {
    modalDetalles.classList.add('hidden');
}

// ======================================
// GUARDAR PRESOLICITUD (con todos los campos)
// ======================================

async function guardarPresolicitud(e) {
    e.preventDefault();

    try {
        const usuarioActual = obtenerUsuarioActual();

        const folio       = folioPresolicitud.value;
        const folioNumero = parseInt(folio.replace('PS-26', ''));
        const area        = document.getElementById('areaPresolicitud').value.trim();
        const equipo      = document.getElementById('equipoPresolicitud').value.trim();
        const kilometraje = document.getElementById('kilometrajePresolicitud').value;
        const horometro   = document.getElementById('horometroPresolicitud').value;
        const operador    = document.getElementById('operadorPresolicitud').value.trim();
        const tecnico     = document.getElementById('tecnicoPresolicitud').value.trim();
        const tipo        = document.getElementById('tipoPresolicitud').value;
        const prioridad   = document.getElementById('prioridadPresolicitud').value;
        const descripcion = document.getElementById('descripcionPresolicitud').value.trim();

        const fecha     = new Date().toLocaleString('es-MX');
        const estado    = 'draft';
        const creadoPor = usuarioActual?.usuario || 'Sistema';
        const nombreJefe = usuarioActual?.nombre || '';

        await addDoc(collection(db, 'presolicitudes'), {
            folio, folioNumero,
            area, equipo,
            kilometraje: kilometraje || '',
            horometro:   horometro   || '',
            operador:    operador    || '',
            tecnico:     tecnico     || '',
            tipo:        tipo        || '',
            prioridad:   prioridad   || '',
            descripcion,
            fecha,
            estado,
            creadoPor,
            nombreJefe,
            createdAt:    new Date(),
            ordenGenerada: false
        });

        // Bitácora
        await registrarEvento(
            'presolicitud_creada',
            `Presolicitud ${folio} creada — Equipo: ${equipo}, Área: ${area}`,
            { folio }
        );

        mostrarMensaje('✅ Presolicitud guardada correctamente', 'success');

        setTimeout(() => {
            cerrarModal();
            cargarPresolicitudes();
        }, 1400);

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('❌ Error al guardar presolicitud', 'error');
    }
}

// ======================================
// CARGAR PRESOLICITUDES
// ======================================

async function cargarPresolicitudes() {
    try {
        const usuarioActual = obtenerUsuarioActual();
        const filtro        = filtroEstado.value;

        let q;
        if (filtro) {
            q = query(
                collection(db, 'presolicitudes'),
                where('creadoPor', '==', usuarioActual?.usuario || 'Sistema'),
                where('estado', '==', filtro),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, 'presolicitudes'),
                where('creadoPor', '==', usuarioActual?.usuario || 'Sistema'),
                orderBy('createdAt', 'desc')
            );
        }

        const snapshot = await getDocs(q);
        contenedorPresolicitudes.innerHTML = '';

        if (snapshot.empty) {
            contenedorPresolicitudes.innerHTML = `
                <div class="bg-white rounded-xl shadow p-10 text-center">
                    <p class="text-4xl mb-3">📝</p>
                    <p class="text-gray-500 text-lg font-semibold">No tienes presolicitudes aún</p>
                    <p class="text-gray-400 text-sm mt-1">Crea una nueva con el botón ➕</p>
                </div>
            `;
            return;
        }

        snapshot.forEach((docSnap) => {
            const ps = docSnap.data();
            ps.id = docSnap.id;
            contenedorPresolicitudes.appendChild(crearTarjeta(ps));
        });

    } catch (error) {
        console.error('Error cargando presolicitudes:', error);
        contenedorPresolicitudes.innerHTML = `
            <div class="bg-white rounded-xl shadow p-8 text-center">
                <p class="text-red-500">Error al cargar presolicitudes</p>
            </div>
        `;
    }
}

// ======================================
// CREAR TARJETA
// ======================================

function crearTarjeta(ps) {
    const esConvertida = ps.estado === 'convertida';

    const prioridadColor = ps.prioridad === 'Alta'
        ? 'bg-red-100 text-red-700'
        : ps.prioridad === 'Media'
        ? 'bg-yellow-100 text-yellow-700'
        : ps.prioridad === 'Baja'
        ? 'bg-green-100 text-green-700'
        : 'bg-gray-100 text-gray-500';

    const estadoBadge = esConvertida
        ? '<span class="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">✅ Convertida</span>'
        : '<span class="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">✏️ Pendiente</span>';

    const div = document.createElement('div');
    div.className = `bg-white rounded-xl shadow p-6 hover:shadow-md transition ${esConvertida ? 'opacity-75' : 'border-l-4 border-yellow-400'}`;
    div.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-xl font-bold text-gray-800 font-mono">${ps.folio}</h3>
                <p class="text-gray-400 text-xs mt-0.5">${ps.fecha || ''}</p>
            </div>
            ${estadoBadge}
        </div>

        <div class="grid grid-cols-2 gap-2 text-sm mb-4">
            <div><span class="text-gray-400">Área:</span> <span class="font-semibold text-gray-700">${ps.area}</span></div>
            <div><span class="text-gray-400">Equipo:</span> <span class="font-semibold text-gray-700">${ps.equipo}</span></div>
            ${ps.tipo ? `<div><span class="text-gray-400">Tipo:</span> <span class="font-semibold text-gray-700">${ps.tipo}</span></div>` : ''}
            ${ps.prioridad ? `<div><span class="text-gray-400">Prioridad:</span> <span class="font-bold px-2 py-0.5 rounded-full text-xs ${prioridadColor}">${ps.prioridad}</span></div>` : ''}
            ${ps.operador ? `<div><span class="text-gray-400">Operador:</span> <span class="font-semibold text-gray-700">${ps.operador}</span></div>` : ''}
            ${ps.tecnico ? `<div><span class="text-gray-400">Técnico suger.:</span> <span class="font-semibold text-gray-700">${ps.tecnico}</span></div>` : ''}
        </div>

        <p class="text-gray-500 text-sm mb-4 line-clamp-2">${ps.descripcion}</p>

        ${esConvertida && ps.folioOrden ? `
            <p class="text-xs text-green-600 font-bold mb-3">→ Orden generada: <span class="font-mono">${ps.folioOrden}</span></p>
        ` : ''}

        <div class="flex gap-3">
            <button
                onclick="abrirDetalles('${ps.id}')"
                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg transition text-sm"
            >
                Ver Detalles
            </button>
            ${!esConvertida ? `
                <button
                    onclick="eliminarPresolicitud('${ps.id}')"
                    class="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-4 py-2 rounded-lg transition text-sm"
                >
                    🗑
                </button>
            ` : ''}
        </div>
    `;

    return div;
}

// ======================================
// ABRIR DETALLES
// ======================================

window.abrirDetalles = async function(presolicitudId) {
    try {
        const docSnap = await getDocs(query(
            collection(db, 'presolicitudes'),
            where('__name__', '==', presolicitudId)
        ));

        if (docSnap.empty) return;

        const ps    = docSnap.docs[0].data();
        ps.id       = presolicitudId;

        const contenidoDetalles = document.getElementById('contenidoDetalles');
        contenidoDetalles.innerHTML = `
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="bg-gray-50 rounded-lg p-3"><p class="text-gray-400 text-xs">Folio</p><p class="font-mono font-bold text-gray-800">${ps.folio}</p></div>
                <div class="bg-gray-50 rounded-lg p-3"><p class="text-gray-400 text-xs">Fecha</p><p class="font-semibold text-gray-700">${ps.fecha}</p></div>
                <div class="bg-gray-50 rounded-lg p-3"><p class="text-gray-400 text-xs">Área</p><p class="font-semibold text-gray-700">${ps.area}</p></div>
                <div class="bg-gray-50 rounded-lg p-3"><p class="text-gray-400 text-xs">Equipo</p><p class="font-semibold text-gray-700">${ps.equipo}</p></div>
                ${ps.kilometraje ? `<div class="bg-gray-50 rounded-lg p-3"><p class="text-gray-400 text-xs">Kilometraje</p><p class="font-semibold text-gray-700">${ps.kilometraje}</p></div>` : ''}
                ${ps.horometro ? `<div class="bg-gray-50 rounded-lg p-3"><p class="text-gray-400 text-xs">Horómetro</p><p class="font-semibold text-gray-700">${ps.horometro}</p></div>` : ''}
                ${ps.operador ? `<div class="bg-gray-50 rounded-lg p-3"><p class="text-gray-400 text-xs">Operador</p><p class="font-semibold text-gray-700">${ps.operador}</p></div>` : ''}
                ${ps.tecnico ? `<div class="bg-gray-50 rounded-lg p-3"><p class="text-gray-400 text-xs">Técnico sugerido</p><p class="font-semibold text-gray-700">${ps.tecnico}</p></div>` : ''}
                ${ps.tipo ? `<div class="bg-gray-50 rounded-lg p-3"><p class="text-gray-400 text-xs">Tipo</p><p class="font-semibold text-gray-700">${ps.tipo}</p></div>` : ''}
                ${ps.prioridad ? `<div class="bg-gray-50 rounded-lg p-3"><p class="text-gray-400 text-xs">Prioridad</p><p class="font-semibold text-gray-700">${ps.prioridad}</p></div>` : ''}
            </div>
            <div class="mt-4">
                <p class="text-gray-400 text-xs mb-1">Descripción</p>
                <p class="text-gray-700 bg-gray-50 rounded-lg p-3">${ps.descripcion}</p>
            </div>
        `;

        const botonesAccion = document.getElementById('botonesAccion');
        botonesAccion.innerHTML = ps.estado === 'draft'
            ? `<p class="text-xs text-gray-500 w-full">Esta presolicitud será revisada por el administrador para generar la orden de servicio.</p>`
            : `<p class="w-full text-center text-green-600 font-bold text-sm">✅ Esta presolicitud ya fue convertida — Orden: <span class="font-mono">${ps.folioOrden || ''}</span></p>`;

        modalDetalles.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar detalles');
    }
};

window.cerrarModalDetalles = cerrarModalDetalles;

// ======================================
// ELIMINAR PRESOLICITUD
// ======================================

window.eliminarPresolicitud = async function(presolicitudId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta presolicitud?')) return;

    try {
        const docSnap = await getDocs(query(
            collection(db, 'presolicitudes'),
            where('__name__', '==', presolicitudId)
        ));
        const folioPs = docSnap.empty ? presolicitudId : (docSnap.docs[0].data().folio || presolicitudId);

        await deleteDoc(doc(db, 'presolicitudes', presolicitudId));

        await registrarEvento('presolicitud_eliminada', `Presolicitud ${folioPs} eliminada`, { folio: folioPs });

        alert('✅ Presolicitud eliminada');
        cargarPresolicitudes();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar presolicitud');
    }
};

// ======================================
// MOSTRAR MENSAJE
// ======================================

function mostrarMensaje(msg, tipo) {
    mensajePresolicitud.innerHTML = msg;
    mensajePresolicitud.className = tipo === 'success'
        ? 'mt-4 text-center font-bold text-green-600'
        : 'mt-4 text-center font-bold text-red-600';
}

console.log('✅ Sistema de presolicitudes cargado');
