import { db } from './firebase-config.js';

import {

    collection,
    addDoc,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Elementos
const form = document.getElementById('tecnicoForm');

const mensaje = document.getElementById('mensaje');

const tabla = document.getElementById('tablaTecnicos');

// Inicializar
cargarTecnicos();

// Evento
form.addEventListener('submit', guardarTecnico);

// =====================================
// GUARDAR TÉCNICO
// =====================================

async function guardarTecnico(e){

    e.preventDefault();

    try{

        const nombre =

            document.getElementById('nombre').value;

        const especialidad =

            document.getElementById('especialidad').value;

        const telefono =

            document.getElementById('telefono').value;

        // Guardar
        await addDoc(

            collection(db, 'tecnicos'),

            {

                nombre,
                especialidad,
                telefono

            }

        );

        // Mensaje
        mensaje.innerHTML =

            '✅ Técnico guardado correctamente';

        mensaje.className =

            'mt-6 text-center font-bold text-green-600';

        // Limpiar
        form.reset();

        // Recargar
        cargarTecnicos();

    }catch(error){

        console.error(error);

        mensaje.innerHTML =

            '❌ Error al guardar técnico';

        mensaje.className =

            'mt-6 text-center font-bold text-red-600';

    }

}

// =====================================
// CARGAR TÉCNICOS
// =====================================

async function cargarTecnicos(){

    try{

        tabla.innerHTML = '';

        const snapshot = await getDocs(

            collection(db, 'tecnicos')

        );

        snapshot.forEach((doc) => {

            const tecnico = doc.data();

            const fila = document.createElement('tr');

            fila.className =

                'border-b hover:bg-gray-50';

            fila.innerHTML = `

                <td class="px-6 py-4">

                    ${tecnico.nombre}

                </td>

                <td class="px-6 py-4">

                    ${tecnico.especialidad}

                </td>

                <td class="px-6 py-4">

                    ${tecnico.telefono}

                </td>

            `;

            tabla.appendChild(fila);

        });

    }catch(error){

        console.error(error);

    }

}