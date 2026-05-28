import { db } from './firebase-config.js';

import {

    collection,
    getDocs,
    doc,
    updateDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// API IMGBB
// ======================================

const API_KEY =

    '666f2e6d2f71a9117e585dd3ec86aa60';

// ======================================
// CONTENEDOR
// ======================================

const contenedor =

    document.getElementById('contenedorOrdenes');

// ======================================
// INICIALIZAR
// ======================================

cargarOrdenes();

// ======================================
// CARGAR ÓRDENES
// ======================================

async function cargarOrdenes(){

    try{

        contenedor.innerHTML = '';

        const snapshot = await getDocs(

            collection(db, 'ordenes')

        );

        snapshot.forEach((documento) => {

            const orden = documento.data();

            const id = documento.id;

            // ======================================
            // FILTRAR COMPLETADAS
            // ======================================

            if(orden.estado === 'Completada'){
                return; // Saltar ordenes completadas
            }

            // ======================================
            // COLORES
            // ======================================

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
            // TARJETA
            // ======================================

            const card = document.createElement('div');

            card.className =

                'bg-white rounded-xl shadow p-5';

            card.innerHTML = `

                <!-- HEADER -->
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

                <!-- DATOS -->
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
                        ${orden.tipo || '-'}

                    </p>

                </div>

                <!-- DESCRIPCIÓN -->
                <div class="mt-4">

                    <p class="font-bold mb-1">

                        Descripción:

                    </p>

                    <p class="text-gray-600">

                        ${orden.descripcion || '-'}

                    </p>

                </div>

                <!-- HORAS -->
                <div class="mt-4 bg-gray-100 rounded-lg p-3 text-sm">

                    <p>

                        <strong>Hora inicio:</strong>
                        ${orden.horaInicio || '-'}

                    </p>

                    <p>

                        <strong>Hora final:</strong>
                        ${orden.horaFin || '-'}

                    </p>

                </div>

                <!-- OBSERVACIONES -->
                <div class="mt-4">

                    <label class="block mb-2 font-bold">

                        Observaciones

                    </label>

                    <textarea
                        id="obs-${id}"
                        class="w-full border rounded-lg p-3"
                        rows="3"
                    >${orden.observaciones || ''}</textarea>

                </div>

                <!-- EVIDENCIA -->
                <div class="mt-4">

                    <label class="block mb-2 font-bold">

                        Evidencia fotográfica

                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        id="file-${id}"
                        class="w-full border rounded-lg p-2"
                    >

                </div>

                <!-- IMAGEN -->
                <div class="mt-4">

                    ${
                        orden.evidencia
                        ?

                        `<img
                            src="${orden.evidencia}"
                            class="w-full rounded-lg shadow"
                        >`

                        :

                        ''

                    }

                </div>

                <!-- BOTONES -->
                <div class="grid grid-cols-2 gap-3 mt-5">

                    <button
                        onclick="iniciarOrden('${id}')"
                        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
                    >

                        Iniciar

                    </button>

                    <button
                        onclick="finalizarOrden('${id}')"
                        class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
                    >

                        Finalizar

                    </button>

                </div>

            `;

            contenedor.appendChild(card);

        });

    }catch(error){

        console.error(error);

    }

}

// ======================================
// INICIAR ORDEN
// ======================================

window.iniciarOrden = async function(id){

    try{

        const horaInicio =

            new Date().toLocaleString();

        const ordenRef =

            doc(db, 'ordenes', id);

        await updateDoc(

            ordenRef,

            {

                estado: 'En proceso',
                horaInicio

            }

        );

        alert('✅ Orden iniciada');

        cargarOrdenes();

    }catch(error){

        console.error(error);

        alert('❌ Error al iniciar');

    }

}

// ======================================
// FINALIZAR ORDEN
// ======================================

window.finalizarOrden = async function(id){

    try{

        // ======================================
        // OBSERVACIONES
        // ======================================

        const observaciones =

            document.getElementById(`obs-${id}`).value;

        // ======================================
        // IMAGEN
        // ======================================

        const archivo =

            document.getElementById(`file-${id}`).files[0];

        let imagenURL = '';

        // ======================================
        // SUBIR IMAGEN A IMGBB
        // ======================================

        if(archivo){

            const formData = new FormData();

            formData.append(

                'image',
                archivo

            );

            const response = await fetch(

                `https://api.imgbb.com/1/upload?key=${API_KEY}`,

                {

                    method: 'POST',

                    body: formData

                }

            );

            const data = await response.json();

            imagenURL =

                data.data.url;

        }

        // ======================================
        // HORA FINAL
        // ======================================

        const horaFin =

            new Date().toLocaleString();

        // ======================================
        // ACTUALIZAR FIREBASE
        // ======================================

        const ordenRef =

            doc(db, 'ordenes', id);

        await updateDoc(

            ordenRef,

            {

                estado: 'Completada',

                horaFin,

                observaciones,

                evidencia: imagenURL

            }

        );

        alert('✅ Orden finalizada');

        cargarOrdenes();

    }catch(error){

        console.error(error);

        alert('❌ Error al finalizar');

    }

}