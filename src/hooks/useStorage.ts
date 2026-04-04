import { db } from '../db/database';
import type { Turno, Reserva, Usuario, FormularioTurno, FormularioReserva } from '../types';

export const useStorage = () => {
  
  // ==================== TURNOS (CRUD) ====================
  
  const getTurnos = async () => {
    try {
      return await db.turnos.toArray();
    } catch (error) {
      console.error('Error al obtener turnos:', error);
      throw error;
    }
  };

  const getTurnosActivos = async () => {
    try {
      return await db.turnos.where('estado').equals('activo').toArray();
    } catch (error) {
      console.error('Error al obtener turnos activos:', error);
      throw error;
    }
  };

  const getTurnoById = async (id: number) => {
    try {
      return await db.turnos.get(id);
    } catch (error) {
      console.error('Error al obtener turno:', error);
      throw error;
    }
  };

  const addTurno = async (turno: FormularioTurno): Promise<number> => {
    try {
      const existe = await db.turnos
        .where('fecha')
        .equals(turno.fecha)
        .and(t => t.horaInicio === turno.horaInicio)
        .first();
      
      if (existe) {
        throw new Error('Ya existe un turno en esta fecha y hora');
      }

      const nuevoTurno: Turno = {
        ...turno,
        estado: turno.estado || 'activo'
      };
      
      const id = await db.turnos.add(nuevoTurno);
      return id;
    } catch (error) {
      console.error('Error al crear turno:', error);
      throw error;
    }
  };

  const updateTurno = async (id: number, turno: Partial<FormularioTurno>) => {
    try {
      const turnoExistente = await db.turnos.get(id);
      if (!turnoExistente) {
        throw new Error('Turno no encontrado');
      }

      if (turno.fecha && turno.horaInicio) {
        const conflicto = await db.turnos
          .where('fecha')
          .equals(turno.fecha)
          .and(t => t.horaInicio === turno.horaInicio && t.id !== id)
          .first();
        
        if (conflicto) {
          throw new Error('Ya existe otro turno en esta fecha y hora');
        }
      }
      
      await db.turnos.update(id, turno);
      return true;
    } catch (error) {
      console.error('Error al actualizar turno:', error);
      throw error;
    }
  };

  const deleteTurno = async (id: number) => {
    try {
      const reservas = await db.reservas
        .where('turnoId')
        .equals(id)
        .count();
      
      if (reservas > 0) {
        throw new Error('No se puede eliminar un turno que tiene reservas asociadas');
      }
      
      await db.turnos.delete(id);
      return true;
    } catch (error) {
      console.error('Error al eliminar turno:', error);
      throw error;
    }
  };

  const toggleTurnoEstado = async (id: number, estado: 'activo' | 'inactivo') => {
    try {
      await db.turnos.update(id, { estado });
      return true;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  };

  const verificarDisponibilidadTurno = async (turnoId: number): Promise<number> => {
    try {
      const turno = await db.turnos.get(turnoId);
      if (!turno) throw new Error('Turno no encontrado');
      
      const reservasConfirmadas = await db.reservas
        .where('turnoId')
        .equals(turnoId)
        .and(reserva => reserva.estado === 'confirmada')
        .count();
      
      return turno.capacidadMaxima - reservasConfirmadas;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  };

  // ==================== RESERVAS (CRUD) ====================
  
  const getReservas = async () => {
    try {
      return await db.reservas.toArray();
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      throw error;
    }
  };

  const getReservasConTurno = async () => {
    try {
      const reservas = await db.reservas.toArray();
      const reservasConTurno = await Promise.all(
        reservas.map(async (reserva) => {
          const turno = await db.turnos.get(reserva.turnoId);
          return {
            ...reserva,
            turno: turno || null
          };
        })
      );
      return reservasConTurno;
    } catch (error) {
      console.error('Error al obtener reservas con turno:', error);
      throw error;
    }
  };

  const getReservasByTurno = async (turnoId: number) => {
    try {
      return await db.reservas
        .where('turnoId')
        .equals(turnoId)
        .toArray();
    } catch (error) {
      console.error('Error al obtener reservas del turno:', error);
      throw error;
    }
  };

  const getReservaById = async (id: number) => {
    try {
      return await db.reservas.get(id);
    } catch (error) {
      console.error('Error al obtener reserva:', error);
      throw error;
    }
  };

  const addReserva = async (reserva: FormularioReserva & { turnoId: number }): Promise<number> => {
    try {
      const turno = await db.turnos.get(reserva.turnoId);
      if (!turno) {
        throw new Error('Turno no encontrado');
      }
      
      if (turno.estado !== 'activo') {
        throw new Error('El turno no está disponible');
      }
      
      const cuposDisponibles = await verificarDisponibilidadTurno(reserva.turnoId);
      if (cuposDisponibles <= 0) {
        throw new Error('No hay cupos disponibles para este turno');
      }
      
      const reservaExistente = await db.reservas
        .where('turnoId')
        .equals(reserva.turnoId)
        .and(r => r.carnetIdentidad === reserva.carnetIdentidad && r.estado === 'confirmada')
        .first();
      
      if (reservaExistente) {
        throw new Error('Este cliente ya tiene una reserva en este turno');
      }
      
      const nuevaReserva: Reserva = {
        turnoId: reserva.turnoId,
        nombreCliente: reserva.nombreCliente,
        carnetIdentidad: reserva.carnetIdentidad,
        fechaReserva: new Date().toISOString(),
        estado: 'confirmada'
      };
      
      const id = await db.reservas.add(nuevaReserva);
      return id;
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  };

  const cancelReserva = async (id: number) => {
    try {
      const reserva = await db.reservas.get(id);
      if (!reserva) {
        throw new Error('Reserva no encontrada');
      }
      
      if (reserva.estado === 'cancelada') {
        throw new Error('La reserva ya está cancelada');
      }
      
      await db.reservas.update(id, { estado: 'cancelada' });
      return true;
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      throw error;
    }
  };

  const deleteReserva = async (id: number) => {
    try {
      await db.reservas.delete(id);
      return true;
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      throw error;
    }
  };

  const getReservasByCliente = async (carnetIdentidad: string) => {
    try {
      return await db.reservas
        .where('carnetIdentidad')
        .equals(carnetIdentidad)
        .toArray();
    } catch (error) {
      console.error('Error al obtener reservas del cliente:', error);
      throw error;
    }
  };

  // ==================== USUARIOS / AUTENTICACIÓN ====================
  
  // ==================== USUARIOS / AUTENTICACIÓN ====================

const loginUsuario = async (email: string, password: string): Promise<Usuario | null> => {
  try {
    const usuario = await db.usuarios
      .where('email')
      .equals(email.toLowerCase())
      .first();
    
    if (!usuario) return null;
    if (usuario.password !== password) return null;
    
    return usuario;
  } catch (error) {
    console.error('Error en login:', error);
    return null;
  }
};

const existeUsuario = async (email: string): Promise<boolean> => {
  try {
    const usuario = await db.usuarios
      .where('email')
      .equals(email.toLowerCase())
      .first();
    return !!usuario;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};

const addUsuario = async (usuario: Omit<Usuario, 'id'>): Promise<number> => {
  try {
    const existe = await existeUsuario(usuario.email);
    if (existe) throw new Error('El usuario ya existe');
    
    return await db.usuarios.add({
      ...usuario,
      email: usuario.email.toLowerCase()
    });
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    return await db.usuarios.toArray();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};
const getUsuarioByEmail = async (email: string) => {
  return db.usuarios.where('email').equals(email.toLowerCase()).first();
};

  // ==================== ESTADÍSTICAS ====================
  
  const getEstadisticas = async () => {
    try {
      return await db.obtenerEstadisticas();
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  };

  const getTurnosConDisponibilidad = async () => {
    try {
      const turnos = await db.turnos.where('estado').equals('activo').toArray();
      
      const turnosConDisponibilidad = await Promise.all(
        turnos.map(async (turno) => {
          const reservasConfirmadas = await db.reservas
            .where('turnoId')
            .equals(turno.id!)
            .and(reserva => reserva.estado === 'confirmada')
            .count();
          
          return {
            ...turno,
            reservasConfirmadas,
            cuposDisponibles: turno.capacidadMaxima - reservasConfirmadas
          };
        })
      );
      
      return turnosConDisponibilidad.sort((a, b) => {
        if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
        return a.horaInicio.localeCompare(b.horaInicio);
      });
    } catch (error) {
      console.error('Error al obtener turnos con disponibilidad:', error);
      throw error;
    }
  };

  return {
    // Turnos
    getTurnos,
    getTurnosActivos,
    getTurnoById,
    addTurno,
    updateTurno,
    deleteTurno,
    toggleTurnoEstado,
    verificarDisponibilidadTurno,
    getTurnosConDisponibilidad,
    
    // Reservas
    getReservas,
    getReservasConTurno,
    getReservasByTurno,
    getReservaById,
    addReserva,
    cancelReserva,
    deleteReserva,
    getReservasByCliente,
    
    // Usuarios
    loginUsuario,
    existeUsuario,
    addUsuario,
    getUsuarios,
    getUsuarioByEmail,
    
    // Estadísticas
    getEstadisticas,
  };
};