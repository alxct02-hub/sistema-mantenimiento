import { db } from './firebase-config.js';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { TIPOS_EVENTO } from './bitacora-utils.js';

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

const LOTE = 25;
let ultimoDoc     = null;
let hayMas        = false;
let totalCargados = 0;

// ======================================
// ELEMENTOS
// ======================================

const contenedor       = document.getElementById('contenedorBitacora');
const contador         = document.getElementById('contadorEventos');
const btnCargarMas     = document.getElementById('btnCargarMas');
const filtroTipo       = document.getElementById('filtroTipo');
const filtroPeriodo    = document.getElementById('filtroPeriodo');
const filtroUsuario    = document.getElementById('filtroUsuario');

// ======================================
// CARGAR EVENTOS
// ======================================

async function cargarEventos(reiniciar = true) {

    if (reiniciar) {
        ultimoDoc     = null;
        totalCargados = 0;
        contenedor.innerHTML = `
            <div class="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                Cargando...
            </div>
        `;
        btnCargarMas.classList.add('hidden');
    }

    try {
        const tipo    = filtroTipo.value;
        const dias    = parseInt(filtroPeriodo.value);
        const usuario = filtroUsuario.value.trim().toLowerCase();

        // Construir query base
        let constraints = [
            orderBy('timestamp', 'desc'),
            limit(LOTE + 1)
        ];

        // Filtro por tipo
        if (tipo) {
            constraints.unshift(where('tipo', '==', tipo));
        }

        // Filtro por período
        if (dias > 0) {
            const desde = new Date();
            desde.setDate(desde.getDate() - dias);
            constraints.unshift(where('timestamp', '>=', desde));
        }

        // Paginación: desde el último doc
        if (!reiniciar && ultimoDoc) {
            constraints.push(startAfter(ultimoDoc));
        }

        const q        = query(collection(db, 'bitacora'), ...constraints);
        const snapshot = await getDocs(q);
        const docs     = snapshot.docs;

        // ¿Hay más?
        hayMas = docs.length > LOTE;
        const lote = hayMas ? docs.slice(0, LOTE) : docs;
        ultimoDoc = lote[lote.length - 1] || null;
        totalCargados += lote.length;

        // Filtro local por usuario (no se puede hacer en Firestore fácilmente)
        const filtrados = usuario
            ? lote.filter(d => {
                const u = d.data();
                return (u.usuario      || '').toLowerCase().includes(usuario)
                    || (u.nombreUsuario || '').toLowerCase().includes(usuario);
              })
            : lote;

        // Renderizar
        if (reiniciar) {
            contenedor.innerHTML = '';
        }

        if (filtrados.length === 0 && reiniciar) {
            contenedor.innerHTML = `
                <div class="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                    <p class="text-4xl mb-3">📋</p>
                    <p class="font-semibold">No hay eventos con ese filtro</p>
                    <p class="text-sm mt-1">Las acciones del sistema aparecerán aquí automáticamente</p>
                </div>
            `;
            contador.textContent = '';
            btnCargarMas.classList.add('hidden');
            return;
        }

        filtrados.forEach(docSnap => {
            const ev = docSnap.data();
            contenedor.appendChild(crearTarjetaEvento(ev));
        });

        // Contador
        contador.textContent = totalCargados === 1
            ? '1 evento'
            : `${totalCargados} eventos${hayMas ? ' (hay más)' : ''}`;

        // Botón cargar más
        if (hayMas) {
            btnCargarMas.classList.remove('hidden');
        } else {
            btnCargarMas.classList.add('hidden');
        }

    } catch (error) {
        console.error('Error cargando bitácora:', error);
        if (reiniciar) {
            contenedor.innerHTML = `
                <div class="bg-white rounded-xl shadow p-10 text-center text-red-400">
                    Error al cargar la bitácora. Verifica la conexión.
                </div>
            `;
        }
    }
}

// ======================================
// CREAR TARJETA DE EVENTO
// ======================================

function crearTarjetaEvento(ev) {

    const info   = TIPOS_EVENTO[ev.tipo] || { icono: '📌', label: ev.tipo, color: 'gray' };

    const colores = {
        blue:   'bg-blue-50   border-blue-200   text-blue-700',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        green:  'bg-green-50  border-green-200  text-green-700',
        purple: 'bg-purple-50 border-purple-200 text-purple-700',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        red:    'bg-red-50    border-red-200    text-red-700',
        teal:   'bg-teal-50   border-teal-200   text-teal-700',
        orange: 'bg-orange-50 border-orange-200 text-orange-700',
        gray:   'bg-gray-50   border-gray-200   text-gray-600',
    };

    const colorClass = colores[info.color] || colores.gray;

    const rolBadge = ev.rolUsuario === 'admin'
        ? '<span class="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold ml-1">admin</span>'
        : ev.rolUsuario === 'jefe_planta'
        ? '<span class="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold ml-1">jefe planta</span>'
        : ev.rolUsuario === 'tecnico'
        ? '<span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold ml-1">técnico</span>'
        : '';

    const extras = [];
    if (ev.folio)    extras.push(`<span class="font-mono bg-white border px-2 py-0.5 rounded text-xs text-gray-700">${ev.folio}</span>`);
    if (ev.objetivo) extras.push(`<span class="text-xs text-gray-500">→ ${ev.objetivo}</span>`);

    const div = document.createElement('div');
    div.className = `bg-white rounded-xl shadow border-l-4 ${colorClass.split(' ')[0]} border-${info.color}-300 px-5 py-4 flex items-start gap-4 hover:shadow-md transition`;

    div.innerHTML = `
        <!-- Ícono -->
        <div class="text-2xl mt-0.5 select-none flex-shrink-0">${info.icono}</div>

        <!-- Contenido -->
        <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="text-xs font-bold px-2 py-0.5 rounded-full border ${colorClass}">${info.label}</span>
                ${extras.join(' ')}
            </div>
            <p class="text-gray-800 text-sm font-medium leading-snug">${ev.descripcion}</p>
            <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                <span class="flex items-center gap-1">
                    👤 <strong class="text-gray-600">${ev.nombreUsuario || ev.usuario}</strong>
                    <span class="font-mono text-gray-400">(${ev.usuario})</span>
                    ${rolBadge}
                </span>
                <span>🕐 ${ev.fechaTexto || '—'}</span>
            </div>
        </div>
    `;

    return div;
}

// ======================================
// EVENTOS DE FILTROS
// ======================================

document.getElementById('btnBuscar').addEventListener('click', () => cargarEventos(true));

filtroTipo.addEventListener('change',    () => cargarEventos(true));
filtroPeriodo.addEventListener('change', () => cargarEventos(true));

filtroUsuario.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') cargarEventos(true);
});

btnCargarMas.addEventListener('click', () => cargarEventos(false));

document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
    filtroTipo.value    = '';
    filtroPeriodo.value = '30';
    filtroUsuario.value = '';
    cargarEventos(true);
});

// ======================================
// INICIALIZAR
// ======================================

cargarEventos(true);
