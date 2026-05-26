import { db } from './firebase-config.js';

import {

    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Formulario
const form = document.getElementById('ordenForm');

// Mensaje
const mensaje = document.getElementById('mensaje');

// Campo folio
const folioInput = document.getElementById('folio');

// Inicializar
generarFolio();

// Evento guardar
form.addEventListener('submit', guardarOrden);

// ======================================
// GENERAR FOLIO CONSECUTIVO
// ======================================

async function generarFolio(){

    try{

        const ordenesRef = collection(db, 'ordenes');

        const q = query(
            ordenesRef,
            orderBy('folio', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);

        let nuevoNumero = 1;

        // Si ya existen órdenes
        if(!snapshot.empty){

            const ultimaOrden = snapshot.docs[0].data();

            const ultimoFolio = ultimaOrden.folio;

            // Extraer número
            const numeroActual = parseInt(
                ultimoFolio.replace('OS-', '')
            );

            nuevoNumero = numeroActual + 1;

        }

        // Formato
        const folioFinal =
            'OS-' +
           '26' + String(nuevoNumero).padStart(5, '0');

        // Mostrar
        folioInput.value = folioFinal;

    }catch(error){

        console.error(
            'Error generando folio:',
            error
        );

        folioInput.value = 'OS-2600001';

    }

}

// ======================================
// GUARDAR ORDEN
// ======================================

async function guardarOrden(e){

    e.preventDefault();

    try{

        const folio = document.getElementById('folio').value;

        const area = document.getElementById('area').value;

        const equipo = document.getElementById('equipo').value;

        const tecnico = document.getElementById('tecnico').value;

        const tipo = document.getElementById('tipo').value;

        const prioridad = document.getElementById('prioridad').value;

        const descripcion = document.getElementById('descripcion').value;

        const fecha = new Date().toLocaleString();

        const estado = 'Pendiente';

        // Guardar en Firestore
        await addDoc(collection(db, 'ordenes'), {

            folio,
            area,
            equipo,
            tecnico,
            tipo,
            prioridad,
            descripcion,
            fecha,
            estado

        });

        // Mensaje éxito
        mensaje.innerHTML =
            '✅ Orden guardada correctamente';

        mensaje.className =
            'mt-6 text-center font-bold text-green-600';

        // Limpiar formulario
        form.reset();

        // Nuevo folio
        generarFolio();

    }catch(error){

        console.error(error);

        mensaje.innerHTML =
            '❌ Error al guardar orden';

        mensaje.className =
            'mt-6 text-center font-bold text-red-600';

    }

}