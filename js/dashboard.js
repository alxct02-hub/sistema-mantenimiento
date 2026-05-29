import { db } from './firebase-config.js';

import {
    collection,
    getDocs
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
    if (sesionActual) {
        if (sesionActual.rol === 'jefe_planta') {
            window.location.href = '../pages/presolicitudes.html';
        } else if (sesionActual.rol === 'tecnico') {
            window.location.href = '../pages/app-tecnico.html';
        } else {
            window.location.href = '../login.html';
        }
    } else {
        window.location.href = '../login.html';
    }
}

// ======================================
// MOSTRAR NOMBRE DE USUARIO
// ======================================

const nombreAdmin = document.getElementById('nombreAdmin');
if (nombreAdmin && sesionActual) {
    nombreAdmin.textContent = sesionActual.nombre || sesionActual.usuario;
}

// ======================================
// CERRAR SESIÓN
// ======================================

const btnCerrarSesion = document.getElementById('btnCerrarSesion');
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
        localStorage.removeItem('sesion');
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    });
}

// ======================================
// ELEMENTOS KPI
// ======================================

const kpiTotal = document.getElementById('kpiTotal');
const kpiPendientes = document.getElementById('kpiPendientes');
const kpiProceso = document.getElementById('kpiProceso');
const kpiCompletadas = document.getElementById('kpiCompletadas');
const kpiEquipo = document.getElementById('kpiEquipo');
const kpiTecnico = document.getElementById('kpiTecnico');
const kpiTiempoPromedio = document.getElementById('kpiTiempoPromedio');

// ======================================
// INICIALIZAR
// ======================================

cargarDashboard();

// ======================================
// CARGAR DASHBOARD
// ======================================

async function cargarDashboard() {

    try {

        const snapshot = await getDocs(collection(db, 'ordenes'));

        let total = 0;
        let pendientes = 0;
        let proceso = 0;
        let completadas = 0;
        let equipos = {};
        let tecnicos = {};
        let tiemposReparacion = [];

        snapshot.forEach((doc) => {

            const orden = doc.data();

            total++;

            if (orden.estado === 'Pendiente') {
                pendientes++;
            } else if (orden.estado === 'En proceso') {
                proceso++;
            } else if (orden.estado === 'Completada') {
                completadas++;
            }

            if (orden.equipo) {
                equipos[orden.equipo] = (equipos[orden.equipo] || 0) + 1;
            }

            if (orden.tecnico) {
                tecnicos[orden.tecnico] = (tecnicos[orden.tecnico] || 0) + 1;
            }

            if (orden.horaInicio && orden.horaFin) {
                const inicio = new Date(orden.horaInicio);
                const fin = new Date(orden.horaFin);
                if (!isNaN(inicio) && !isNaN(fin)) {
                    const diffHoras = (fin - inicio) / (1000 * 60 * 60);
                    if (diffHoras > 0) tiemposReparacion.push(diffHoras);
                }
            }

        });

        if (kpiTotal) kpiTotal.innerText = total;
        if (kpiPendientes) kpiPendientes.innerText = pendientes;
        if (kpiProceso) kpiProceso.innerText = proceso;
        if (kpiCompletadas) kpiCompletadas.innerText = completadas;

        // Equipo con más fallas
        let equipoTop = '-';
        let maxEquipo = 0;
        for (const equipo in equipos) {
            if (equipos[equipo] > maxEquipo) {
                maxEquipo = equipos[equipo];
                equipoTop = equipo;
            }
        }
        if (kpiEquipo) kpiEquipo.innerText = equipoTop;

        // Técnico con más órdenes
        let tecnicoTop = '-';
        let maxTecnico = 0;
        for (const tecnico in tecnicos) {
            if (tecnicos[tecnico] > maxTecnico) {
                maxTecnico = tecnicos[tecnico];
                tecnicoTop = tecnico;
            }
        }
        if (kpiTecnico) kpiTecnico.innerText = tecnicoTop;

        // Tiempo promedio
        let tiempoPromedio = '-';
        if (tiemposReparacion.length > 0) {
            const suma = tiemposReparacion.reduce((a, b) => a + b, 0);
            const promedioHoras = suma / tiemposReparacion.length;
            const horas = Math.floor(promedioHoras);
            const minutos = Math.round((promedioHoras - horas) * 60);
            tiempoPromedio = `${horas}h ${minutos}m`;
        }
        if (kpiTiempoPromedio) kpiTiempoPromedio.innerText = tiempoPromedio;

        crearGrafica(pendientes, proceso, completadas);

    } catch (error) {
        console.error('Error dashboard:', error);
    }

}

// ======================================
// CREAR GRÁFICA
// ======================================

function crearGrafica(pendientes, proceso, completadas) {

    const canvas = document.getElementById('graficaOrdenes');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pendientes', 'En Proceso', 'Completadas'],
            datasets: [{
                data: [pendientes, proceso, completadas],
                backgroundColor: ['#facc15', '#3b82f6', '#22c55e'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

}
