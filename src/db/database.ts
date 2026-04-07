import Dexie, { type Table } from 'dexie';
import type { Turno, Reserva, Usuario } from '../types';

// Clase de la base de datos
export class BeautyBrowsDB extends Dexie {
  turnos!: Table<Turno, number>;
  reservas!: Table<Reserva, number>;
  usuarios!: Table<Usuario, number>;

  constructor() {
    super('BeautyBrowsDB'); 
    this.version(1).stores({
      turnos: '++id, fecha, horaInicio, estado',
      reservas: '++id, turnoId, fechaReserva, estado',
      usuarios: '++id, email'
    });
  }

  
  async limpiarBaseDatos() {
    await this.turnos.clear();
    await this.reservas.clear();
    await this.usuarios.clear();
    console.log('Base de datos de BeautyBrows limpiada completamente');
  }

  async limpiarDatosOperativos() {
    await this.turnos.clear();
    await this.reservas.clear();
    console.log('Turnos y reservas de BeautyBrows eliminados');
  }

  
  async obtenerEstadisticas() {
    const totalTurnos = await this.turnos.count();
    const turnosActivos = await this.turnos.where('estado').equals('activo').count();
    const totalReservas = await this.reservas.count();
    const reservasConfirmadas = await this.reservas.where('estado').equals('confirmada').count();
    const reservasCanceladas = await this.reservas.where('estado').equals('cancelada').count();
    
    const turnosList = await this.turnos.where('estado').equals('activo').toArray();
    let ocupacionTotal = 0;
    
    for (const turno of turnosList) {
      const reservasCount = await this.reservas
        .where('turnoId')
        .equals(turno.id!)
        .and(reserva => reserva.estado === 'confirmada')
        .count();
      
      if (turno.capacidadMaxima > 0) {
        ocupacionTotal += (reservasCount / turno.capacidadMaxima) * 100;
      }
    }
    
    const ocupacionPromedio = turnosList.length > 0 ? ocupacionTotal / turnosList.length : 0;
    
    return {
      totalTurnos,
      turnosActivos,
      totalReservas,
      reservasConfirmadas,
      reservasCanceladas,
      ocupacionPromedio
    };
  }

  async estaVacia() {
    const turnoCount = await this.turnos.count();
    const reservaCount = await this.reservas.count();
    const usuarioCount = await this.usuarios.count();
    
    return {
      turnos: turnoCount === 0,
      reservas: reservaCount === 0,
      usuarios: usuarioCount === 0,
      total: turnoCount === 0 && reservaCount === 0 && usuarioCount === 0
    };
  }
  async seedAdmin() {
  const count = await this.usuarios.count();
  if (count === 0) {
    await this.usuarios.add({
      nombre: 'admin',
      email: 'admin@beautybrows.com',
      password: 'admin123'
    });
    console.log('Admin creado por defecto');
  }
}
}

export const db = new BeautyBrowsDB();