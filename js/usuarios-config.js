// ======================================
// GUÍA DE USUARIOS
// ======================================

/*
  ESTRUCTURA DE USUARIOS EN FIRESTORE
  
  Colección: usuarios
  
  Documentos necesarios:
  
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
     - Acceso: Crear órdenes, asignar técnicos, presolicitudes
  
  3. JEFE DE PLANTA
     ID: jefe01
     - usuario: "jefe_planta"
     - nombre: "Jefe de Planta"
     - password: "tu_contraseña_segura"
     - rol: "jefe_planta"
     - estado: "activo"
     - Acceso: Crear presolicitudes, convertir a órdenes
  
  TÉCNICOS:
  - No tienen login en el sistema
  - Reciben órdenes asignadas
  - Acceden a través de la app técnico (sin autenticación)
  
  NUEVO FLUJO PARA JEFES DE PLANTA:
  
  1. Jefe de planta entra al sistema con sus credenciales
  2. Ve la opción "Presolicitudes" en el menú
  3. Crea una presolicitud con información de la orden
  4. La presolicitud se guarda como "borrador"
  5. Luego puede ver sus presolicitudes
  6. Selecciona una presolicitud y elige "Convertir a Orden"
  7. Se genera automáticamente la orden de servicio
  8. La presolicitud cambia a estado "convertida"
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
  },
  jefe_planta: {
    usuario: 'jefe_planta',
    password: 'jefe123',
    nombre: 'Jefe de Planta',
    rol: 'jefe_planta'
  }
};

export const ROLES = {
  ADMIN: 'admin',
  COORDINADOR: 'coordinador',
  JEFE_PLANTA: 'jefe_planta',
  TECNICO: 'tecnico'
};
