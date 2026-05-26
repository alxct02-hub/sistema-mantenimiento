import { db } from './firebase-config.js';

import {

    collection,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// VARIABLES
// ======================================

let ordenes = [];

let ordenesFiltradas = [];

// ======================================
// CARGAR ÓRDENES
// ======================================

async function cargarOrdenes(){

    try{

        const snapshot = await getDocs(

            collection(db, 'ordenes')

        );

        ordenes = [];

        snapshot.forEach((doc) => {

            ordenes.push({

                id: doc.id,

                ...doc.data()

            });

        });

        ordenesFiltradas = [...ordenes];

        renderizarTabla();

    }catch(error){

        console.error(error);

        alert('❌ Error cargando historial');

    }

}

// ======================================
// RENDERIZAR TABLA
// ======================================

function renderizarTabla(){

    const tabla = document.getElementById(

        'tablaHistorial'

    );

    tabla.innerHTML = '';

    ordenesFiltradas.forEach((orden) => {

        tabla.innerHTML += `

            <tr class="hover:bg-gray-50">

                <td class="px-4 py-4">

                    ${orden.folio || '-'}

                </td>

                <td class="px-4 py-4">

                    ${orden.equipo || '-'}

                </td>

                <td class="px-4 py-4">

                    ${orden.tecnico || '-'}

                </td>

                <td class="px-4 py-4">

                    ${orden.tipo || '-'}

                </td>

                <td class="px-4 py-4">

                    ${orden.prioridad || '-'}

                </td>

                <td class="px-4 py-4">

                    ${orden.estado || '-'}

                </td>

                <td class="px-4 py-4">

                    ${orden.fecha || '-'}

                </td>

            </tr>

        `;

    });

}

// ======================================
// FILTROS
// ======================================

window.aplicarFiltros = function(){

    const fechaInicio = document.getElementById(

        'fechaInicio'

    ).value;

    const fechaFin = document.getElementById(

        'fechaFin'

    ).value;

    const equipo = document.getElementById(

        'filtroEquipo'

    ).value.toLowerCase();

    const tecnico = document.getElementById(

        'filtroTecnico'

    ).value.toLowerCase();

    const estado = document.getElementById(

        'filtroEstado'

    ).value;

    ordenesFiltradas = ordenes.filter((orden) => {

        let cumple = true;

        // EQUIPO
        if(equipo){

            cumple = cumple &&

            orden.equipo?.toLowerCase()

            .includes(equipo);

        }

        // TÉCNICO
        if(tecnico){

            cumple = cumple &&

            orden.tecnico?.toLowerCase()

            .includes(tecnico);

        }

        // ESTADO
        if(estado){

            cumple = cumple &&

            orden.estado === estado;

        }

        // FECHA
        if(fechaInicio){

            cumple = cumple &&

            orden.fecha >= fechaInicio;

        }

        if(fechaFin){

            cumple = cumple &&

            orden.fecha <= fechaFin;

        }

        return cumple;

    });

    renderizarTabla();

}

// ======================================
// LIMPIAR
// ======================================

window.limpiarFiltros = function(){

    document.getElementById('fechaInicio').value = '';

    document.getElementById('fechaFin').value = '';

    document.getElementById('filtroEquipo').value = '';

    document.getElementById('filtroTecnico').value = '';

    document.getElementById('filtroEstado').value = '';

    ordenesFiltradas = [...ordenes];

    renderizarTabla();

}

// ======================================
// EXPORTAR EXCEL
// ======================================

window.exportarExcel = function(){

    const datos = ordenesFiltradas.map((orden) => ({

        Folio: orden.folio || '',

        Equipo: orden.equipo || '',

        Tecnico: orden.tecnico || '',

        Tipo: orden.tipo || '',

        Prioridad: orden.prioridad || '',

        Estado: orden.estado || '',

        Fecha: orden.fecha || ''

    }));

    const hoja = XLSX.utils.json_to_sheet(

        datos

    );

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        libro,

        hoja,

        'Historial'

    );

    XLSX.writeFile(

        libro,

        'Historial-Ordenes.xlsx'

    );

}

// ======================================
// INICIAR
// ======================================

cargarOrdenes();