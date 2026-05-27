import { db } from './firebase-config.js';

import {

    collection,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// ELEMENTOS KPI
// ======================================

const kpiTotal =

    document.getElementById('kpiTotal');

const kpiPendientes =

    document.getElementById('kpiPendientes');

const kpiProceso =

    document.getElementById('kpiProceso');

const kpiCompletadas =

    document.getElementById('kpiCompletadas');

const kpiEquipo =

    document.getElementById('kpiEquipo');

const kpiTecnico =

    document.getElementById('kpiTecnico');

// ======================================
// INICIALIZAR
// ======================================

cargarDashboard();

// ======================================
// CARGAR DASHBOARD
// ======================================

async function cargarDashboard(){

    try{

        // ======================================
        // OBTENER ÓRDENES
        // ======================================

        const snapshot = await getDocs(

            collection(db, 'ordenes')

        );

        // ======================================
        // VARIABLES KPI
        // ======================================

        let total = 0;

        let pendientes = 0;

        let proceso = 0;

        let completadas = 0;

        // ======================================
        // CONTADORES
        // ======================================

        let equipos = {};

        let tecnicos = {};

        // ======================================
        // RECORRER ÓRDENES
        // ======================================

        snapshot.forEach((doc) => {

            const orden = doc.data();

            total++;

            // ======================================
            // ESTADOS
            // ======================================

            if(orden.estado === 'Pendiente'){

                pendientes++;

            }

            else if(orden.estado === 'En proceso'){

                proceso++;

            }

            else if(orden.estado === 'Completada'){

                completadas++;

            }

            // ======================================
            // EQUIPOS
            // ======================================

            if(orden.equipo){

                if(!equipos[orden.equipo]){

                    equipos[orden.equipo] = 0;

                }

                equipos[orden.equipo]++;

            }

            // ======================================
            // TÉCNICOS
            // ======================================

            if(orden.tecnico){

                if(!tecnicos[orden.tecnico]){

                    tecnicos[orden.tecnico] = 0;

                }

                tecnicos[orden.tecnico]++;

            }

        });

        // ======================================
        // ACTUALIZAR KPI
        // ======================================

        kpiTotal.innerText = total;

        kpiPendientes.innerText = pendientes;

        kpiProceso.innerText = proceso;

        kpiCompletadas.innerText = completadas;

        // ======================================
        // EQUIPO MÁS FALLAS
        // ======================================

        let equipoTop = '-';

        let maxEquipo = 0;

        for(const equipo in equipos){

            if(equipos[equipo] > maxEquipo){

                maxEquipo = equipos[equipo];

                equipoTop = equipo;

            }

        }

        kpiEquipo.innerText = equipoTop;

        // ======================================
        // TÉCNICO MÁS ÓRDENES
        // ======================================

        let tecnicoTop = '-';

        let maxTecnico = 0;

        for(const tecnico in tecnicos){

            if(tecnicos[tecnico] > maxTecnico){

                maxTecnico = tecnicos[tecnico];

                tecnicoTop = tecnico;

            }

        }

        kpiTecnico.innerText = tecnicoTop;

        // ======================================
        // CREAR GRÁFICA
        // ======================================

        crearGrafica(

            pendientes,
            proceso,
            completadas

        );

    }catch(error){

        console.error(

            'Error dashboard:',
            error

        );

    }

}

// ======================================
// CREAR GRÁFICA
// ======================================

function crearGrafica(

    pendientes,
    proceso,
    completadas

){

    const ctx = document

        .getElementById('graficaOrdenes')

        .getContext('2d');

    // ======================================
    // CHART
    // ======================================

    new Chart(ctx, {

        type: 'doughnut',

        data: {

            labels: [

                'Pendientes',
                'En Proceso',
                'Completadas'

            ],

            datasets: [

                {

                    data: [

                        pendientes,
                        proceso,
                        completadas

                    ],

                    backgroundColor: [

                        '#facc15',
                        '#3b82f6',
                        '#22c55e'

                    ],

                    borderWidth: 0

                }

            ]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: 'bottom'

                }

            }

        }

    });

}