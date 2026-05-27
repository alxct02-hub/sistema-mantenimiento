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

        const snapshot =
        await db.collection('ordenes').get();

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

function aplicarFiltros(){

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

function generarPDF(id){

    const orden =
    ordenes.find(
        o => o.id === id
    );

    if(!orden){

        alert('Orden no encontrada');

        return;

    }

    const ventana =
    window.open('', '_blank');

    ventana.document.write(`

        <html>

        <head>

            <title>${orden.folio}</title>

            <style>

                body{

                    font-family: Arial;
                    padding:40px;

                }

                table{

                    width:100%;
                    border-collapse: collapse;

                }

                td{

                    border:1px solid #ccc;
                    padding:12px;

                }

            </style>

        </head>

        <body>

            <h1>

                Orden de Servicio

            </h1>

            <table>

                <tr>
                    <td>Folio</td>
                    <td>${orden.folio}</td>
                </tr>

                <tr>
                    <td>Equipo</td>
                    <td>${orden.equipo}</td>
                </tr>

                <tr>
                    <td>Técnico</td>
                    <td>${orden.tecnico}</td>
                </tr>

                <tr>
                    <td>Estado</td>
                    <td>${orden.estado}</td>
                </tr>

                <tr>
                    <td>Fecha</td>
                    <td>${orden.fecha}</td>
                </tr>

            </table>

            <script>

                window.onload = () => {

                    window.print();

                }

            </script>

        </body>

        </html>

    `);

}

// ======================================
// EXPORTAR EXCEL
// ======================================

function exportarExcel(){

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