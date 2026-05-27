// ======================================
// VARIABLES
// ======================================

let ultimoFolio = 0;

// ======================================
// GENERAR FOLIO
// ======================================

async function generarFolio() {

    try {

        const snapshot = await db
        .collection('ordenes')
        .orderBy('numeroFolio', 'desc')
        .limit(1)
        .get();

        if (!snapshot.empty) {

            const ultimaOrden =
            snapshot.docs[0].data();

            ultimoFolio =
            ultimaOrden.numeroFolio || 0;

        }

        ultimoFolio++;

        const folio =
        `OS-26${String(ultimoFolio).padStart(5, '0')}`;

        const inputFolio =
        document.getElementById('folio');

        if(inputFolio){

            inputFolio.value = folio;

        }

    }

    catch(error){

        console.error(
            'Error generando folio:',
            error
        );

    }

}

// ======================================
// GUARDAR ORDEN
// ======================================

async function guardarOrden(event){

    event.preventDefault();

    try {

        const folio =
        document.getElementById('folio').value;

        const equipo =
        document.getElementById('equipo').value;

        const tecnico =
        document.getElementById('tecnico').value;

        const prioridad =
        document.getElementById('prioridad').value;

        const descripcion =
        document.getElementById('descripcion').value;

        const numeroFolio =
        parseInt(folio.replace('OS-26', ''));

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

            fechaCreacion:
            firebase.firestore.FieldValue.serverTimestamp()

        };

        await db
        .collection('ordenes')
        .add(orden);

        alert('✅ Orden guardada correctamente');

        document.getElementById('formOrden').reset();

        generarFolio();

    }

    catch(error){

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

        if(form){

            form.addEventListener(
                'submit',
                guardarOrden
            );

        }

    }

);