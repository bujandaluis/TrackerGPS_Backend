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

function obtenerUbicacion(req, res, next) {
  try {
    const identificador = req.params.identificadorDispositivo?.trim();
    const historial = req.query.historial === 'true';

    if (!identificador) {
      return res.status(400).json({
        success: false,
        message: 'Debe indicar el identificador del dispositivo.',
      });
    }

    let opciones = { historial };

    if (historial) {
      const rango = resolverRangoHistorial(req.query.desde, req.query.hasta);

      if (rango.error) {
        return res.status(400).json({
          success: false,
          message: rango.error,
        });
      }

      opciones = {
        historial: true,
        desde: rango.desde,
        hasta: rango.hasta,
      };
    }

    const resultado = ubicacionService.obtenerPorIdentificador(identificador, opciones);

    if (!resultado || (Array.isArray(resultado) && resultado.length === 0)) {
      return res.status(404).json({
        success: false,
        message: historial
          ? 'No se encontraron registros para el dispositivo en el rango indicado.'
          : 'No se encontraron registros para el dispositivo indicado.',
      });
    }

    const respuesta = {
      success: true,
      data: resultado,
    };

    if (historial) {
      respuesta.filtro = {
        zonaHoraria: TIMEZONE,
        desde: opciones.desde,
        hasta: opciones.hasta,
      };
    }

    return res.status(200).json(respuesta);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  crearUbicacion,
  obtenerUbicacion,
};
