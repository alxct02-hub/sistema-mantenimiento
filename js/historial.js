// ======================================
// IMPORTS
// ======================================

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
// CARGAR HISTORIAL
// ======================================

async function cargarHistorial() {

    try {

        const tabla =
        document.getElementById(
            'tablaHistorial'
        );

        tabla.innerHTML = '';

        // ======================================
        // FIRESTORE
        // ======================================

        const ordenesRef = collection(db, 'ordenes');
        const snapshot = await getDocs(ordenesRef);

        ordenes = [];

        snapshot.forEach((doc) => {

            const data = doc.data();

            ordenes.push({

                id: doc.id,

                folio:
                data.folio || '-',

                equipo:
                data.equipo || '-',

                tecnico:
                data.tecnico || '-',

                estado:
                data.estado || 'Pendiente',

                fecha:
                data.fecha || '-',

                fechaInicio:
                data.fechaInicio || '',

                fechaFin:
                data.fechaFin || ''

            });

        });

        // ======================================
        // ORDENAR
        // ======================================

        ordenes.reverse();

        ordenesFiltradas = [...ordenes];

        renderizarTabla();

    }

    catch (error) {

        console.error(
            'Error cargando historial:',
            error
        );

    }

}

// ======================================
// RENDER TABLA
// ======================================

function renderizarTabla(){

    const tabla =
    document.getElementById(
        'tablaHistorial'
    );

    tabla.innerHTML = '';

    ordenesFiltradas.forEach((orden) => {

        tabla.innerHTML += `

            <tr class="hover:bg-gray-100">

                <td class="border px-4 py-3">
                    ${orden.folio}
                </td>

                <td class="border px-4 py-3">
                    ${orden.equipo}
                </td>

                <td class="border px-4 py-3">
                    ${orden.tecnico}
                </td>

                <td class="border px-4 py-3">

                    <span
                    class="
                    px-3 py-1 rounded-full text-white

                    ${
                        orden.estado === 'Completada'
                        ? 'bg-green-500'
                        : orden.estado === 'En Proceso'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }

                    "
                    >

                        ${orden.estado}

                    </span>

                </td>

                <td class="border px-4 py-3">
                    ${orden.fechaInicio || '-'}
                </td>

                <td class="border px-4 py-3">
                    ${orden.fechaFin || '-'}
                </td>

                <td class="border px-4 py-3">

                    ${
                        orden.fechaInicio &&
                        orden.fechaFin

                        ?

                        calcularHorasLaborales(
                            orden.fechaInicio,
                            orden.fechaFin
                        )

                        :

                        '-'
                    }

                </td>

                <td class="border px-4 py-3">

                    <button
                    onclick="generarPDF('${orden.id}')"
                    class="
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-4 py-2
                    rounded-lg
                    "
                    >

                        PDF

                    </button>

                </td>

            </tr>

        `;

    });

}

// ======================================
// FILTROS
// ======================================

window.aplicarFiltros = function(){

    const equipo =
    document.getElementById(
        'equipoFiltro'
    )
    .value
    .toLowerCase();

    const estado =
    document.getElementById(
        'estadoFiltro'
    )
    .value;

    ordenesFiltradas =
    ordenes.filter((orden) => {

        let cumple = true;

        // EQUIPO
        if(
            equipo &&
            !orden.equipo
            .toLowerCase()
            .includes(equipo)
        ){

            cumple = false;

        }

        // ESTADO
        if(
            estado &&
            orden.estado !== estado
        ){

            cumple = false;

        }

        return cumple;

    });

    renderizarTabla();

}

// ======================================
// HORAS LABORALES
// ======================================

function calcularHorasLaborales(
    fechaInicio,
    fechaFin
){

    let inicio =
    new Date(fechaInicio);

    let fin =
    new Date(fechaFin);

    let totalMinutos = 0;

    while(inicio < fin){

        const dia =
        inicio.getDay();

        // DOMINGO
        if(dia !== 0){

            let horaInicio = 7;
            let horaFin = 18;

            // SABADO
            if(dia === 6){

                horaFin = 14;

            }

            let inicioLaboral =
            new Date(inicio);

            inicioLaboral.setHours(
                horaInicio,
                0,
                0,
                0
            );

            let finLaboral =
            new Date(inicio);

            finLaboral.setHours(
                horaFin,
                0,
                0,
                0
            );

            let inicioReal =
            inicio > inicioLaboral
            ? inicio
            : inicioLaboral;

            let finReal =
            fin < finLaboral
            ? fin
            : finLaboral;

            if(finReal > inicioReal){

                totalMinutos +=
                (finReal - inicioReal)
                / 1000 / 60;

            }

        }

        inicio.setDate(
            inicio.getDate() + 1
        );

        inicio.setHours(0,0,0,0);

    }

    const horas =
    Math.floor(totalMinutos / 60);

    const minutos =
    Math.floor(totalMinutos % 60);

    return `${horas}h ${minutos}m`;

}

// ======================================
// PDF
// ======================================

window.generarPDF = async function(id){

    const orden =
    ordenes.find(
        o => o.id === id
    );

    if(!orden){

        alert('Orden no encontrada');

        return;

    }

    // Obtener datos completos de Firebase
    const snapshot = await getDocs(collection(db, 'ordenes'));
    let ordenCompleta = null;

    snapshot.forEach((doc) => {
        if(doc.id === id){
            ordenCompleta = doc.data();
        }
    });

    if(!ordenCompleta){
        alert('Error al obtener datos');
        return;
    }

    // JSPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // ======================================
    // HEADER
    // ======================================

    pdf.setFillColor(30, 41, 59);
    pdf.rect(0, 0, 210, 35, 'F');

    pdf.setTextColor(255,255,255);
    pdf.setFontSize(22);
    pdf.text('ORDEN DE SERVICIO', 20, 20);

    pdf.setFontSize(12);
    pdf.text('Concretera del Sureste', 20, 28);

    // ======================================
    // DATOS GENERALES
    // ======================================

    pdf.setTextColor(0,0,0);
    pdf.setFontSize(15);
    pdf.text('DATOS GENERALES', 20, 50);
    pdf.setLineWidth(0.5);
    pdf.line(20, 53, 190, 53);

    pdf.setFontSize(10);

    let y = 63;

    pdf.text(`Folio: ${ordenCompleta.folio || '-'}`, 20, y); y += 8;
    pdf.text(`Fecha: ${ordenCompleta.fecha || '-'}`, 20, y); y += 8;
    pdf.text(`Area: ${ordenCompleta.area || '-'}`, 20, y); y += 8;
    pdf.text(`Equipo: ${ordenCompleta.equipo || '-'}`, 20, y); y += 8;
    pdf.text(`Kilometraje: ${ordenCompleta.kilometraje || '-'}`, 110, y - 24);
    pdf.text(`Horometro: ${ordenCompleta.horometro || '-'}`, 110, y - 16);
    pdf.text(`Operador: ${ordenCompleta.operador || '-'}`, 20, y); y += 8;
    pdf.text(`Tecnico: ${ordenCompleta.tecnico || '-'}`, 20, y); y += 8;
    pdf.text(`Tipo: ${ordenCompleta.tipo || '-'}`, 110, y - 8);
    pdf.text(`Prioridad: ${ordenCompleta.prioridad || '-'}`, 20, y); y += 8;
    pdf.text(`Estado: ${ordenCompleta.estado || '-'}`, 20, y); y += 12;

    // ======================================
    // DESCRIPCION
    // ======================================

    pdf.setFontSize(15);
    pdf.text('DESCRIPCION DEL SERVICIO', 20, y);
    pdf.line(20, y + 3, 190, y + 3);

    y += 13;
    pdf.setFontSize(10);

    const descripcion = pdf.splitTextToSize(ordenCompleta.descripcion || '-', 165);
    pdf.text(descripcion, 20, y);
    y += (descripcion.length * 5) + 10;

    // ======================================
    // CONTROL DE TIEMPOS
    // ======================================

    pdf.setFontSize(15);
    pdf.text('CONTROL DE TIEMPOS', 20, y);
    pdf.line(20, y + 3, 190, y + 3);

    y += 13;
    pdf.setFontSize(10);
    pdf.text(`Hora inicio: ${ordenCompleta.horaInicio || '-'}`, 20, y);
    pdf.text(`Hora final: ${ordenCompleta.horaFin || '-'}`, 110, y);
    y += 15;

    // ======================================
    // OBSERVACIONES
    // ======================================

    pdf.setFontSize(15);
    pdf.text('OBSERVACIONES', 20, y);
    pdf.line(20, y + 3, 190, y + 3);

    y += 13;
    pdf.setFontSize(10);

    const observaciones = pdf.splitTextToSize(ordenCompleta.observaciones || '-', 165);
    pdf.text(observaciones, 20, y);
    y += (observaciones.length * 5) + 10;

    // ======================================
    // EVIDENCIA FOTOGRAFICA
    // ======================================

    if(ordenCompleta.evidencia){
        try{
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = ordenCompleta.evidencia;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const dataURL = canvas.toDataURL('image/jpeg');

            // Nueva pagina
            pdf.addPage();

            pdf.setFontSize(18);
            pdf.setTextColor(0,0,0);
            pdf.text('EVIDENCIA FOTOGRAFICA', 20, 20);
            pdf.line(20, 25, 190, 25);

            // Imagen
            pdf.addImage(dataURL, 'JPEG', 20, 35, 170, 120);

        }catch(error){
            console.error('Error imagen PDF:', error);
        }
    }

    // ======================================
    // FIRMAS
    // ======================================

    pdf.addPage();

    pdf.setFontSize(15);
    pdf.text('FIRMAS DE CONFORMIDAD', 20, 30);
    pdf.line(20, 33, 190, 33);

    // Firma del Tecnico
    pdf.setFontSize(12);
    pdf.text('Firma del Tecnico', 30, 60);
    pdf.line(20, 90, 90, 90);
    pdf.setFontSize(10);
    pdf.text(ordenCompleta.tecnico || 'Tecnico', 30, 100);

    // Firma del Operador/Solicitante
    pdf.setFontSize(12);
    pdf.text('Firma del Operador', 130, 60);
    pdf.line(110, 90, 190, 90);
    pdf.setFontSize(10);
    pdf.text(ordenCompleta.operador || 'Operador', 130, 100);

    // ======================================
    // FOOTER
    // ======================================

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Sistema de Mantenimiento - Concretera del Sureste', 20, 285);

    // ======================================
    // DESCARGAR
    // ======================================

    pdf.save(`${ordenCompleta.folio || 'orden'}.pdf`);

}

// ======================================
// EXPORTAR EXCEL
// ======================================

window.exportarExcel = function(){

    const datos =
    ordenesFiltradas.map((o) => ({

        Folio: o.folio,
        Equipo: o.equipo,
        Tecnico: o.tecnico,
        Estado: o.estado,
        Fecha: o.fecha

    }));

    const ws =
    XLSX.utils.json_to_sheet(datos);

    const wb =
    XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        'Historial'
    );

    XLSX.writeFile(
        wb,
        'Historial_Ordenes.xlsx'
    );

}

// ======================================
// INICIAR
// ======================================

document.addEventListener(

    'DOMContentLoaded',

    () => {

        cargarHistorial();

    }

);