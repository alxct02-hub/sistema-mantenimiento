import { db } from './firebase-config.js';

import {

    collection,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Elementos
const totalOrdenes =
    document.getElementById('totalOrdenes');

const pendientes =
    document.getElementById('pendientes');

const completadas =
    document.getElementById('completadas');

const prioridadAlta =
    document.getElementById('prioridadAlta');

const tabla =
    document.getElementById('tablaReportes');

// Inicializar
cargarReportes();

// ====================================
// CARGAR REPORTES
// ====================================

async function cargarReportes(){

    try{

        // Obtener órdenes
        const snapshot = await getDocs(

            collection(db, 'ordenes')

        );

        // Variables
        let total = 0;

        let pendientesCount = 0;

        let completadasCount = 0;

        let prioridadAltaCount = 0;

        // Limpiar tabla
        tabla.innerHTML = '';

        // Recorrer órdenes
        snapshot.forEach((doc) => {

            const orden = doc.data();

            total++;

            // Pendientes
            if(orden.estado === 'Pendiente'){

                pendientesCount++;

            }

            // Completadas
            if(orden.estado === 'Completada'){

                completadasCount++;

            }

            // Prioridad alta
            if(orden.prioridad === 'Alta'){

                prioridadAltaCount++;

            }

            // Crear fila
            const fila = document.createElement('tr');

            fila.className =
                'border-b hover:bg-gray-50';

            // Colores prioridad
            let colorPrioridad = '';

            if(orden.prioridad === 'Alta'){

                colorPrioridad =
                    'text-red-600 font-bold';

            }

            else if(orden.prioridad === 'Media'){

                colorPrioridad =
                    'text-yellow-600 font-bold';

            }

            else{

                colorPrioridad =
                    'text-green-600 font-bold';

            }

            // Estado color
            let colorEstado = '';

            if(orden.estado === 'Pendiente'){

                colorEstado =
                    'text-yellow-600 font-bold';

            }

            else{

                colorEstado =
                    'text-green-600 font-bold';

            }

            // Fila HTML
            fila.innerHTML = `

                <td class="px-6 py-4 font-bold">

                    ${orden.folio || '-'}

                </td>

                <td class="px-6 py-4">

                    ${orden.equipo || '-'}

                </td>

                <td class="px-6 py-4">

                    ${orden.tecnico || '-'}

                </td>

                <td class="px-6 py-4 ${colorPrioridad}">

                    ${orden.prioridad || '-'}

                </td>

                <td class="px-6 py-4 ${colorEstado}">

                    ${orden.estado || '-'}

                </td>

                <td class="px-6 py-4">

                    ${orden.fecha || '-'}

                </td>

            `;

            // Agregar fila
            tabla.appendChild(fila);

        });

        // Actualizar tarjetas
        totalOrdenes.innerText = total;

        pendientes.innerText = pendientesCount;

        completadas.innerText = completadasCount;

        prioridadAlta.innerText = prioridadAltaCount;

    }catch(error){

        console.error(

            'Error cargando reportes:',
            error

        );

    }

}