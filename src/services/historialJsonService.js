const fs = require('fs');
const path = require('path');

const HISTORIAL_DIR = path.join(__dirname, '../../data/historial');

function formatFecha(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function sanitizeIdentificador(identificador) {
  return identificador.replace(/:/g, '-');
}

function getFilePath(identificadorDispositivo, date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  const dayFolder = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const fileName = `${sanitizeIdentificador(identificadorDispositivo)}.json`;
  return path.join(HISTORIAL_DIR, dayFolder, fileName);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function registrarLectura({ identificadorDispositivo, latitud, longitud, fechaHora }) {
  const now = new Date();
  const filePath = getFilePath(identificadorDispositivo, now);
  ensureDir(path.dirname(filePath));

  let contenido = {
    identificadorDispositivo,
    ubicaciones: [],
  };

  if (fs.existsSync(filePath)) {
    try {
      contenido = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      contenido = { identificadorDispositivo, ubicaciones: [] };
    }
  }

  contenido.ubicaciones.push({
    latitud,
    longitud,
    fechaHora: fechaHora ?? formatFecha(now),
  });

  fs.writeFileSync(filePath, JSON.stringify(contenido, null, 2), 'utf8');

  return filePath;
}

module.exports = {
  registrarLectura,
};
