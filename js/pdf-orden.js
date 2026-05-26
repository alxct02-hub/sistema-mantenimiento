import { db } from './firebase-config.js';

import {

    collection,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// GENERAR PDF
// ======================================

window.generarPDF = async function(folioBuscado){

    try{

        // ======================================
        // OBTENER ÓRDENES
        // ======================================

        const snapshot = await getDocs(

            collection(db, 'ordenes')

        );

        let ordenEncontrada = null;

        snapshot.forEach((doc) => {

            const orden = doc.data();

            if(orden.folio === folioBuscado){

                ordenEncontrada = orden;

            }

        });

        // ======================================
        // VALIDAR
        // ======================================

        if(!ordenEncontrada){

            alert('Orden no encontrada');

            return;

        }

        // ======================================
        // JSPDF
        // ======================================

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF();

        // ======================================
        // HEADER
        // ======================================

        pdf.setFillColor(30, 41, 59);

        pdf.rect(

            0,
            0,
            210,
            35,
            'F'

        );

        pdf.setTextColor(255,255,255);

        pdf.setFontSize(22);

        pdf.text(

            'ORDEN DE SERVICIO',

            20,

            20

        );

        pdf.setFontSize(12);

        pdf.text(

            'Concretera del Sureste',

            20,

            28

        );

        // ======================================
        // RESTAURAR COLOR
        // ======================================

        pdf.setTextColor(0,0,0);

        // ======================================
        // DATOS GENERALES
        // ======================================

        pdf.setFontSize(15);

        pdf.text(

            'DATOS GENERALES',

            20,

            50

        );

        pdf.setLineWidth(0.5);

        pdf.line(

            20,
            53,
            190,
            53

        );

        pdf.setFontSize(11);

        pdf.text(

            `Folio: ${ordenEncontrada.folio || '-'}`,

            20,

            65

        );

        pdf.text(

            `Equipo: ${ordenEncontrada.equipo || '-'}`,

            20,

            73

        );

        pdf.text(

            `Área: ${ordenEncontrada.area || '-'}`,

            20,

            81

        );

        pdf.text(

            `Operador: ${ordenEncontrada.operador || '-'}`,

            20,

            89

        );

        pdf.text(

            `Técnico: ${ordenEncontrada.tecnico || '-'}`,

            20,

            97

        );

        pdf.text(

            `Prioridad: ${ordenEncontrada.prioridad || '-'}`,

            20,

            105

        );

        pdf.text(

            `Estado: ${ordenEncontrada.estado || '-'}`,

            20,

            113

        );

        // ======================================
        // DESCRIPCIÓN
        // ======================================

        pdf.setFontSize(15);

        pdf.text(

            'DESCRIPCIÓN DEL SERVICIO',

            20,

            130

        );

        pdf.line(

            20,
            133,
            190,
            133

        );

        pdf.setFontSize(11);

        const descripcion = pdf.splitTextToSize(

            ordenEncontrada.descripcion || '-',

            165

        );

        pdf.text(

            descripcion,

            20,

            145

        );

        // ======================================
        // HORAS
        // ======================================

        pdf.setFontSize(15);

        pdf.text(

            'CONTROL DE TIEMPOS',

            20,

            175

        );

        pdf.line(

            20,
            178,
            190,
            178

        );

        pdf.setFontSize(11);

        pdf.text(

            `Hora inicio: ${ordenEncontrada.horaInicio || '-'}`,

            20,

            190

        );

        pdf.text(

            `Hora final: ${ordenEncontrada.horaFin || '-'}`,

            20,

            198

        );

        // ======================================
        // OBSERVACIONES
        // ======================================

        pdf.setFontSize(15);

        pdf.text(

            'OBSERVACIONES',

            20,

            215

        );

        pdf.line(

            20,
            218,
            190,
            218

        );

        pdf.setFontSize(11);

        const observaciones = pdf.splitTextToSize(

            ordenEncontrada.observaciones || '-',

            165

        );

        pdf.text(

            observaciones,

            20,

            230

        );

        // ======================================
        // IMAGEN EVIDENCIA
        // ======================================

        if(ordenEncontrada.evidencia){

            try{

                // Cargar imagen
                const img = new Image();

                img.crossOrigin = 'Anonymous';

                img.src = ordenEncontrada.evidencia;

                await new Promise((resolve) => {

                    img.onload = resolve;

                });

                // Canvas
                const canvas = document.createElement('canvas');

                const ctx = canvas.getContext('2d');

                canvas.width = img.width;

                canvas.height = img.height;

                ctx.drawImage(

                    img,
                    0,
                    0

                );

                // Convertir
                const dataURL = canvas.toDataURL('image/jpeg');

                // Nueva página
                pdf.addPage();

                // Título
                pdf.setFontSize(18);

                pdf.text(

                    'EVIDENCIA FOTOGRÁFICA',

                    20,

                    20

                );

                pdf.line(

                    20,
                    25,
                    190,
                    25

                );

                // Imagen
                pdf.addImage(

                    dataURL,

                    'JPEG',

                    20,

                    35,

                    170,

                    120

                );

            }catch(error){

                console.error(

                    'Error imagen PDF:',
                    error

                );

            }

        }

        // ======================================
        // FOOTER
        // ======================================

        pdf.setFontSize(10);

        pdf.text(

            'Sistema de mantenimiento - Concretera del Sureste',

            20,

            285

        );

        // ======================================
        // DESCARGAR
        // ======================================

        pdf.save(

            `${ordenEncontrada.folio}.pdf`

        );

    }catch(error){

        console.error(error);

        alert('❌ Error generando PDF');

    }

}