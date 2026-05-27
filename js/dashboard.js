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

        .get();

        ordenesData = [];

        let total = 0;
        let pendientes = 0;
        let completadas = 0;
        let proceso = 0;

        snapshot.forEach((doc) => {

            const orden = doc.data();

            orden.id = doc.id;

            ordenesData.push(orden);

            total++;

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

        });

        // KPI
        actualizarKPIs(

            total,
            pendientes,
            completadas,
            proceso

        );

        // TABLA
        renderizarTabla();

    }

    catch(error){

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
    proceso

){

    const totalHTML = document.getElementById(

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

    if(totalHTML){

        totalHTML.innerText = total;

    }

    if(pendientesHTML){

        pendientesHTML.innerText = pendientes;

    }

    if(completadasHTML){

        completadasHTML.innerText = completadas;

    }

    if(procesoHTML){

        procesoHTML.innerText = proceso;

    }

}

// ======================================
// TABLA
// ======================================

function renderizarTabla(){

    const tbody = document.getElementById(

        'tablaOrdenes'

    );

    if(!tbody) return;

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

                ${orden.tecnico || '-'}

            </td>

            <td class="px-4 py-3">

                <span class="${obtenerClaseEstado(orden.estado)} px-3 py-1 rounded-full text-xs font-bold">

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
// ESTADOS
// ======================================

function obtenerClaseEstado(estado){

    switch(estado){

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