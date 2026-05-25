// =============================================
// DASHBOARD.JS - Órdenes de Servicio CCP
// =============================================

let ordenesData = [];

// =============================================
// Cargar todas las órdenes desde Firestore
// =============================================
async function cargarOrdenes() {
    try {
        const snapshot = await db.collection('ordenes').get();

        ordenesData = [];
        let total = 0;
        let pendientes = 0;
        let completadas = 0;

        snapshot.forEach((doc) => {
            const orden = doc.data();
            orden.id = doc.id;                    // Guardamos el ID del documento
            ordenesData.push(orden);

            total++;

            if (orden.estado === "Completada" || orden.estado === "Finalizada") {
                completadas++;
            } else {
                pendientes++;
            }
        });

        // Actualizar contadores en las tarjetas
        document.getElementById('totalOrdenes').innerText = total;
        document.getElementById('pendientes').innerText = pendientes;
        document.getElementById('completadas').innerText = completadas;

        // Renderizar la tabla
        renderizarTabla();

    } catch (error) {
        console.error("Error al cargar las órdenes:", error);
        alert("Error al cargar las órdenes. Revisa la consola.");
    }
}

// =============================================
// Renderizar la tabla de órdenes
// =============================================
function renderizarTabla() {
    const tbody = document.getElementById('tablaOrdenes');
    tbody.innerHTML = '';

    if (ordenesData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-8 py-12 text-center text-gray-500">
                    <i class="fas fa-folder-open text-4xl mb-3"></i><br>
                    No hay órdenes registradas aún
                </td>
            </tr>
        `;
        return;
    }

    ordenesData.forEach((orden) => {
        const fila = document.createElement('tr');
        fila.className = "hover:bg-gray-50 transition-colors";

        fila.innerHTML = `
            <td class="px-8 py-5">${orden.equipo || '-'}</td>
            <td class="px-8 py-5">${orden.tecnico || '-'}</td>
            <td class="px-8 py-5">${orden.tipo || '-'}</td>
            <td class="px-8 py-5">
                <span class="inline-block px-4 py-1 rounded-full text-xs font-medium
                    ${orden.prioridad === 'Alta' ? 'bg-red-100 text-red-700' : 
                      orden.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'}">
                    ${orden.prioridad || 'Baja'}
                </span>
            </td>
            <td class="px-8 py-5">
                <span class="inline-block px-4 py-1 rounded-full text-xs font-medium
                    ${orden.estado === 'Completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                    ${orden.estado || 'Pendiente'}
                </span>
            </td>
            <td class="px-8 py-5">${orden.fecha || '-'}</td>
            <td class="px-8 py-5 text-center">
                <button onclick="verDetalle('${orden.id}')" 
                        class="text-blue-600 hover:text-blue-800 mx-2">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editarOrden('${orden.id}')" 
                        class="text-amber-600 hover:text-amber-800 mx-2">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// =============================================
// Funciones de acciones (pendientes de implementar)
// =============================================
function verDetalle(id) {
    alert("Ver detalle de orden ID: " + id + "\n\nEsta función se implementará próximamente.");
}

function editarOrden(id) {
    alert("Editar orden ID: " + id + "\n\nEsta función se implementará próximamente.");
}

function cerrarSesion() {
    if (confirm("¿Estás seguro de cerrar sesión?")) {
        auth.signOut().then(() => {
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Error al cerrar sesión:", error);
            alert("Error al cerrar sesión");
        });
    }
}

// =============================================
// Inicializar Dashboard al cargar la página
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario está autenticado
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            console.log("Usuario autenticado:", user.email);
            cargarOrdenes();
        }
    });
});