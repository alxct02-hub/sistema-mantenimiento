import { db } from './firebase-config.js';

import {

    collection,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Contenedor
const contenedor =

    document.getElementById('contenedorOrdenes');

// Inicializar
cargarOrdenes();

// =======================================
// CARGAR ÓRDENES
// =======================================

async function cargarOrdenes(){

    try{

        // Limpiar
        contenedor.innerHTML = '';

        // Obtener órdenes
        const snapshot = await getDocs(

            collection(db, 'ordenes')

        );

        // Recorrer órdenes
        snapshot.forEach((doc) => {

            const orden = doc.data();

            // Crear tarjeta
            const card = document.createElement('div');

            card.className =

                'bg-white rounded-xl shadow p-5';

            // Color prioridad
            let colorPrioridad = '';

            if(orden.prioridad === 'Alta'){

                colorPrioridad =
                    'text-red-600';

            }

            else if(orden.prioridad === 'Media'){

                colorPrioridad =
                    'text-yellow-600';

            }

            else{

                colorPrioridad =
                    'text-green-600';

            }

            // Estado color
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

            // Tarjeta HTML
            card.innerHTML = `

                <!-- Header -->
                <div class="flex justify-between items-start mb-4">

                    <div>

                        <h3 class="text-xl font-bold">

                            ${orden.folio}

                        </h3>

                        <p class="text-gray-500">

                            ${orden.equipo}

                        </p>

                    </div>

                    <span class="px-3 py-1 rounded-full text-sm font-bold ${colorEstado}">

                        ${orden.estado}

                    </span>

                </div>

                <!-- Datos -->
                <div class="space-y-2 text-sm">

                    <p>

                        <strong>Área:</strong>
                        ${orden.area || '-'}

                    </p>

                    <p>

                        <strong>Operador:</strong>
                        ${orden.operador || '-'}

                    </p>

                    <p>

                        <strong>Técnico:</strong>
                        ${orden.tecnico || '-'}

                    </p>

                    <p>

                        <strong>Prioridad:</strong>

                        <span class="${colorPrioridad} font-bold">

                            ${orden.prioridad}

                        </span>

                    </p>

                    <p>

                        <strong>Tipo:</strong>
                        ${orden.tipo}

                    </p>

                    <p>

                        <strong>Kilometraje:</strong>
                        ${orden.kilometraje || '-'}

                    </p>

                    <p>

                        <strong>Horómetro:</strong>
                        ${orden.horometro || '-'}

                    </p>

                </div>

                <!-- Descripción -->
                <div class="mt-4">

                    <p class="font-bold mb-1">

                        Descripción:

                    </p>

                    <p class="text-gray-600">

                        ${orden.descripcion}

                    </p>

                </div>

                <!-- Botones -->
                <div class="grid grid-cols-2 gap-3 mt-5">

                    <button
                        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
                    >

                        Iniciar

                    </button>

                    <button
                        class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
                    >

                        Finalizar

                    </button>

                </div>

            `;

            // Agregar tarjeta
            contenedor.appendChild(card);

        });

    }catch(error){

        console.error(

            'Error cargando órdenes:',
            error

        );

    }

}