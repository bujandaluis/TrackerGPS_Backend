const ubicacionService = require('../services/ubicacionService');
const historialJsonService = require('../services/historialJsonService');
const { resolverRangoHistorial, TIMEZONE } = require('../utils/fechaSantiago');

function validarCoordenadas(latitud, longitud) {
  if (typeof latitud !== 'number' || Number.isNaN(latitud)) {
    return 'La latitud debe ser un número válido.';
  }

  if (typeof longitud !== 'number' || Number.isNaN(longitud)) {
    return 'La longitud debe ser un número válido.';
  }

  // if (latitud < -90 || latitud > 90) {
  //   return 'La latitud debe estar entre -90 y 90.';
  // }

  // if (longitud < -180 || longitud > 180) {
  //   return 'La longitud debe estar entre -180 y 180.';
  // }

  return null;
}

function crearUbicacion(req, res, next) {
  try {
    const { identificadorDispositivo, latitud, longitud } = req.body;

    if (!identificadorDispositivo || typeof identificadorDispositivo !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'El identificador del dispositivo es obligatorio.',
      });
    }

    const identificador = identificadorDispositivo.trim();

    if (!identificador) {
      return res.status(400).json({
        success: false,
        message: 'El identificador del dispositivo no puede estar vacío.',
      });
    }

    const errorCoordenadas = validarCoordenadas(latitud, longitud);

    if (errorCoordenadas) {
      return res.status(400).json({
        success: false,
        message: errorCoordenadas,
      });
    }

    const ubicacion = ubicacionService.guardarUbicacion({
      identificadorDispositivo: identificador,
      latitud,
      longitud,
    });

    historialJsonService.registrarLectura({
      identificadorDispositivo: ubicacion.identificadorDispositivo,
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud,
      fechaHora: ubicacion.fechaCreacion,
    });

    return res.status(201).json({
      success: true,
      data: ubicacion,
    });
  } catch (error) {
    return next(error);
  }
}

function obtenerHistorial(req, res, next) {
  try {
    if (req.query.historial !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Use historial=true y los parámetros "desde" y "hasta" con fecha y hora (YYYY-MM-DD HH:mm:ss).',
      });
    }

    const rango = resolverRangoHistorial(req.query.desde, req.query.hasta);

    if (rango.error) {
      return res.status(400).json({
        success: false,
        message: rango.error,
      });
    }

    const resultado = ubicacionService.obtenerHistorialPorRango({
      desde: rango.desde,
      hasta: rango.hasta,
    });

    if (resultado.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron registros en el rango indicado.',
      });
    }

    return res.status(200).json({
      success: true,
      data: resultado,
      filtro: {
        zonaHoraria: TIMEZONE,
        desde: rango.desde,
        hasta: rango.hasta,
      },
    });
  } catch (error) {
    return next(error);
  }
}

function obtenerUbicacion(req, res, next) {
  try {
    const identificador = req.params.identificadorDispositivo?.trim();

    if (!identificador) {
      return res.status(400).json({
        success: false,
        message: 'Debe indicar el identificador del dispositivo.',
      });
    }

    const resultado = ubicacionService.obtenerPorIdentificador(identificador);

    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron registros para el dispositivo indicado.',
      });
    }

    return res.status(200).json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  crearUbicacion,
  obtenerHistorial,
  obtenerUbicacion,
};
