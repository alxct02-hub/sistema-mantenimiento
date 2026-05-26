// Importar Firestore
import { db } from './firebase-config.js';

import {

    collection,
    onSnapshot

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Array órdenes
let ordenesData = [];

// Cargar órdenes en tiempo real
async function cargarOrdenes() {

    try {

        // Referencia colección
        const ordenesRef = collection(db, 'ordenes');

        // Escuchar cambios en tiempo real
        onSnapshot(ordenesRef, (snapshot) => {

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
                    orden.estado === "Completada" ||
                    orden.estado === "Finalizada"
                ) {

                    completadas++;

                } else {

                    pendientes++;

                }

            });

            // Actualizar contadores
            document.getElementById('totalOrdenes').innerText = total;

            document.getElementById('pendientes').innerText = pendientes;

            document.getElementById('completadas').innerText = completadas;

            // Renderizar tabla
            renderizarTabla();

        });

    } catch (error) {

        console.error("Error al cargar órdenes:", error);

    }

}

// Renderizar tabla
function renderizarTabla() {

    const tbody = document.getElementById('tablaOrdenes');

    tbody.innerHTML = '';

    ordenesData.forEach(orden => {

        const fila = document.createElement('tr');

        fila.innerHTML = `

            <td class="px-6 py-4">${orden.equipo || '-'}</td>

            <td class="px-6 py-4">${orden.tecnico || '-'}</td>

            <td class="px-6 py-4">${orden.tipo || '-'}</td>

            <td class="px-6 py-4">

                <span class="
                    px-3 py-1 rounded-full text-xs font-medium

                    ${orden.prioridad === 'Alta'
                        ? 'bg-red-100 text-red-700'
                        : orden.prioridad === 'Media'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }
                ">

                    ${orden.prioridad || 'Baja'}

                </span>

            </td>

            <td class="px-6 py-4">

                <span class="
                    px-3 py-1 rounded-full text-xs font-medium

                    ${orden.estado === 'Completada'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }
                ">

                    ${orden.estado || 'Pendiente'}

                </span>

            </td>

            <td class="px-6 py-4">

                ${orden.fecha || '-'}

            </td>

            <td class="px-6 py-4 text-center">

                <button
                    onclick="editarOrden('${orden.id}')"
                    class="text-blue-600 hover:text-blue-800 mr-3"
                >

                    ✏️

                </button>

            </td>

        `;

        tbody.appendChild(fila);

    });

}

// Iniciar dashboard
document.addEventListener('DOMContentLoaded', cargarOrdenes);
