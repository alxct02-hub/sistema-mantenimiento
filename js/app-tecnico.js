import { db } from './firebase-config.js';

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// VERIFICAR SESIÓN - SOLO TÉCNICOS
// ======================================

const sesionGuardada = localStorage.getItem('sesion');
const tokenGuardado = localStorage.getItem('token');

if (!sesionGuardada || !tokenGuardado) {
    window.location.href = '../login.html';
}

const sesionActual = sesionGuardada ? JSON.parse(sesionGuardada) : null;

if (!sesionActual || sesionActual.rol !== 'tecnico') {
    localStorage.removeItem('sesion');
    localStorage.removeItem('token');
    window.location.href = '../login.html';
}

// ======================================
// MOSTRAR INFO DEL TÉCNICO
// ======================================

const infoTecnico = document.getElementById('infoTecnico');
const nombreTecnicoEl = document.getElementById('nombreTecnico');
const idTecnicoEl = document.getElementById('idTecnico');

if (nombreTecnicoEl) {
    nombreTecnicoEl.textContent = sesionActual.nombre;
}
if (idTecnicoEl) {
    idTecnicoEl.textContent = sesionActual.tecnicoId || 'Sin ID';
}

// ======================================
// API IMGBB
// ======================================

const API_KEY = '666f2e6d2f71a9117e585dd3ec86aa60';

// ======================================
// CONTENEDOR
// ======================================

const contenedor = document.getElementById('contenedorOrdenes');

// ======================================
// CERRAR SESIÓN
// ======================================

const btnCerrarSesion = document.getElementById('btnCerrarSesionTecnico');
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
        localStorage.removeItem('sesion');
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    });
}

// ======================================
// INICIALIZAR
// ======================================

cargarOrdenes();

// ======================================
// CARGAR ÓRDENES
// ======================================

async function cargarOrdenes() {

    try {

        contenedor.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <p class="text-lg">Cargando órdenes...</p>
            </div>
        `;

        const snapshot = await getDocs(collection(db, 'ordenes'));

        contenedor.innerHTML = '';

        let hayOrdenes = false;

        snapshot.forEach((documento) => {

            const orden = documento.data();
            const id = documento.id;

            if (orden.estado === 'Completada') {
                return;
            }

            hayOrdenes = true;

            let colorPrioridad = '';

            if (orden.prioridad === 'Alta') {
                colorPrioridad = 'text-red-600';
            } else if (orden.prioridad === 'Media') {
                colorPrioridad = 'text-yellow-600';
            } else {
                colorPrioridad = 'text-green-600';
            }

            let colorEstado = '';
            let esOrdenMia = orden.tecnico === sesionActual.nombre || orden.tecnicoId === sesionActual.tecnicoId;

            if (orden.estado === 'Pendiente') {
                colorEstado = 'bg-yellow-100 text-yellow-700';
            } else if (orden.estado === 'En proceso') {
                colorEstado = 'bg-blue-100 text-blue-700';
            } else {
                colorEstado = 'bg-green-100 text-green-700';
            }

            const card = document.createElement('div');

            card.className = `bg-white rounded-xl shadow p-5 ${esOrdenMia ? 'border-l-4 border-blue-500' : ''}`;

            card.innerHTML = `
                <!-- HEADER -->
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold">${orden.folio}</h3>
                        <p class="text-gray-500">${orden.equipo}</p>
                        ${esOrdenMia ? `<span class="text-xs text-blue-600 font-bold">✔ Asignada a ti</span>` : ''}
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-bold ${colorEstado}">
                        ${orden.estado}
                    </span>
                </div>

                <!-- DATOS -->
                <div class="space-y-2 text-sm">
                    <p><strong>Área:</strong> ${orden.area || '-'}</p>
                    <p><strong>Técnico asignado:</strong> ${orden.tecnico || '<span class="text-gray-400 italic">Sin asignar</span>'}</p>
                    <p><strong>Prioridad:</strong> <span class="${colorPrioridad} font-bold">${orden.prioridad}</span></p>
                    <p><strong>Tipo:</strong> ${orden.tipo || '-'}</p>
                </div>

                <!-- DESCRIPCIÓN -->
                <div class="mt-4">
                    <p class="font-bold mb-1">Descripción:</p>
                    <p class="text-gray-600">${orden.descripcion || '-'}</p>
                </div>

                <!-- HORAS -->
                <div class="mt-4 bg-gray-100 rounded-lg p-3 text-sm">
                    <p><strong>Hora inicio:</strong> ${orden.horaInicio || '-'}</p>
                    <p><strong>Hora final:</strong> ${orden.horaFin || '-'}</p>
                </div>

                <!-- OBSERVACIONES -->
                <div class="mt-4">
                    <label class="block mb-2 font-bold">Observaciones</label>
                    <textarea
                        id="obs-${id}"
                        class="w-full border rounded-lg p-3"
                        rows="3"
                    >${orden.observaciones || ''}</textarea>
                </div>

                <!-- EVIDENCIA -->
                <div class="mt-4">
                    <label class="block mb-2 font-bold">Evidencia fotográfica</label>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        id="file-${id}"
                        class="w-full border rounded-lg p-2"
                    >
                </div>

                <!-- IMAGEN EXISTENTE -->
                <div class="mt-4">
                    ${orden.evidencia ? `<img src="${orden.evidencia}" class="w-full rounded-lg shadow">` : ''}
                </div>

                <!-- BOTONES -->
                <div class="grid grid-cols-2 gap-3 mt-5">
                    <button
                        onclick="iniciarOrden('${id}')"
                        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition ${orden.estado !== 'Pendiente' ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${orden.estado !== 'Pendiente' ? 'disabled' : ''}
                    >
                        ▶ Iniciar
                    </button>
                    <button
                        onclick="finalizarOrden('${id}')"
                        class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition ${orden.estado !== 'En proceso' ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${orden.estado !== 'En proceso' ? 'disabled' : ''}
                    >
                        ✓ Finalizar
                    </button>
                </div>
            `;

            contenedor.appendChild(card);

        });

        if (!hayOrdenes) {
            contenedor.innerHTML = `
                <div class="bg-white rounded-xl shadow p-8 text-center">
                    <p class="text-gray-500 text-lg">No hay órdenes activas en este momento</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error cargando órdenes:', error);
        contenedor.innerHTML = `
            <div class="bg-white rounded-xl shadow p-8 text-center">
                <p class="text-red-500">Error al cargar órdenes. Intenta de nuevo.</p>
            </div>
        `;
    }

}

// ======================================
// INICIAR ORDEN (identifica al técnico automáticamente)
// ======================================

window.iniciarOrden = async function (id) {

    try {

        const horaInicio = new Date().toLocaleString('es-MX');
        const ordenRef = doc(db, 'ordenes', id);

        await updateDoc(ordenRef, {
            estado: 'En proceso',
            horaInicio,
            tecnico: sesionActual.nombre,
            tecnicoId: sesionActual.tecnicoId || '',
            tecnicoUsuario: sesionActual.usuario
        });

        alert(`✅ Orden iniciada\nTécnico: ${sesionActual.nombre} (${sesionActual.tecnicoId || 'Sin ID'})`);
        cargarOrdenes();

    } catch (error) {
        console.error(error);
        alert('❌ Error al iniciar la orden');
    }

};

// ======================================
// FINALIZAR ORDEN
// ======================================

window.finalizarOrden = async function (id) {

    try {

        const observaciones = document.getElementById(`obs-${id}`).value;
        const archivo = document.getElementById(`file-${id}`).files[0];

        let imagenURL = '';

        if (archivo) {

            const formData = new FormData();
            formData.append('image', archivo);

            const response = await fetch(
                `https://api.imgbb.com/1/upload?key=${API_KEY}`,
                { method: 'POST', body: formData }
            );

            const data = await response.json();
            imagenURL = data.data.url;

        }

        const horaFin = new Date().toLocaleString('es-MX');
        const ordenRef = doc(db, 'ordenes', id);

        await updateDoc(ordenRef, {
            estado: 'Completada',
            horaFin,
            observaciones,
            evidencia: imagenURL,
            tecnico: sesionActual.nombre,
            tecnicoId: sesionActual.tecnicoId || '',
            tecnicoUsuario: sesionActual.usuario
        });

        alert('✅ Orden finalizada correctamente');
        cargarOrdenes();

    } catch (error) {
        console.error(error);
        alert('❌ Error al finalizar la orden');
    }

};
