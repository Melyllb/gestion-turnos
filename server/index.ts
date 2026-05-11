import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import turnosRouter from './routes/turnos';
import reservasRouter from './routes/reservas';
import usuariosRouter from './routes/usuarios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/turnos', turnosRouter);
app.use('/api/reservas', reservasRouter);
app.use('/api/usuarios', usuariosRouter);

const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
