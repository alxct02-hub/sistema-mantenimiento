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

        actualizarKPIs(
            total,
            pendientes,
            completadas,
            proceso
        );

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

    const totalHTML =
    document.getElementById('totalOrdenes');

    const pendientesHTML =
    document.getElementById('pendientes');

    const completadasHTML =
    document.getElementById('completadas');

    const procesoHTML =
    document.getElementById('enProceso');

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

    const tbody =
    document.getElementById('tablaOrdenes');

    if(!tbody) return;

    tbody.innerHTML = '';

    ordenesData.forEach((orden) => {

        const fila =
        document.createElement('tr');

        fila.innerHTML = `

            <td class="border px-4 py-2">
                ${orden.folio || '-'}
            </td>

            <td class="border px-4 py-2">
                ${orden.equipo || '-'}
            </td>

            <td class="border px-4 py-2">
                ${orden.tecnico || '-'}
            </td>

            <td class="border px-4 py-2">
                ${orden.estado || '-'}
            </td>

            <td class="border px-4 py-2">
                ${orden.fecha || '-'}
            </td>

        `;

        tbody.appendChild(fila);

    });

}

// ======================================
// INICIAR
// ======================================

document.addEventListener(
    'DOMContentLoaded',
    cargarOrdenes
);