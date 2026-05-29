import { db } from './firebase-config.js';
import { registrarEvento } from './bitacora-utils.js';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// VERIFICAR SESIÓN - SOLO ADMIN
// ======================================

const sesionGuardada = localStorage.getItem('sesion');
const tokenGuardado  = localStorage.getItem('token');

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
// ESTADO
// ======================================

let todasLasPresolicitudes = [];
let presolicitudActual     = null;

// ======================================
// ELEMENTOS
// ======================================

const tablaBody       = document.getElementById('tablaPresolicitudes');
const filtroEstado    = document.getElementById('filtroEstado');
const filtroJefe      = document.getElementById('filtroJefe');
const filtroPrioridad = document.getElementById('filtroPrioridad');
const contadorBadge   = document.getElementById('contadorBadge');
const modal           = document.getElementById('modalDetalle');

// ======================================
// CARGAR TODAS LAS PRESOLICITUDES
// ======================================

async function cargarPresolicitudes() {
    tablaBody.innerHTML = `
        <tr><td colspan="7" class="px-6 py-10 text-center text-gray-400">Cargando...</td></tr>
    `;

    try {
        const q = query(
            collection(db, 'presolicitudes'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        todasLasPresolicitudes = [];
        const jefes = new Set();

        snapshot.forEach(docSnap => {
            const ps = docSnap.data();
            ps.id = docSnap.id;
            todasLasPresolicitudes.push(ps);
            if (ps.creadoPor) jefes.add(ps.creadoPor);
        });

        // Poblar select de jefes
        const selectJefe = document.getElementById('filtroJefe');
        const valorActual = selectJefe.value;
        selectJefe.innerHTML = '<option value="">Todos los jefes</option>';
        jefes.forEach(j => {
            const opt = document.createElement('option');
            opt.value = j;
            opt.textContent = j;
            selectJefe.appendChild(opt);
        });
        selectJefe.value = valorActual;

        renderTabla();

    } catch (error) {
        console.error('Error:', error);
        tablaBody.innerHTML = `
            <tr><td colspan="7" class="px-6 py-10 text-center text-red-400">Error al cargar presolicitudes</td></tr>
        `;
    }
}

// ======================================
// RENDERIZAR TABLA
// ======================================

function renderTabla() {
    const estado    = filtroEstado.value;
    const jefe      = filtroJefe.value;
    const prioridad = filtroPrioridad.value;

    const filtrados = todasLasPresolicitudes.filter(ps => {
        if (estado    && ps.estado    !== estado)    return false;
        if (jefe      && ps.creadoPor !== jefe)       return false;
        if (prioridad && ps.prioridad !== prioridad) return false;
        return true;
    });

    // Contador de pendientes
    const pendientes = filtrados.filter(p => p.estado === 'draft').length;
    if (pendientes > 0) {
        contadorBadge.textContent = `${pendientes} pendiente${pendientes > 1 ? 's' : ''} de revisión`;
        contadorBadge.classList.remove('hidden');
    } else {
        contadorBadge.classList.add('hidden');
    }

    if (filtrados.length === 0) {
        tablaBody.innerHTML = `
            <tr><td colspan="7" class="px-6 py-10 text-center text-gray-400">No hay presolicitudes con ese filtro</td></tr>
        `;
        return;
    }

    tablaBody.innerHTML = '';

    filtrados.forEach(ps => {
        const esDraft      = ps.estado === 'draft';

        const prioridadBadge = ps.prioridad === 'Alta'
            ? '<span class="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">Alta</span>'
            : ps.prioridad === 'Media'
            ? '<span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Media</span>'
            : ps.prioridad === 'Baja'
            ? '<span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">Baja</span>'
            : '<span class="text-gray-300 text-xs">—</span>';

        const estadoBadge = esDraft
            ? '<span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold"><span class="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block"></span>Pendiente</span>'
            : '<span class="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold"><span class="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>Convertida</span>';

        const tr = document.createElement('tr');
        tr.className = `hover:bg-gray-50 transition ${!esDraft ? 'opacity-70' : ''}`;
        tr.innerHTML = `
            <td class="px-5 py-4">
                <span class="font-mono font-bold text-gray-800 text-sm">${ps.folio}</span>
            </td>
            <td class="px-5 py-4">
                <p class="font-semibold text-gray-800 text-sm">${ps.area}</p>
                <p class="text-gray-400 text-xs">${ps.equipo}</p>
            </td>
            <td class="px-5 py-4">
                <p class="text-sm text-gray-700">${ps.tipo || '—'}</p>
                <div class="mt-1">${prioridadBadge}</div>
            </td>
            <td class="px-5 py-4">
                <p class="text-sm font-semibold text-gray-700">${ps.nombreJefe || ps.creadoPor || '—'}</p>
                <p class="text-xs text-gray-400 font-mono">${ps.creadoPor || ''}</p>
            </td>
            <td class="px-5 py-4 text-xs text-gray-500">${ps.fecha || '—'}</td>
            <td class="px-5 py-4">${estadoBadge}</td>
            <td class="px-5 py-4">
                <button
                    onclick="abrirDetalle('${ps.id}')"
                    class="${esDraft
                        ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } text-xs font-bold px-3 py-2 rounded-lg transition"
                >
                    ${esDraft ? '🛠 Revisar' : '👁 Ver'}
                </button>
            </td>
        `;

        tablaBody.appendChild(tr);
    });
}

// ======================================
// ABRIR MODAL DETALLE
// ======================================

window.abrirDetalle = async function(id) {
    presolicitudActual = todasLasPresolicitudes.find(p => p.id === id);
    if (!presolicitudActual) return;

    const ps = presolicitudActual;

    // Título
    document.getElementById('modalFolio').textContent = `Presolicitud ${ps.folio}`;

    // Datos en grid
    const datos = document.getElementById('datosPresolicitud');
    const campo = (label, valor) => valor
        ? `<div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
               <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">${label}</p>
               <p class="font-semibold text-gray-800 text-sm">${valor}</p>
           </div>`
        : '';

    datos.innerHTML = `
        ${campo('Folio', ps.folio)}
        ${campo('Área', ps.area)}
        ${campo('Equipo', ps.equipo)}
        ${campo('Kilometraje', ps.kilometraje)}
        ${campo('Horómetro', ps.horometro)}
        ${campo('Operador', ps.operador)}
        ${campo('Técnico sugerido', ps.tecnico)}
        ${campo('Tipo', ps.tipo)}
        ${campo('Prioridad', ps.prioridad)}
        ${campo('Solicitante', ps.nombreJefe || ps.creadoPor)}
        ${campo('Fecha', ps.fecha)}
    `;

    // Descripción
    document.getElementById('descripcionDetalle').textContent = ps.descripcion;

    // Panel generar orden
    const panelGenerar = document.getElementById('panelGenerarOrden');
    const mensajeModal = document.getElementById('mensajeModal');
    mensajeModal.classList.add('hidden');

    if (ps.estado === 'draft') {
        panelGenerar.classList.remove('hidden');
        // Calcular folio previsualización
        const folioPreview = await calcularSiguienteFolio();
        document.getElementById('folioOrdenPreview').textContent = folioPreview;
    } else {
        panelGenerar.classList.add('hidden');
    }

    // Botones
    const botones = document.getElementById('botonesDetalle');
    if (ps.estado === 'draft') {
        botones.innerHTML = `
            <button
                id="btnGenerarOrden"
                onclick="generarOrden()"
                class="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl transition text-sm"
            >
                🛠 Generar Orden de Servicio
            </button>
            <button
                onclick="cerrarDetalle()"
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-3 rounded-xl transition text-sm"
            >
                Cerrar
            </button>
        `;
    } else {
        botones.innerHTML = `
            <div class="w-full bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 font-semibold text-center">
                ✅ Orden de servicio generada: <span class="font-mono">${ps.folioOrden || '—'}</span>
            </div>
            <button onclick="cerrarDetalle()" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-3 rounded-xl transition text-sm mt-2">
                Cerrar
            </button>
        `;
    }

    modal.classList.remove('hidden');
};

// ======================================
// CALCULAR SIGUIENTE FOLIO DE ORDEN
// ======================================

async function calcularSiguienteFolio() {
    try {
        const q = query(collection(db, 'ordenes'), orderBy('folio', 'desc'), limit(1));
        const snap = await getDocs(q);
        let num = 1;
        if (!snap.empty) {
            const f = snap.docs[0].data().folio || '';
            const n = parseInt(f.replace('OS-26', ''));
            if (!isNaN(n)) num = n + 1;
        }
        return 'OS-26' + String(num).padStart(5, '0');
    } catch {
        return 'OS-26?????';
    }
}

// ======================================
// GENERAR ORDEN DE SERVICIO
// ======================================

window.generarOrden = async function() {
    if (!presolicitudActual) return;

    const ps       = presolicitudActual;
    const btn      = document.getElementById('btnGenerarOrden');
    const msgModal = document.getElementById('mensajeModal');

    btn.disabled    = true;
    btn.textContent = '⏳ Generando...';

    try {
        const folioOrden = await calcularSiguienteFolio();

        // Crear orden de servicio con todos los campos de la presolicitud
        await addDoc(collection(db, 'ordenes'), {
            folio:              folioOrden,
            area:               ps.area        || '',
            equipo:             ps.equipo      || '',
            kilometraje:        ps.kilometraje || '',
            horometro:          ps.horometro   || '',
            operador:           ps.operador    || '',
            tecnico:            ps.tecnico     || '',
            tipo:               ps.tipo        || 'Correctivo',
            prioridad:          ps.prioridad   || 'Media',
            descripcion:        ps.descripcion || '',
            fecha:              new Date().toLocaleString('es-MX'),
            estado:             'Pendiente',
            presolicitudOrigen: ps.folio,
            jefeOrigen:         ps.creadoPor   || '',
            nombreJefeOrigen:   ps.nombreJefe  || ''
        });

        // Marcar presolicitud como convertida
        await updateDoc(doc(db, 'presolicitudes', ps.id), {
            estado:       'convertida',
            ordenGenerada: true,
            folioOrden
        });

        // Actualizar en memoria
        const idx = todasLasPresolicitudes.findIndex(p => p.id === ps.id);
        if (idx !== -1) {
            todasLasPresolicitudes[idx].estado       = 'convertida';
            todasLasPresolicitudes[idx].ordenGenerada = true;
            todasLasPresolicitudes[idx].folioOrden   = folioOrden;
        }

        // Bitácora
        await registrarEvento(
            'presolicitud_convertida',
            `Presolicitud ${ps.folio} convertida a Orden ${folioOrden} por admin`,
            { folio: ps.folio, objetivo: folioOrden }
        );

        // Mostrar éxito en modal
        msgModal.textContent = `✅ Orden ${folioOrden} generada correctamente`;
        msgModal.className   = 'rounded-xl px-4 py-3 text-sm font-semibold bg-green-100 text-green-700 mb-4';
        msgModal.classList.remove('hidden');

        // Actualizar panel
        document.getElementById('panelGenerarOrden').classList.add('hidden');
        document.getElementById('botonesDetalle').innerHTML = `
            <div class="w-full bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 font-semibold text-center">
                ✅ Orden de servicio generada: <span class="font-mono">${folioOrden}</span>
            </div>
            <button onclick="cerrarDetalle()" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-3 rounded-xl transition text-sm mt-2">
                Cerrar
            </button>
        `;

        renderTabla();

    } catch (error) {
        console.error('Error generando orden:', error);
        msgModal.textContent = '❌ Error al generar la orden. Intenta de nuevo.';
        msgModal.className   = 'rounded-xl px-4 py-3 text-sm font-semibold bg-red-100 text-red-700 mb-4';
        msgModal.classList.remove('hidden');
        btn.disabled    = false;
        btn.textContent = '🛠 Generar Orden de Servicio';
    }
};

// ======================================
// CERRAR MODAL
// ======================================

window.cerrarDetalle = function() {
    modal.classList.add('hidden');
    presolicitudActual = null;
};

document.getElementById('btnCerrarDetalle').addEventListener('click', () => {
    cerrarDetalle();
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarDetalle();
});

// ======================================
// FILTROS
// ======================================

filtroEstado.addEventListener('change', renderTabla);
filtroJefe.addEventListener('change', renderTabla);
filtroPrioridad.addEventListener('change', renderTabla);

// ======================================
// INICIALIZAR
// ======================================

cargarPresolicitudes();
