// Importar Firebase
// import { database } from './firebase-config.js';

import {

    ref,
        push
        
        } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
        
        // Formulario
        const form = document.getElementById('ordenForm');
        
        // Mensaje
        const mensaje = document.getElementById('mensaje');
        
        // Evento guardar
        form.addEventListener('submit', guardarOrden);
        
        async function guardarOrden(e){
        
            e.preventDefault();
            
                try{
                
                        // Obtener valores
                                const equipo = document.getElementById('equipo').value;
                                
                                        const tecnico = document.getElementById('tecnico').value;
                                        
                                                const tipo = document.getElementById('tipo').value;
                                                
                                                        const prioridad = document.getElementById('prioridad').value;
                                                        
                                                                const descripcion = document.getElementById('descripcion').value;
                                                                
                                                                        // Fecha automática
                                                                                const fecha = new Date().toLocaleDateString();
                                                                                
                                                                                        // Estado inicial
                                                                                                const estado = "Pendiente";
                                                                                                
                                                                                                        // Referencia Firebase
                                                                                                                const ordenesRef = ref(database, 'ordenes');
                                                                                                                
                                                                                                                        // Guardar
                                                                                                                                await push(ordenesRef, {
                                                                                                                                
                                                                                                                                            equipo,
                                                                                                                                                        tecnico,
                                                                                                                                                                    tipo,
                                                                                                                                                                                prioridad,
                                                                                                                                                                                            descripcion,
                                                                                                                                                                                                        fecha,
                                                                                                                                                                                                                    estado
                                                                                                                                                                                                                    
                                                                                                                                                                                                                            });
                                                                                                                                                                                                                            
                                                                                                                                                                                                                                    // Mensaje éxito
                                                                                                                                                                                                                                            mensaje.innerHTML = "✅ Orden guardada correctamente";
                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                    // Limpiar formulario
                                                                                                                                                                                                                                                            form.reset();
                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                }catch(error){
                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                        console.error(error);
                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                mensaje.innerHTML = "❌ Error al guardar";
                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                    }un// dashboard.js
let ordenesData = [];

async function cargarOrdenes() {
    try {
        const ordenesRef = database.ref('ordenes'); // Ajusta si usas Firestore

        ordenesRef.on('value', (snapshot) => {
            ordenesData = [];
            let total = 0;
            let pendientes = 0;
            let completadas = 0;

            snapshot.forEach((child) => {
                const orden = child.val();
                orden.id = child.key; // Guardar ID para editar/eliminar
                ordenesData.push(orden);

                total++;

                if (orden.estado === "Completada" || orden.estado === "Finalizada") {
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

function renderizarTabla() {
    const tbody = document.getElementById('tablaOrdenes');
    tbody.innerHTML = '';

    ordenesData.forEach(orden => {
        const fila = document.createElement('tr');
        fila.className = "hover:bg-gray-50";

        fila.innerHTML = `
            <td class="px-6 py-4">${orden.equipo || '-'}</td>
            <td class="px-6 py-4">${orden.tecnico || '-'}</td>
            <td class="px-6 py-4">${orden.tipo || '-'}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium 
                    ${orden.prioridad === 'Alta' ? 'bg-red-100 text-red-700' : 
                      orden.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'}">
                    ${orden.prioridad || 'Baja'}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium
                    ${orden.estado === 'Completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                    ${orden.estado || 'Pendiente'}
                </span>
            </td>
            <td class="px-6 py-4">${orden.fecha || '-'}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="editarOrden('${orden.id}')" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', cargarOrdenes);
