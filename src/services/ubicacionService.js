const db = require('../config/database');
const { formatEnSantiago } = require('../utils/fechaSantiago');

const insertStmt = db.prepare(`
  INSERT INTO ubicaciones (identificador_dispositivo, latitud, longitud, fecha_creacion)
  VALUES (@identificadorDispositivo, @latitud, @longitud, @fechaCreacion)
`);

const selectLatestStmt = db.prepare(`
  SELECT
    id,
    identificador_dispositivo AS identificadorDispositivo,
    latitud,
    longitud,
    fecha_creacion AS fechaCreacion
  FROM ubicaciones
  WHERE identificador_dispositivo = ?
  ORDER BY fecha_creacion DESC, id DESC
  LIMIT 1
`);

const selectHistorialPorRangoStmt = db.prepare(`
  SELECT
    id,
    identificador_dispositivo AS identificadorDispositivo,
    latitud,
    longitud,
    fecha_creacion AS fechaCreacion
  FROM ubicaciones
  WHERE fecha_creacion >= ?
    AND fecha_creacion <= ?
  ORDER BY fecha_creacion DESC, id DESC
`);

function guardarUbicacion({ identificadorDispositivo, latitud, longitud }) {
  const fechaCreacion = formatEnSantiago();

  const result = insertStmt.run({
    identificadorDispositivo,
    latitud,
    longitud,
    fechaCreacion,
  });

  return obtenerPorId(result.lastInsertRowid);
}

function obtenerPorId(id) {
  return db
    .prepare(`
      SELECT
        id,
        identificador_dispositivo AS identificadorDispositivo,
        latitud,
        longitud,
        fecha_creacion AS fechaCreacion
      FROM ubicaciones
      WHERE id = ?
    `)
    .get(id);
}

function obtenerPorIdentificador(identificadorDispositivo) {
  return selectLatestStmt.get(identificadorDispositivo) || null;
}

function obtenerHistorialPorRango({ desde, hasta }) {
  return selectHistorialPorRangoStmt.all(desde, hasta);
}

module.exports = {
  guardarUbicacion,
  obtenerPorIdentificador,
  obtenerHistorialPorRango,
};
