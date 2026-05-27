// ======================================
// GENERAR FOLIO AUTOMÁTICO
// ======================================

async function generarFolio() {

    try {

        const snapshot = await db
        .collection('ordenes')
        .orderBy('numeroFolio', 'desc')
        .limit(1)
        .get();

        let ultimoNumero = 0;

        if (!snapshot.empty) {

            const ultimaOrden =
            snapshot.docs[0].data();

            ultimoNumero =
            ultimaOrden.numeroFolio || 0;

        }

        // NUEVO NÚMERO
        ultimoNumero++;

        // FORMATO
        const nuevoFolio =
        `OS-26${String(ultimoNumero).padStart(5, '0')}`;

        // INPUT FOLIO
        const inputFolio =
        document.getElementById('folio');

        if (inputFolio) {

            inputFolio.value = nuevoFolio;

        }

    }

    catch (error) {

        console.error(
            'Error generando folio:',
            error
        );

    }

}

// ======================================
// GUARDAR ORDEN
// ======================================

async function guardarOrden(event) {

    event.preventDefault();

    try {

        // ======================================
        // CAMPOS EXISTENTES
        // ======================================

        const folio =
        document.getElementById('folio')?.value || '';

        const equipo =
        document.getElementById('equipo')?.value || '';

        const tecnico =
        document.getElementById('tecnico')?.value || '';

        const prioridad =
        document.getElementById('prioridad')?.value || '';

        const descripcion =
        document.getElementById('descripcion')?.value || '';

        // ======================================
        // NUMERO FOLIO
        // ======================================

        const numeroFolio =
        parseInt(
            folio.replace('OS-26', '')
        );

        // ======================================
        // OBJETO ORDEN
        // ======================================

        const orden = {

            folio,
            numeroFolio,

            equipo,
            tecnico,
            prioridad,
            descripcion,

            estado: 'Pendiente',

            fecha:
            new Date().toLocaleString(),

            timestamp:
            firebase.firestore.FieldValue.serverTimestamp()

        };

        // ======================================
        // GUARDAR FIRESTORE
        // ======================================

        await db
        .collection('ordenes')
        .add(orden);

        alert(
            '✅ Orden guardada correctamente'
        );

        // ======================================
        // RESET FORMULARIO
        // ======================================

        const form =
        document.getElementById('formOrden');

        if(form){

            form.reset();

        }

        // ======================================
        // NUEVO FOLIO
        // ======================================

        generarFolio();

    }

    catch (error) {

        console.error(
            'Error guardando orden:',
            error
        );

        alert(
            '❌ Error al guardar orden'
        );

    }

}

// ======================================
// INICIAR
// ======================================

document.addEventListener(

    'DOMContentLoaded',

    () => {

        generarFolio();

        const form =
        document.getElementById('formOrden');

        if (form) {

            form.addEventListener(
                'submit',
                guardarOrden
            );

        }

    }

);