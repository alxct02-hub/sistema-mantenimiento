/// ======================================
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

        .get();

        ordenesData = [];

        let total = 0;
        let pendientes = 0;
        let completadas = 0;

        snapshot.forEach((doc) => {

            const orden = doc.data();

            orden.id = doc.id;

            ordenesData.push(orden);

            total++;

            if (

                orden.estado === 'Completada'

            ) {

                completadas++;

            }

            else {

                pendientes++;

            }

        });

        // KPI
        document.getElementById(

            'totalOrdenes'

        ).innerText = total;

        document.getElementById(

            'pendientes'

        ).innerText = pendientes;

        document.getElementById(

            'completadas'

        ).innerText = completadas;

        // TABLA
        renderizarTabla();

    }

    catch(error){

        console.error(

            'Error cargando órdenes',

            error

        );

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