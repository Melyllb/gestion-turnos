// Tipos para Turnos
export interface Turno {
  id?: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
  estado: 'activo' | 'inactivo';
}

// Tipos para Reservas
export interface Reserva {
  id?: number;
  turnoId: number;
  nombreCliente: string;
  carnetIdentidad: string;
  fechaReserva: string;
  estado: 'confirmada' | 'cancelada';
}

// Tipo extendido: reserva con los datos del turno asociado incrustados
export interface ReservaConTurno extends Reserva {
  turno: {
    fecha: string;
    horaInicio: string;
    horaFin: string;
  } | null;
}

// Tipos para Usuarios
export interface Usuario {
  id?: number;
  email: string;
  password: string;
}


// Tipo extendido para mostrar turnos con disponibilidad
export interface TurnoConDisponibilidad extends Turno {
  reservasConfirmadas: number;
  cuposDisponibles: number;
}

// Tipo para el formulario de reserva
export interface FormularioReserva {
  nombreCliente: string;
  carnetIdentidad: string;
}

// Tipo para el formulario de login
export interface CredencialesLogin {
  email: string;
  password: string;
}

// Tipo para el formulario de turno (crear/editar)
export interface FormularioTurno {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
}

// Tipo para el contexto de autenticación
export interface AuthContextType {
  isAuthenticated: boolean;
  user: Usuario | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Tipo para estadísticas
export interface Estadisticas {
  totalTurnos: number;
  turnosActivos: number;
  totalReservas: number;
  reservasConfirmadas: number;
  reservasCanceladas: number;
  ocupacionPromedio: number;
}

