import { Router } from 'express';
import {
  getReservas,
  getReservaById,
  getReservasByTurno,
  createReserva,
  cancelReserva,
  deleteReserva,
} from '../controllers/reservasController';
import { validateReservaCreate } from '../middleware/validateReserva';

const router = Router();

router.get('/', getReservas);
router.get('/:id', getReservaById);
router.get('/turno/:turnoId', getReservasByTurno);
router.post('/', validateReservaCreate, createReserva);
router.patch('/:id/cancelar', cancelReserva);
router.delete('/:id', deleteReserva);

export default router;
