// =============================================
// DASHBOARD.JS - Órdenes de Servicio CCP
// =============================================

let ordenesData = [];

// Cargar órdenes desde Firestore
async function cargarOrdenes() {
    try {
        const snapshot = await db.collection('ordenes').get();

        ordenesData = [];
        let total = 0;
        let pendientes = 0;
        let completadas = 0;

        snapshot.forEach((doc) => {
            const orden = doc.data();
            orden.id = doc.id;
            ordenesData.push(orden);

            total++;

            if (orden.estado === "Completada" || orden.estado === "Finalizada") {
                completadas++;
            } else {
                pendientes++;
            }
        });

        // Actualizar tarjetas
        document.getElementById('totalOrdenes').innerText = total;
        document.getElementById('pendientes').innerText = pendientes;
        document.getElementById('completadas').innerText = completadas;

        renderizarTabla();

    } catch (error) {
        console.error("Error al cargar órdenes:", error);
    }
}

// Renderizar tabla
function renderizarTabla() {
    const tbody = document.getElementById('tablaOrdenes');
    tbody.innerHTML = '';

    if (ordenesData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-16 text-center text-gray-500">
                    <i class="fas fa-folder-open text-5xl mb-4 opacity-50"></i><br>
                    No hay órdenes registradas todavía
                </td>
            </tr>`;
        return;
    }

    ordenesData.forEach(orden => {
        const fila = document.createElement('tr');
        fila.className = "hover:bg-gray-50 border-b last:border-none";

        fila.innerHTML = `
            <td class="px-6 py-4">${orden.equipo || '-'}</td>
            <td class="px-6 py-4">${orden.tecnico || '-'}</td>
            <td class="px-6 py-4">${orden.tipo || '-'}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium 
                    ${orden.prioridad === 'Alta' ? 'bg-red-100 text-red-700' : 
                      orden.prioridad === 'Media' ? 'bg-orange-100 text-orange-700' : 
                      'bg-green-100 text-green-700'}">
                    ${orden.prioridad || 'Baja'}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium
                    ${orden.estado === 'Completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                    ${orden.estado || 'Pendiente'}
                </span>
            </td>
            <td class="px-6 py-4">${orden.fecha || '-'}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="verDetalle('${orden.id}')" class="text-blue-600 hover:text-blue-800 mx-1">
                    👁️
                </button>
                <button onclick="editarOrden('${orden.id}')" class="text-amber-600 hover:text-amber-800 mx-1">
                    ✏️
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// Funciones pendientes
function verDetalle(id) { alert("Detalle de orden: " + id); }
function editarOrden(id) { alert("Editar orden: " + id); }

function cerrarSesion() {
    if (confirm("¿Cerrar sesión?")) {
        auth.signOut().then(() => window.location.href = "login.html");
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            cargarOrdenes();
        }
    });
});