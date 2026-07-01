const TIMEZONE = 'America/Santiago';
const FECHA_HORA_REGEX = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

function formatEnSantiago(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

function obtenerFechaSantiago(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function obtenerRangoDiaActualSantiago() {
  const fecha = obtenerFechaSantiago();

  return {
    desde: `${fecha} 00:00:00`,
    hasta: `${fecha} 23:59:59`,
  };
}

function normalizarFechaHora(valor, { finDeDia = false } = {}) {
  if (!valor || typeof valor !== 'string') {
    return null;
  }

  const texto = decodeURIComponent(valor.trim().replace(/\+/g, ' '));
  const coincidencia = texto.match(FECHA_HORA_REGEX);

  if (!coincidencia) {
    return null;
  }

  const [, year, month, day, hours, minutes, seconds] = coincidencia;
  const mes = Number(month);
  const dia = Number(day);

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
    return null;
  }

  let hora;
  let minuto;
  let segundo;

  if (hours !== undefined) {
    hora = hours.padStart(2, '0');
    minuto = minutes.padStart(2, '0');
    segundo = (seconds ?? '00').padStart(2, '0');

    if (Number(hora) > 23 || Number(minuto) > 59 || Number(segundo) > 59) {
      return null;
    }
  } else if (finDeDia) {
    hora = '23';
    minuto = '59';
    segundo = '59';
  } else {
    hora = '00';
    minuto = '00';
    segundo = '00';
  }

  return `${year}-${month}-${day} ${hora}:${minuto}:${segundo}`;
}

function resolverRangoHistorial(desde, hasta) {
  const desdeTexto = typeof desde === 'string' ? desde.trim() : '';
  const hastaTexto = typeof hasta === 'string' ? hasta.trim() : '';

  if (!desdeTexto && !hastaTexto) {
    return {
      ...obtenerRangoDiaActualSantiago(),
      rangoPorDefecto: true,
    };
  }

  if (!desdeTexto || !hastaTexto) {
    return {
      error: 'Debe enviar ambos parámetros "desde" y "hasta", o ninguno para usar el día actual.',
    };
  }

  const desdeNormalizado = normalizarFechaHora(desdeTexto);
  const hastaNormalizado = normalizarFechaHora(hastaTexto, { finDeDia: !/\d{2}:\d{2}/.test(hastaTexto) });

  if (!desdeNormalizado || !hastaNormalizado) {
    return {
      error: 'Formato inválido. Use YYYY-MM-DD HH:mm:ss en zona horaria America/Santiago.',
    };
  }

  if (desdeNormalizado > hastaNormalizado) {
    return {
      error: 'El parámetro "desde" no puede ser mayor que "hasta".',
    };
  }

  return {
    desde: desdeNormalizado,
    hasta: hastaNormalizado,
    rangoPorDefecto: false,
  };
}

module.exports = {
  TIMEZONE,
  formatEnSantiago,
  obtenerRangoDiaActualSantiago,
  resolverRangoHistorial,
};
