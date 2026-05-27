// Importar Firestore
import { db } from './firebase-config.js';

import {

    collection,
    addDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Formulario
const form = document.getElementById('ordenForm');

// Mensaje
const mensaje = document.getElementById('mensaje');

// Input folio
const folioInput = document.getElementById('folio');

// Generar folio único
function generarFolio(){

    const numero = Date.now();

    return `OS-${numero}`;

}

// Asignar folio inicial
folioInput.value = generarFolio();

// Evento guardar
form.addEventListener('submit', guardarOrden);

// Guardar orden
async function guardarOrden(e){

    e.preventDefault();

    try{

        // Capturar datos
        const folio = document.getElementById('folio').value;

        const area = document.getElementById('area').value;

        const equipo = document.getElementById('equipo').value;

        const tecnico = document.getElementById('tecnico').value;

        const tipo = document.getElementById('tipo').value;

        const prioridad = document.getElementById('prioridad').value;

        const descripcion = document.getElementById('descripcion').value;

        // Fecha automática
        const fecha = new Date().toLocaleString();

        // Estado inicial
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

        // Mensaje éxito
        mensaje.innerHTML = "✅ Orden guardada correctamente";

        // Limpiar formulario
        form.reset();

        // Nuevo folio
        folioInput.value = generarFolio();

    }catch(error){

        console.error(error);

        mensaje.innerHTML = "❌ Error al guardar orden";

    }

}