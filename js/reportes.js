import { db } from './firebase-config.js';

import {

    collection,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// GENERAR REPORTE
// ======================================

window.generarReporte = async function(){

    try{

        // ======================================
        // OBTENER ÓRDENES
        // ======================================

        const snapshot = await getDocs(

            collection(db, 'ordenes')

        );

        let total = 0;

        let pendientes = 0;

        let proceso = 0;

        let completadas = 0;

        let equipos = {};

        let tecnicos = {};

        snapshot.forEach((doc) => {

            const orden = doc.data();

            total++;

            // Estados
            if(orden.estado === 'Pendiente'){

                pendientes++;

            }

            else if(orden.estado === 'En proceso'){

                proceso++;

            }

            else if(orden.estado === 'Completada'){

                completadas++;

            }

            // Equipos
            if(orden.equipo){

                if(!equipos[orden.equipo]){

                    equipos[orden.equipo] = 0;

                }

                equipos[orden.equipo]++;

            }

            // Técnicos
            if(orden.tecnico){

                if(!tecnicos[orden.tecnico]){

                    tecnicos[orden.tecnico] = 0;

                }

                tecnicos[orden.tecnico]++;

            }

        });

        // ======================================
        // EQUIPO TOP
        // ======================================

        let equipoTop = '-';

        let maxEquipo = 0;

        for(const equipo in equipos){

            if(equipos[equipo] > maxEquipo){

                maxEquipo = equipos[equipo];

                equipoTop = equipo;

            }

        }

        // ======================================
        // TÉCNICO TOP
        // ======================================

        let tecnicoTop = '-';

        let maxTecnico = 0;

        for(const tecnico in tecnicos){

            if(tecnicos[tecnico] > maxTecnico){

                maxTecnico = tecnicos[tecnico];

                tecnicoTop = tecnico;

            }

        }

        // ======================================
        // PDF
        // ======================================

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF();

        // HEADER
        pdf.setFillColor(31,41,55);

        pdf.rect(

            0,
            0,
            210,
            35,
            'F'

        );

        pdf.setTextColor(255,255,255);

        pdf.setFontSize(24);

        pdf.text(

            'REPORTE EJECUTIVO',

            20,

            20

        );

        pdf.setFontSize(12);

        pdf.text(

            'Sistema de Mantenimiento',

            20,

            28

        );

        // RESET
        pdf.setTextColor(0,0,0);

        // FECHA
        pdf.setFontSize(11);

        pdf.text(

            `Fecha: ${new Date().toLocaleDateString()}`,

            20,

            50

        );

        // KPI
        pdf.setFontSize(18);

        pdf.text(

            'INDICADORES OPERATIVOS',

            20,

            70

        );

        pdf.line(

            20,
            74,
            190,
            74

        );

        pdf.setFontSize(13);

        pdf.text(

            `Órdenes Totales: ${total}`,

            25,

            90

        );

        pdf.text(

            `Pendientes: ${pendientes}`,

            25,

            102

        );

        pdf.text(

            `En Proceso: ${proceso}`,

            25,

            114

        );

        pdf.text(

            `Completadas: ${completadas}`,

            25,

            126

        );

        pdf.text(

            `Equipo con más fallas: ${equipoTop}`,

            25,

            138

        );

        pdf.text(

            `Técnico con más órdenes: ${tecnicoTop}`,

            25,

            150

        );

        // CONCLUSIÓN
        pdf.setFontSize(18);

        pdf.text(

            'RESUMEN EJECUTIVO',

            20,

            180

        );

        pdf.line(

            20,
            184,
            190,
            184

        );

        pdf.setFontSize(12);

        const resumen = `

El sistema registra actualmente ${total} órdenes de servicio.

Se identifican ${pendientes} órdenes pendientes,
${proceso} en proceso y ${completadas} completadas.

El equipo con mayor recurrencia de fallas es:
${equipoTop}.

El técnico con mayor participación operativa es:
${tecnicoTop}.

        `;

        const texto = pdf.splitTextToSize(

            resumen,

            165

        );

        pdf.text(

            texto,

            20,

            200

        );

        // FOOTER
        pdf.setFontSize(10);

        pdf.text(

            'Concretera del Sureste - Sistema de mantenimiento',

            20,

            285

        );

        // DESCARGAR
        pdf.save(

            'Reporte-Ejecutivo.pdf'

        );

    }catch(error){

        console.error(error);

        alert('❌ Error generando reporte');

    }

}