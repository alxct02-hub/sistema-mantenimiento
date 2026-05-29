import { db } from './firebase-config.js';
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// TIPOS DE EVENTO — íconos y etiquetas
// ======================================

export const TIPOS_EVENTO = {
    orden_creada:            { icono: '🛠',  label: 'Orden creada',            color: 'blue'   },
    orden_iniciada:          { icono: '▶️',  label: 'Orden iniciada',           color: 'yellow' },
    orden_completada:        { icono: '✅',  label: 'Orden completada',         color: 'green'  },
    presolicitud_creada:     { icono: '📝',  label: 'Presolicitud creada',      color: 'purple' },
    presolicitud_convertida: { icono: '🔄',  label: 'Presolicitud convertida',  color: 'indigo' },
    presolicitud_eliminada:  { icono: '🗑',  label: 'Presolicitud eliminada',   color: 'red'    },
    usuario_creado:          { icono: '👤',  label: 'Usuario creado',           color: 'teal'   },
    usuario_editado:         { icono: '✏️',  label: 'Usuario editado',          color: 'orange' },
    usuario_activado:        { icono: '🔓',  label: 'Usuario activado',         color: 'green'  },
    usuario_desactivado:     { icono: '🔒',  label: 'Usuario desactivado',      color: 'red'    },
    nombre_actualizado:      { icono: '📛',  label: 'Nombre actualizado',       color: 'orange' },
    sesion_iniciada:         { icono: '🔑',  label: 'Inicio de sesión',         color: 'gray'   },
};

// ======================================
// REGISTRAR EVENTO
// ======================================

/**
 * Registra un evento en la colección `bitacora` de Firestore.
 * @param {string} tipo        — clave del tipo (ver TIPOS_EVENTO)
 * @param {string} descripcion — texto legible del evento
 * @param {Object} extras      — datos adicionales opcionales { folio, objetivo, etc. }
 */
export async function registrarEvento(tipo, descripcion, extras = {}) {
    try {
        const sesionRaw = localStorage.getItem('sesion');
        const sesion    = sesionRaw ? JSON.parse(sesionRaw) : null;

        const fechaTexto = new Date().toLocaleString('es-MX', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        await addDoc(collection(db, 'bitacora'), {
            tipo,
            descripcion,
            usuario:      sesion?.usuario      || 'sistema',
            nombreUsuario: sesion?.nombre      || 'Sistema',
            rolUsuario:   sesion?.rol          || '',
            fechaTexto,
            timestamp:    serverTimestamp(),
            ...extras
        });
    } catch (err) {
        // La bitácora nunca debe interrumpir el flujo principal
        console.warn('Bitácora: no se pudo registrar evento', tipo, err);
    }
}
