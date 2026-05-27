// ======================================
// FIRESTORE
// ======================================

const db = firebase.firestore();

// ======================================
// VARIABLES
// ======================================

let ordenesData = [];

// ======================================
// CARGAR ÓRDENES
// ======================================

async function cargarOrdenes() {

    try {

        const snapshot = await db

        .collection('ordenes')

        .orderBy('fechaCreacion', 'desc')

        .get();

        ordenesData = [];

        let total = 0;
        let pendientes = 0;
        let completadas = 0;
        let proceso = 0;
        let prioridadAlta = 0;

        snapshot.forEach((doc) => {

            const orden = doc.data();

            orden.id = doc.id;

            ordenesData.push(orden);

            total++;

            // ESTADOS
            if (

                orden.estado === 'Completada' ||

                orden.estado === 'Finalizada'

            ) {

                completadas++;

            }

            else if (

                orden.estado === 'En Proceso'

            ) {

                proceso++;

            }

            else {

                pendientes++;

            }

            // PRIORIDAD
            if (

                orden.prioridad === 'Alta'

            ) {

                prioridadAlta++;

            }

        });

        // ======================================
        // KPI
        // ======================================

        actualizarKPIs(

            total,
            pendientes,
            completadas,
            proceso,
            prioridadAlta

        );

        // ======================================
        // TABLA
        // ======================================

        renderizarTabla();

    }

    catch (error) {

        console.error(

            'Error cargando órdenes:',

            error

        );

    }

}

// ======================================
// KPI
// ======================================

function actualizarKPIs(

    total,
    pendientes,
    completadas,
    proceso,
    prioridadAlta

) {

    const totalOrdenes = document.getElementById(

        'totalOrdenes'

    );

    const pendientesHTML = document.getElementById(

        'pendientes'

    );

    const completadasHTML = document.getElementById(

        'completadas'

    );

    const procesoHTML = document.getElementById(

        'enProceso'

    );

    const prioridadHTML = document.getElementById(

        'prioridadAlta'

    );

    if (totalOrdenes) {

        totalOrdenes.innerText = total;

    }

    if (pendientesHTML) {

        pendientesHTML.innerText = pendientes;

    }

    if (completadasHTML) {

        completadasHTML.innerText = completadas;

    }

    if (procesoHTML) {

        procesoHTML.innerText = proceso;

    }

    if (prioridadHTML) {

        prioridadHTML.innerText = prioridadAlta;

    }

}

// ======================================
// TABLA
// ======================================

function renderizarTabla() {

    const tbody = document.getElementById(

        'tablaOrdenes'

    );

    if (!tbody) return;

    tbody.innerHTML = '';

    ordenesData.forEach((orden) => {

        const fila = document.createElement('tr');

        fila.className =

        'border-b hover:bg-gray-50';

        fila.innerHTML = `

            <td class="px-4 py-3">

                ${orden.folio || '-'}

            </td>

            <td class="px-4 py-3">

                ${orden.equipo || '-'}

            </td>

            <td class="px-4 py-3">

                ${orden.tipo || '-'}

            </td>

            <td class="px-4 py-3">

                ${orden.tecnico || '-'}

            </td>

            <td class="px-4 py-3">

                <span class="px-3 py-1 rounded-full text-xs font-bold
                ${obtenerColorPrioridad(orden.prioridad)}">

                    ${orden.prioridad || '-'}

                </span>

            </td>

            <td class="px-4 py-3">

                <span class="px-3 py-1 rounded-full text-xs font-bold
                ${obtenerColorEstado(orden.estado)}">

                    ${orden.estado || '-'}

                </span>

            </td>

            <td class="px-4 py-3">

                ${orden.fecha || '-'}

            </td>

        `;

        tbody.appendChild(fila);

    });

}

// ======================================
// COLOR PRIORIDAD
// ======================================

function obtenerColorPrioridad(prioridad) {

    switch (prioridad) {

        case 'Alta':

            return 'bg-red-100 text-red-700';

        case 'Media':

            return 'bg-yellow-100 text-yellow-700';

        default:

            return 'bg-green-100 text-green-700';

    }

}

// ======================================
// COLOR ESTADO
// ======================================

function obtenerColorEstado(estado) {

    switch (estado) {

        case 'Completada':

        case 'Finalizada':

            return 'bg-green-100 text-green-700';

        case 'En Proceso':

            return 'bg-blue-100 text-blue-700';

        default:

            return 'bg-yellow-100 text-yellow-700';

    }

}

// ======================================
// INICIAR
// ======================================

document.addEventListener(

    'DOMContentLoaded',

    cargarOrdenes

);