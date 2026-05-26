import { db } from './firebase-config.js';

import {

    collection,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// ELEMENTOS
// ======================================

const tabla = document.getElementById('tablaHistorial');

// ======================================
// INICIALIZAR
// ======================================

cargarHistorial();

// ======================================
// CARGAR HISTORIAL
// ======================================

async function cargarHistorial(){

    try{

        // Limpiar tabla
        tabla.innerHTML = '';

        // Obtener órdenes
        const snapshot = await getDocs(

            collection(db, 'ordenes')

        );

        // Recorrer documentos
        snapshot.forEach((documento) => {

            // Datos
            const orden = documento.data();

            // Crear fila
            const fila = document.createElement('tr');

            fila.className =

                'border-b hover:bg-gray-50 transition';

            // ======================================
            // COLOR PRIORIDAD
            // ======================================

            let colorPrioridad = '';

            if(orden.prioridad === 'Alta'){

                colorPrioridad =
                    'bg-red-100 text-red-700';

            }

            else if(orden.prioridad === 'Media'){

                colorPrioridad =
                    'bg-yellow-100 text-yellow-700';

            }

            else{

                colorPrioridad =
                    'bg-green-100 text-green-700';

            }

            // ======================================
            // COLOR ESTADO
            // ======================================

            let colorEstado = '';

            if(orden.estado === 'Pendiente'){

                colorEstado =
                    'bg-yellow-100 text-yellow-700';

            }

            else if(orden.estado === 'En proceso'){

                colorEstado =
                    'bg-blue-100 text-blue-700';

            }

            else{

                colorEstado =
                    'bg-green-100 text-green-700';

            }

            // ======================================
            // HTML FILA
            // ======================================

            fila.innerHTML = `

                <!-- Folio -->
                <td class="px-6 py-4 font-bold">

                    ${orden.folio || '-'}

                </td>

                <!-- Equipo -->
                <td class="px-6 py-4">

                    ${orden.equipo || '-'}

                </td>

                <!-- Técnico -->
                <td class="px-6 py-4">

                    ${orden.tecnico || '-'}

                </td>

                <!-- Prioridad -->
                <td class="px-6 py-4">

                    <span class="px-3 py-1 rounded-full text-xs font-bold ${colorPrioridad}">

                        ${orden.prioridad || '-'}

                    </span>

                </td>

                <!-- Estado -->
                <td class="px-6 py-4">

                    <span class="px-3 py-1 rounded-full text-xs font-bold ${colorEstado}">

                        ${orden.estado || '-'}

                    </span>

                </td>

                <!-- Fecha -->
                <td class="px-6 py-4">

                    ${orden.fecha || '-'}

                </td>

                <!-- PDF -->
                <td class="px-6 py-4 text-center">

                    <button
                        onclick="generarPDF('${orden.folio}')"
                        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                    >

                        PDF

                    </button>

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

        tabla.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center py-10 text-red-600 font-bold"
                >

                    Error cargando historial

                </td>

            </tr>

        `;

    }

}