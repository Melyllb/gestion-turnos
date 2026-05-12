import { Router } from 'express';
import { getHealth, getHealthReport } from '../controllers/healthController';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const data = await getHealth();
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al obtener datos de salud' });
  }
});

router.get('/report', async (_req, res) => {
  try {
    const report = await getHealthReport();
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="report.txt"');
    res.send(report);
  } catch {
    res.status(500).send('Error al generar reporte de salud');
  }
});

export default router;
