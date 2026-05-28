// ======================================
// GUÍA DE USUARIOS
// ======================================

/*
  ESTRUCTURA DE USUARIOS EN FIRESTORE
  
  Colección: usuarios
  
  2 documentos necesarios:
  
  1. ADMINISTRADOR
     ID: admin01
     - usuario: "admin"
     - nombre: "Administrador"
     - password: "tu_contraseña_segura"
     - rol: "admin"
     - estado: "activo"
     - Acceso: Panel completo, crear órdenes, asignar técnicos
  
  2. COORDINADOR
     ID: coord01
     - usuario: "coordinador"
     - nombre: "Coordinador de Mantenimiento"
     - password: "tu_contraseña_segura"
     - rol: "coordinador"
     - estado: "activo"
     - Acceso: Crear órdenes, asignar técnicos
  
  TÉCNICOS:
  - No tienen login en el sistema
  - Reciben órdenes asignadas
  - Acceden a través de la app técnico (sin autenticación)
*/

export const USUARIOS = {
  admin: {
    usuario: 'admin',
    password: 'admin123',
    nombre: 'Administrador',
    rol: 'admin'
  },
  coordinador: {
    usuario: 'coordinador',
    password: 'coordinador123',
    nombre: 'Coordinador de Mantenimiento',
    rol: 'coordinador'
  }
};

export const ROLES = {
  ADMIN: 'admin',
  COORDINADOR: 'coordinador',
  TECNICO: 'tecnico'
};
