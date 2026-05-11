import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/db.json');

export interface Database {
  turnos: Turno[];
  reservas: Reserva[];
  usuarios: Usuario[];
  contadores: {
    turnos: number;
    reservas: number;
    usuarios: number;
  };
}

export interface Turno {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
  estado: 'activo' | 'inactivo';
}

export interface Reserva {
  id: number;
  turnoId: number;
  nombreCliente: string;
  carnetIdentidad: string;
  fechaReserva: string;
  estado: 'confirmada' | 'cancelada';
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
}

export interface TurnoInput {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
}

export interface ReservaInput {
  turnoId: number;
  nombreCliente: string;
  carnetIdentidad: string;
}

export async function readDB(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const initialDB: Database = {
      turnos: [],
      reservas: [],
      usuarios: [{
        id: 1,
        nombre: 'Administrador',
        email: 'admin@beautybrows.com',
        password: 'admin123'
      }],
      contadores: { turnos: 0, reservas: 0, usuarios: 1 }
    };
    await writeDB(initialDB);
    return initialDB;
  }
}

export async function writeDB(data: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getNextId(tabla: 'turnos' | 'reservas' | 'usuarios'): Promise<number> {
  const db = await readDB();
  db.contadores[tabla]++;
  await writeDB(db);
  return db.contadores[tabla];
}
