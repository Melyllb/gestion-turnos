import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// Fix para __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;
// Ruta a dist/ (sube un nivel desde server/ a la raíz, luego entra a dist/)
const distPath = path.resolve(__dirname, '../dist');
// Middleware principal: sirve archivos estáticos de dist/
app.use(express.static(distPath));

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));