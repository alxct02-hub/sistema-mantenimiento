// ======================================
// CONFIGURACIÓN DE USUARIOS DEL SISTEMA
// ======================================

/*
  ESTRUCTURA DE USUARIOS EN FIRESTORE
  
  Colección: usuarios
  Total: 8 usuarios

  ROLES Y ACCESOS:
  - admin:       Acceso total al sistema
  - jefe_planta: Crear presolicitudes + ver estado de sus órdenes
  - tecnico:     Solo app técnico (ver y trabajar órdenes de servicio)
*/

export const USUARIOS_SETUP = [
  {
    id: 'admin01',
    usuario: 'admin',
    nombre: 'Administrador',
    password: 'Admin2024!',
    rol: 'admin',
    estado: 'activo'
  },
  {
    id: 'jefe01',
    usuario: 'jefe_planta1',
    nombre: 'Jefe de Planta 1',
    password: 'Jefe2024#1',
    rol: 'jefe_planta',
    estado: 'activo'
  },
  {
    id: 'jefe02',
    usuario: 'jefe_planta2',
    nombre: 'Jefe de Planta 2',
    password: 'Jefe2024#2',
    rol: 'jefe_planta',
    estado: 'activo'
  },
  {
    id: 'jefe03',
    usuario: 'jefe_planta3',
    nombre: 'Jefe de Planta 3',
    password: 'Jefe2024#3',
    rol: 'jefe_planta',
    estado: 'activo'
  },
  {
    id: 'tec01',
    usuario: 'tecnico1',
    nombre: 'Técnico 1',
    password: 'Tec2024#1',
    rol: 'tecnico',
    tecnicoId: 'TEC-001',
    estado: 'activo'
  },
  {
    id: 'tec02',
    usuario: 'tecnico2',
    nombre: 'Técnico 2',
    password: 'Tec2024#2',
    rol: 'tecnico',
    tecnicoId: 'TEC-002',
    estado: 'activo'
  },
  {
    id: 'tec03',
    usuario: 'tecnico3',
    nombre: 'Técnico 3',
    password: 'Tec2024#3',
    rol: 'tecnico',
    tecnicoId: 'TEC-003',
    estado: 'activo'
  },
  {
    id: 'tec04',
    usuario: 'tecnico4',
    nombre: 'Técnico 4',
    password: 'Tec2024#4',
    rol: 'tecnico',
    tecnicoId: 'TEC-004',
    estado: 'activo'
  }
];

export const ROLES = {
  ADMIN: 'admin',
  JEFE_PLANTA: 'jefe_planta',
  TECNICO: 'tecnico'
};
