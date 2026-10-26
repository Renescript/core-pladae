// Teléfonos en formato E.164 (convención de los forms ADL), con Chile por defecto.
// Sin librería: Gustarte es local y casi todos los números son chilenos; si alguien
// escribe otro país con "+", se respeta tal cual.
//   "9 1234 5678" / "912345678" / "56912345678" / "+56 9 1234 5678" → "+56912345678"
//   "+54 9 11 1234 5678" → "+5491112345678"

const digits = (value) => String(value || '').replace(/\D/g, '');

/** E.164 ("+56912345678") o null si no parece un teléfono válido. */
export const normalizePhone = (value) => {
  const raw = String(value || '').trim();
  const d = digits(raw);
  if (!d) return null;
  if (raw.startsWith('+') && !d.startsWith('56')) return d.length >= 8 && d.length <= 15 ? `+${d}` : null;
  const local = d.startsWith('56') && d.length === 11 ? d.slice(2) : d;
  if (local.length === 8) return `+569${local}`; // celular escrito sin el 9 inicial (formato antiguo)
  if (local.length === 9) return `+56${local}`;
  return null;
};

/** Para mostrar: "+56 9 1234 5678" (chilenos) o el E.164 tal cual. */
export const formatPhone = (value) => {
  const e164 = normalizePhone(value);
  if (!e164) return String(value || '');
  if (!e164.startsWith('+56')) return e164;
  const n = e164.slice(3);
  if (n.startsWith('9') || n.startsWith('2')) return `+56 ${n[0]} ${n.slice(1, 5)} ${n.slice(5)}`; // celular o Santiago
  return `+56 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`; // fijo de regiones (ej: Concepción 41)
};

export const isValidPhone = (value) => normalizePhone(value) !== null;
