import { Router } from 'express';
import { getUsuarios, getUsuarioById, login, register } from '../controllers/usuariosController';
import { validateLogin, validateRegister } from '../middleware/validateAuth';

const router = Router();

router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);

export default router;
