// Fechas 'YYYY-MM-DD' del back como fecha local (sin corrimiento por zona horaria).
export const parseDate = (value) => {
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const longDate = (value) =>
  capitalize(parseDate(value).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }));

export const shortDate = (value) =>
  capitalize(parseDate(value).toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: '2-digit' }).replace('.', ''));

export const dayMonth = (value) =>
  parseDate(value).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
