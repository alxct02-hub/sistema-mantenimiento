// ======================================
// VARIABLES
// ======================================

let ordenes = [];
let ordenesFiltradas = [];

// ======================================
// CARGAR HISTORIAL
// ======================================

async function cargarHistorial(){

    try {

        const snapshot = await db
        .collection('ordenes')
        .get();

        ordenes = [];

        snapshot.forEach((doc) => {

            const orden = doc.data();

            orden.id = doc.id;

            ordenes.push(orden);

        });

        ordenesFiltradas = [...ordenes];

        renderizarTabla();

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// RENDER TABLA
// ======================================

function renderizarTabla(){

    const tbody =
    document.getElementById('tablaHistorial');

    tbody.innerHTML = '';

    ordenesFiltradas.forEach((orden) => {

        const fila =
        document.createElement('tr');

        fila.innerHTML = `

            <td class="border px-4 py-3">
                ${orden.folio || '-'}
            </td>

            <td class="border px-4 py-3">
                ${orden.equipo || '-'}
            </td>

            <td class="border px-4 py-3">
                ${orden.tecnico || '-'}
            </td>

            <td class="border px-4 py-3">
                ${orden.estado || '-'}
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
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                >

                    PDF

                </button>

            </td>

        `;

        tbody.appendChild(fila);

    });

}

// ======================================
// FILTROS
// ======================================

function aplicarFiltros(){

    const fechaInicio =
    document.getElementById('fechaInicioFiltro').value;

    const fechaFin =
    document.getElementById('fechaFinFiltro').value;

    const equipo =
    document.getElementById('equipoFiltro')
    .value
    .toLowerCase();

    const estado =
    document.getElementById('estadoFiltro').value;

    ordenesFiltradas =
    ordenes.filter((orden) => {

        let cumple = true;

        // EQUIPO
        if(
            equipo &&
            !(
                orden.equipo || ''
            )
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

    let inicio = new Date(fechaInicio);

    let fin = new Date(fechaFin);

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

            const inicioLaboral =
            new Date(inicio);

            inicioLaboral.setHours(
                horaInicio,
                0,
                0,
                0
            );

            const finLaboral =
            new Date(inicio);

            finLaboral.setHours(
                horaFin,
                0,
                0,
                0
            );

            const inicioReal =
            inicio > inicioLaboral
            ? inicio
            : inicioLaboral;

            const finReal =
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
                    <td>Tiempo laboral</td>

                    <td>

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
// EXCEL
// ======================================

function exportarExcel(){

    const ws =
    XLSX.utils.json_to_sheet(
        ordenesFiltradas
    );

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

    cargarHistorial

);