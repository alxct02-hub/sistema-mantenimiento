// Importar Firebase
import { database } from './firebase-config.js';

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

}