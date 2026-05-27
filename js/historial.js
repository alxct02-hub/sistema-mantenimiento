import { db } from './firebase-config.js';

import {

    collection,
    getDocs,
    query,
    orderBy

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Tabla
const tabla = document.getElementById('tablaHistorial');

// Inicializar
cargarHistorial();

// =====================================
// CARGAR HISTORIAL
// =====================================

async function cargarHistorial(){

    try{

        // Referencia
        const ordenesRef = collection(db, 'ordenes');

        // Consulta
        const q = query(

            ordenesRef,
            orderBy('fecha', 'desc')

        );

        // Obtener datos
        const snapshot = await getDocs(q);

        // Limpiar tabla
        tabla.innerHTML = '';

        // Recorrer órdenes
        snapshot.forEach((doc) => {

            const orden = doc.data();

            // Crear fila
            const fila = document.createElement('tr');

            fila.className =

                'border-b hover:bg-gray-50';

            // Prioridad color
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

            // Contenido fila
            fila.innerHTML = `

                <td class="px-6 py-4 font-bold">

                    ${orden.folio || '-'}

                </td>

                <td class="px-6 py-4">

                    ${orden.equipo || '-'}

                </td>

                <td class="px-6 py-4">

                    ${orden.operador || '-'}

                </td>

                <td class="px-6 py-4">

                    ${orden.tecnico || '-'}

                </td>

                <td class="px-6 py-4">

                    ${orden.tipo || '-'}

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

    }catch(error){

        console.error(

            'Error cargando historial:',
            error

        );

    }

}