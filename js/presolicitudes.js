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
            const ultimaPresolicitud = snapshot.docs[0].data();
            nuevoNumero = (ultimaPresolicitud.folioNumero || 1) + 1;
        }

        const folioFinal = 'PS-26' + String(nuevoNumero).padStart(5, '0');
        folioPresolicitud.value = folioFinal;

    } catch (error) {
        console.error('Error generando folio:', error);
        folioPresolicitud.value = 'PS-2600001';
    }
}

// ======================================
// ABRIR MODAL NUEVA PRESOLICITUD
// ======================================

async function abrirModalNuevaPresolicitud() {
    formPresolicitud.reset();
    mensajePresolicitud.innerHTML = '';
    await generarFolioPresolicitud();
    modalPresolicitud.classList.remove('hidden');
}

// ======================================
// CERRAR MODAL
// ======================================

function cerrarModal() {
    modalPresolicitud.classList.add('hidden');
    formPresolicitud.reset();
    mensajePresolicitud.innerHTML = '';
}

// ======================================
// CERRAR MODAL DETALLES
// ======================================

function cerrarModalDetalles() {
    modalDetalles.classList.add('hidden');
}

// ======================================
// GUARDAR PRESOLICITUD
// ======================================

async function guardarPresolicitud(e) {
    e.preventDefault();

    try {
        const usuarioActual = obtenerUsuarioActual();

        const folio       = folioPresolicitud.value;
        const folioNumero = parseInt(folio.replace('PS-26', ''));
        const area        = document.getElementById('areaPresolicitud').value;
        const equipo      = document.getElementById('equipoPresolicitud').value;
        const kilometraje = document.getElementById('kilometrajePresolicitud').value;
        const descripcion = document.getElementById('descripcionPresolicitud').value;

        const fecha     = new Date().toLocaleString();
        const estado    = 'draft';
        const creadoPor = usuarioActual?.usuario || 'Sistema';

        await addDoc(collection(db, 'presolicitudes'), {
            folio, folioNumero, area, equipo,
            kilometraje: kilometraje || '',
            descripcion, fecha, estado, creadoPor,
            createdAt: new Date(),
            ordenGenerada: false
        });

        // Registrar en bitácora
        await registrarEvento(
            'presolicitud_creada',
            `Presolicitud ${folio} creada — Equipo: ${equipo}, Área: ${area}`,
            { folio }
        );

        mostrarMensaje('✅ Presolicitud guardada correctamente', 'success');

        setTimeout(() => {
            cerrarModal();
            cargarPresolicitudes();
        }, 1500);

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
                <div class="bg-white rounded-xl shadow p-8 text-center col-span-full">
                    <p class="text-gray-500 text-lg">No hay presolicitudes</p>
                </div>
            `;
            return;
        }

        snapshot.forEach((docSnap) => {
            const presolicitud = docSnap.data();
            presolicitud.id = docSnap.id;
            crearTarjetaPresolicitud(presolicitud);
        });

    } catch (error) {
        console.error('Error cargando presolicitudes:', error);
        contenedorPresolicitudes.innerHTML = `
            <div class="bg-white rounded-xl shadow p-8 text-center col-span-full">
                <p class="text-red-500">Error al cargar presolicitudes</p>
            </div>
        `;
    }
}

// ======================================
// CREAR TARJETA PRESOLICITUD
// ======================================

function crearTarjetaPresolicitud(presolicitud) {
    const estadoClases = presolicitud.estado === 'draft'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-green-100 text-green-800';

    const tarjeta = document.createElement('div');
    tarjeta.className = 'bg-white rounded-xl shadow p-6 hover:shadow-lg transition';
    tarjeta.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-xl font-bold text-gray-800">${presolicitud.folio}</h3>
                <p class="text-gray-500 text-sm">${presolicitud.fecha}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-bold ${estadoClases}">
                ${presolicitud.estado === 'draft' ? '✏️ Borrador' : '✅ Convertida'}
            </span>
        </div>

        <div class="space-y-2 mb-4">
            <p><strong>Área:</strong> ${presolicitud.area}</p>
            <p><strong>Equipo:</strong> ${presolicitud.equipo}</p>
            ${presolicitud.kilometraje ? `<p><strong>Kilometraje:</strong> ${presolicitud.kilometraje}</p>` : ''}
            <p><strong>Descripción:</strong> ${presolicitud.descripcion.substring(0, 100)}...</p>
        </div>

        <div class="flex gap-3">
            <button
                onclick="abrirDetalles('${presolicitud.id}')"
                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg transition"
            >
                Ver Detalles
            </button>
            ${presolicitud.estado === 'draft' ? `
                <button
                    onclick="eliminarPresolicitud('${presolicitud.id}')"
                    class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition"
                >
                    Eliminar
                </button>
            ` : ''}
        </div>
    `;

    contenedorPresolicitudes.appendChild(tarjeta);
}

// ======================================
// ABRIR DETALLES Y CONVERTIR
// ======================================

window.abrirDetalles = async function(presolicitudId) {
    try {
        const docSnap = await getDocs(query(
            collection(db, 'presolicitudes'),
            where('__name__', '==', presolicitudId)
        ));

        if (docSnap.empty) return;

        const presolicitud    = docSnap.docs[0].data();
        presolicitud.id       = presolicitudId;

        const contenidoDetalles = document.getElementById('contenidoDetalles');
        contenidoDetalles.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div><strong>Folio:</strong> <p class="text-gray-700">${presolicitud.folio}</p></div>
                <div><strong>Fecha:</strong> <p class="text-gray-700">${presolicitud.fecha}</p></div>
                <div><strong>Área:</strong> <p class="text-gray-700">${presolicitud.area}</p></div>
                <div><strong>Equipo:</strong> <p class="text-gray-700">${presolicitud.equipo}</p></div>
                ${presolicitud.kilometraje ? `
                    <div class="col-span-2">
                        <strong>Kilometraje/Horómetro:</strong>
                        <p class="text-gray-700">${presolicitud.kilometraje}</p>
                    </div>
                ` : ''}
                <div class="col-span-2">
                    <strong>Descripción:</strong>
                    <p class="text-gray-700 mt-2">${presolicitud.descripcion}</p>
                </div>
            </div>
        `;

        const botonesAccion = document.getElementById('botonesAccion');
        botonesAccion.innerHTML = `
            ${presolicitud.estado === 'draft' ? `
                <button
                    onclick="convertirAOrden('${presolicitudId}')"
                    class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg transition"
                >
                    ✅ Convertir a Orden
                </button>
                <button
                    onclick="editarPresolicitud('${presolicitudId}')"
                    class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg transition"
                >
                    ✏️ Editar
                </button>
            ` : `
                <p class="w-full text-center text-green-600 font-bold">✅ Esta presolicitud ya fue convertida a orden</p>
            `}
            <button
                onclick="cerrarModalDetalles()"
                class="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-bold px-6 py-3 rounded-lg transition"
            >
                Cerrar
            </button>
        `;

        modalDetalles.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar detalles');
    }
};

window.cerrarModalDetalles = cerrarModalDetalles;

// ======================================
// CONVERTIR A ORDEN
// ======================================

window.convertirAOrden = async function(presolicitudId) {
    try {
        const docSnap = await getDocs(query(
            collection(db, 'presolicitudes'),
            where('__name__', '==', presolicitudId)
        ));

        if (docSnap.empty) return;

        const presolicitud = docSnap.docs[0].data();

        // Generar folio de orden
        const ordenesRef = collection(db, 'ordenes');
        const q          = query(ordenesRef, orderBy('folio', 'desc'), limit(1));
        const snapshot   = await getDocs(q);

        let nuevoNumero = 1;
        if (!snapshot.empty) {
            const ultimaOrden  = snapshot.docs[0].data();
            const numeroActual = parseInt(ultimaOrden.folio.replace('OS-26', ''));
            nuevoNumero = numeroActual + 1;
        }

        const folioOrden = 'OS-26' + String(nuevoNumero).padStart(5, '0');

        // Crear orden
        await addDoc(collection(db, 'ordenes'), {
            folio:              folioOrden,
            area:               presolicitud.area,
            equipo:             presolicitud.equipo,
            kilometraje:        presolicitud.kilometraje || '',
            horometro:          '',
            operador:           '',
            tecnico:            '',
            tipo:               'Preventivo',
            prioridad:          'Media',
            descripcion:        presolicitud.descripcion,
            fecha:              new Date().toLocaleString(),
            estado:             'Pendiente',
            presolicitudOrigen: presolicitud.folio
        });

        // Marcar presolicitud como convertida
        const presolicitudRef = doc(db, 'presolicitudes', presolicitudId);
        await updateDoc(presolicitudRef, {
            estado:       'convertida',
            ordenGenerada: true,
            folioOrden
        });

        // Registrar en bitácora
        await registrarEvento(
            'presolicitud_convertida',
            `Presolicitud ${presolicitud.folio} convertida a Orden ${folioOrden}`,
            { folio: presolicitud.folio, objetivo: folioOrden }
        );

        alert('✅ Orden de servicio generada: ' + folioOrden);
        cerrarModalDetalles();
        cargarPresolicitudes();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al convertir presolicitud');
    }
};

// ======================================
// EDITAR PRESOLICITUD
// ======================================

window.editarPresolicitud = async function(presolicitudId) {
    alert('Funcionalidad de edición próximamente');
};

// ======================================
// ELIMINAR PRESOLICITUD
// ======================================

window.eliminarPresolicitud = async function(presolicitudId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta presolicitud?')) return;

    try {
        // Obtener folio antes de eliminar para la bitácora
        const docSnap = await getDocs(query(
            collection(db, 'presolicitudes'),
            where('__name__', '==', presolicitudId)
        ));
        const folioPs = docSnap.empty ? presolicitudId : (docSnap.docs[0].data().folio || presolicitudId);

        await deleteDoc(doc(db, 'presolicitudes', presolicitudId));

        // Registrar en bitácora
        await registrarEvento(
            'presolicitud_eliminada',
            `Presolicitud ${folioPs} eliminada`,
            { folio: folioPs }
        );

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
