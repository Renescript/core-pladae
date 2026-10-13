const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// "2026-10-24" sin pasar por zona horaria (new Date("2026-10-24") la corre al día anterior en Chile).
const parse = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatLongDay = (iso) => {
  const date = parse(iso);
  const text = `${DAYS[date.getDay()]} ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatChip = (iso) => {
  const date = parse(iso);
  return { day: date.getDate(), month: MONTHS_SHORT[date.getMonth()] };
};

export const formatPrice = (value) => `$${Number(value).toLocaleString('es-CL')}`;

export const placesLabel = (session) => {
  if (!session.open) return session.places && session.available_places === 0 ? 'Cupos agotados' : 'Inscripciones cerradas';
  if (session.available_places == null) return null;
  return session.available_places === 1 ? 'Queda 1 cupo' : `Quedan ${session.available_places} cupos`;
};
