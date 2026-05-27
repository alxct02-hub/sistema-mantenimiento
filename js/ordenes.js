import { db } from './firebase-config.js';

import {

    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ========================================
// ELEMENTOS
// ========================================

const form = document.getElementById('ordenForm');

const mensaje = document.getElementById('mensaje');

const folioInput = document.getElementById('folio');

// ========================================
// INICIALIZAR
// ========================================

generarFolio();

form.addEventListener('submit', guardarOrden);

// ========================================
// GENERAR FOLIO
// ========================================

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

            // Obtener número
            const numeroActual = parseInt(

                ultimoFolio.replace('OS-26', '')

            );

            nuevoNumero = numeroActual + 1;

        }

        // Generar nuevo folio
        const folioFinal =

            'OS-26' +
            String(nuevoNumero).padStart(5, '0');

        // Mostrar
        folioInput.value = folioFinal;

    }catch(error){

        console.error(

            'Error generando folio:',
            error

        );

        // Folio respaldo
        folioInput.value = 'OS-2600001';

    }

}

// ========================================
// GUARDAR ORDEN
// ========================================

async function guardarOrden(e){

    e.preventDefault();

    try{

        // =========================
        // OBTENER DATOS
        // =========================

        const folio = document.getElementById('folio').value;

        const area = document.getElementById('area').value;

        const equipo = document.getElementById('equipo').value;

        const kilometraje = document.getElementById('kilometraje').value;

        const horometro = document.getElementById('horometro').value;

        const operador = document.getElementById('operador').value;

        const tecnico = document.getElementById('tecnico').value;

        const tipo = document.getElementById('tipo').value;

        const prioridad = document.getElementById('prioridad').value;

        const descripcion = document.getElementById('descripcion').value;

        // =========================
        // DATOS AUTOMÁTICOS
        // =========================

        const fecha = new Date().toLocaleString();

        const estado = 'Pendiente';

        // =========================
        // GUARDAR FIRESTORE
        // =========================

        await addDoc(

            collection(db, 'ordenes'),

            {

                folio,
                area,
                equipo,
                kilometraje,
                horometro,
                operador,
                tecnico,
                tipo,
                prioridad,
                descripcion,
                fecha,
                estado

            }

        );

        // =========================
        // MENSAJE ÉXITO
        // =========================

        mensaje.innerHTML =

            '✅ Orden guardada correctamente';

        mensaje.className =

            'mt-6 text-center font-bold text-green-600';

        // =========================
        // LIMPIAR FORMULARIO
        // =========================

        form.reset();

        // =========================
        // NUEVO FOLIO
        // =========================

        generarFolio();

    }catch(error){

        console.error(error);

        // =========================
        // MENSAJE ERROR
        // =========================

        mensaje.innerHTML =

            '❌ Error al guardar orden';

        mensaje.className =

            'mt-6 text-center font-bold text-red-600';

    }

}