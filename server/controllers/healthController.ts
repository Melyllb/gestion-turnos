import os from 'os';
import fs from 'fs/promises';

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

export async function getHealth() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const cpus = os.cpus();
  const loadAvg = os.loadavg();

  let diskInfo;
  try {
    const stats = await fs.statfs(process.cwd());
    diskInfo = {
      total: stats.blocks * stats.bsize,
      usado: (stats.blocks - stats.bfree) * stats.bsize,
      libre: stats.bfree * stats.bsize,
      porcentajeUso: ((1 - stats.bfree / stats.blocks) * 100).toFixed(2) + '%',
    };
  } catch {
    diskInfo = { total: 0, usado: 0, libre: 0, porcentajeUso: 'N/A' };
  }

  return {
    estado: 'online',
    timestamp: new Date().toISOString(),
    sistemaOperativo: {
      plataforma: os.platform(),
      arquitectura: os.arch(),
      tipo: os.type(),
      version: os.release(),
      hostname: os.hostname(),
      usuario: os.userInfo().username,
      uptime: formatUptime(os.uptime()),
    },
    memoria: {
      total: formatBytes(totalMem),
      usado: formatBytes(usedMem),
      libre: formatBytes(freeMem),
      porcentajeUso: ((usedMem / totalMem) * 100).toFixed(2) + '%',
    },
    cpu: {
      modelo: cpus[0]?.model || 'N/A',
      nucleos: cpus.length,
      cargaPromedio: {
        '1min': loadAvg[0],
        '5min': loadAvg[1],
        '15min': loadAvg[2],
      },
    },
    disco: diskInfo,
  };
}

export async function getHealthReport() {
  const data = await getHealth();
  const { sistemaOperativo, memoria, cpu, disco } = data;

  const lines = [
    '========================================',
    '  REPORTE DE SALUD DEL SERVIDOR',
    '========================================',
    '',
    `Estado: ${data.estado}`,
    `Timestamp: ${data.timestamp}`,
    '',
    '--- SISTEMA OPERATIVO ---',
    `Plataforma: ${sistemaOperativo.plataforma}`,
    `Arquitectura: ${sistemaOperativo.arquitectura}`,
    `Tipo: ${sistemaOperativo.tipo}`,
    `Versi\u00f3n: ${sistemaOperativo.version}`,
    `Hostname: ${sistemaOperativo.hostname}`,
    `Usuario: ${sistemaOperativo.usuario}`,
    `Uptime: ${sistemaOperativo.uptime}`,
    '',
    '--- MEMORIA RAM ---',
    `Total: ${memoria.total}`,
    `Usado: ${memoria.usado}`,
    `Libre: ${memoria.libre}`,
    `Porcentaje de uso: ${memoria.porcentajeUso}`,
    '',
    '--- CPU ---',
    `Modelo: ${cpu.modelo}`,
    `N\u00facleos: ${cpu.nucleos}`,
    `Carga promedio (1 min): ${cpu.cargaPromedio['1min']}`,
    `Carga promedio (5 min): ${cpu.cargaPromedio['5min']}`,
    `Carga promedio (15 min): ${cpu.cargaPromedio['15min']}`,
    '',
    '--- DISCO ---',
    `Total: ${disco.total}`,
    `Usado: ${disco.usado}`,
    `Libre: ${disco.libre}`,
    `Porcentaje de uso: ${disco.porcentajeUso}`,
    '',
    '========================================',
    '  FIN DEL REPORTE',
    '========================================',
  ];

  return lines.join('\n');
}
