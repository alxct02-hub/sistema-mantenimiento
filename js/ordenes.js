import { db } from './firebase-config.js';

import {

    collection,
    addDoc,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Formulario
const form = document.getElementById('ordenForm');

// Mensaje
const mensaje = document.getElementById('mensaje');

// Input folio
const folioInput = document.getElementById('folio');

// Inicializar
generarFolio();

// Evento guardar
form.addEventListener('submit', guardarOrden);

// Generar folio profesional
async function generarFolio(){

    try{

        const querySnapshot = await getDocs(collection(db, 'ordenes'));

        const total = querySnapshot.size + 1;

        const numero = String(total).padStart(4, '0');

        folioInput.value = `OS-26${numero}`;

    }catch(error){

        console.error(error);

    }

}

// Guardar orden
async function guardarOrden(e){

    e.preventDefault();

    try{

        // Datos
        const folio = document.getElementById('folio').value;

        const area = document.getElementById('area').value;

        const equipo = document.getElementById('equipo').value;

        const tecnico = document.getElementById('tecnico').value;

        const tipo = document.getElementById('tipo').value;

        const prioridad = document.getElementById('prioridad').value;

        const descripcion = document.getElementById('descripcion').value;

        // Fecha
        const fecha = new Date().toLocaleString();

        // Estado
        const estado = "Pendiente";

        // Guardar Firestore
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

        // Mensaje
        mensaje.innerHTML = "✅ Orden guardada correctamente";

        mensaje.className = "mt-6 text-center font-bold text-green-600";

        // Reset
        form.reset();

        // Nuevo folio
        generarFolio();

    }catch(error){

        console.error(error);

        mensaje.innerHTML = "❌ Error al guardar orden";

        mensaje.className = "mt-6 text-center font-bold text-red-600";

    }

}