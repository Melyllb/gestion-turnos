import { Router } from 'express';
import {
  getTurnos,
  getTurnoById,
  getTurnosActivos,
  createTurno,
  updateTurno,
  deleteTurno,
  toggleTurnoEstado,
  getTurnosConDisponibilidad,
} from '../controllers/turnosController';
import { validateTurnoCreate, validateTurnoUpdate } from '../middleware/validateTurno';

const router = Router();

router.get('/', getTurnos);
router.get('/activos', getTurnosActivos);
router.get('/disponibilidad', getTurnosConDisponibilidad);
router.get('/:id', getTurnoById);
router.post('/', validateTurnoCreate, createTurno);
router.put('/:id', validateTurnoUpdate, updateTurno);
router.delete('/:id', deleteTurno);
router.patch('/:id/toggle', toggleTurnoEstado);

export default router;
