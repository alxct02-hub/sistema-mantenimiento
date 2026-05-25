auth.onAuthStateChanged((user)=>{

  if(!user){

    window.location.href = "login.html";

  }else{

    cargarOrdenes();

  }

});

function logout(){

  auth.signOut();

}

async function cargarOrdenes(){

  const contenedor = document.getElementById('contenedorOrdenes');

  contenedor.innerHTML = "";

  const snapshot = await db.collection("ordenes")
  .orderBy("fechaCreacion","desc")
  .get();

  snapshot.forEach((doc)=>{

    const orden = doc.data();

    const card = document.createElement('div');

    card.classList.add('orden-card');

    let claseEstado = "pendiente";

    if(orden.estado === "En Proceso"){
      claseEstado = "proceso";
    }

    if(orden.estado === "Completada"){
      claseEstado = "completada";
    }

    card.innerHTML = `

      <h2>${orden.equipo}</h2>

      <span class="badge ${claseEstado}">
        ${orden.estado}
      </span>

      <p><strong>Técnico:</strong> ${orden.tecnico}</p>

      <p><strong>Tipo:</strong> ${orden.tipo}</p>

      <p><strong>Prioridad:</strong> ${orden.prioridad}</p>

      <p><strong>Descripción:</strong> ${orden.descripcion}</p>

      <textarea
        id="comentario-${doc.id}"
        placeholder="Comentarios del trabajo..."
      ></textarea>

      <input
        type="file"
        id="imagen-${doc.id}"
        accept="image/*"
      >

      ${orden.estado === "Pendiente"
      ? `
        <button
          class="btn btn-iniciar"
          onclick="iniciarTrabajo('${doc.id}')"
        >
          Iniciar Trabajo
        </button>
      `
      : ''}

      ${orden.estado === "En Proceso"
      ? `
        <button
          class="btn btn-finalizar"
          onclick="finalizarTrabajo('${doc.id}')"
        >
          Finalizar Trabajo
        </button>
      `
      : ''}

    `;

    contenedor.appendChild(card);

  });

}

async function iniciarTrabajo(id){

  try{

    await db.collection("ordenes").doc(id).update({

      estado:"En Proceso",

      horaInicio: new Date().toLocaleString()

    });

    alert("Trabajo iniciado");

    cargarOrdenes();

  }catch(error){

    console.error(error);

    alert("Error");

  }

}

async function finalizarTrabajo(id){

  try{

    const comentario = document.getElementById(
      `comentario-${id}`
    ).value;

    const archivo = document.getElementById(
      `imagen-${id}`
    ).files[0];

    let imagenURL = "";

    if(archivo){

      const nombreArchivo = Date.now() + "_" + archivo.name;

      const storageRef = storage.ref(
        `evidencias/${nombreArchivo}`
      );

      await storageRef.put(archivo);

      imagenURL = await storageRef.getDownloadURL();

    }

    await db.collection("ordenes").doc(id).update({

      estado:"Completada",

      horaFinal: new Date().toLocaleString(),

      comentarioFinal: comentario,

      evidencia: imagenURL

    });

    alert("Orden finalizada");

    cargarOrdenes();

  }catch(error){

    console.error(error);

    alert("Error al finalizar");

  }

}