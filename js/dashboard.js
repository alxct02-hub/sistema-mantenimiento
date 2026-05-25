auth.onAuthStateChanged((user)=>{

  if(!user){

    window.location.href = "login.html";

  }

});

function logout(){

  auth.signOut();

}

const ordenForm = document.getElementById('ordenForm');

ordenForm.addEventListener('submit', async (e)=>{

  e.preventDefault();

  const equipo = document.getElementById('equipo').value;
  const tecnico = document.getElementById('tecnico').value;
  const prioridad = document.getElementById('prioridad').value;
  const tipo = document.getElementById('tipo').value;
  const descripcion = document.getElementById('descripcion').value;

  try{

    await db.collection("ordenes").add({

      equipo,
      tecnico,
      prioridad,
      tipo,
      descripcion,

      estado:"Pendiente",

      fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()

    });

    alert("Orden creada correctamente");

    ordenForm.reset();

    cargarOrdenes();

  }catch(error){

    console.error(error);

    alert("Error al crear orden");

  }

});

async function cargarOrdenes(){

  const tabla = document.getElementById('tablaOrdenes');

  tabla.innerHTML = "";

  const snapshot = await db.collection("ordenes")
  .orderBy("fechaCreacion","desc")
  .get();

  let total = 0;
  let pendientes = 0;
  let completadas = 0;

  snapshot.forEach((doc)=>{

    total++;

    const orden = doc.data();

    if(orden.estado === "Pendiente"){
      pendientes++;
    }

    if(orden.estado === "Completada"){
      completadas++;
    }

    const tr = document.createElement('tr');

    tr.innerHTML = `

      <td>${orden.equipo}</td>

      <td>${orden.tecnico}</td>

      <td>${orden.tipo}</td>

      <td>${orden.prioridad}</td>

      <td class="
        ${orden.estado === 'Pendiente'
        ? 'estado-pendiente'
        : 'estado-completada'}
      ">
        ${orden.estado}
      </td>

    `;

    tabla.appendChild(tr);

  });

  document.getElementById('totalOrdenes').innerText = total;

  document.getElementById('pendientes').innerText = pendientes;

  document.getElementById('completadas').innerText = completadas;

}

cargarOrdenes();