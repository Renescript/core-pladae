import { useState } from 'react';
import { formatPhone, isValidPhone } from '../../utils/phone';

// Deja solo números, espacios y un "+" inicial, y corta el largo: un chileno tiene
// a lo más 11 dígitos con el 56 (9 sin él); otros países, 15 (máximo de E.164).
const sanitize = (value) => {
  const raw = String(value || '');
  const plus = raw.trimStart().startsWith('+');
  const max = !plus || raw.replace(/\D/g, '').startsWith('56') ? 11 : 15;
  let count = 0;
  const body = raw.replace(/[^\d ]/g, '').replace(/\d/g, (d) => (++count <= max ? d : '')).replace(/\s+/g, ' ');
  return (plus ? '+' : '') + body.trimStart();
};

/**
 * Campo de teléfono: el alumno escribe como quiera, al salir del campo se ordena
 * (+56 9 1234 5678) y, si no es un número válido, avisa ahí mismo. Quien lo usa
 * normaliza con normalizePhone() al enviar.
 */
const PhoneInput = ({ value, onChange, className, required, id, placeholder = '+56 9 1234 5678', ...rest }) => {
  const [touched, setTouched] = useState(false);
  const invalid = touched && Boolean(value) && !isValidPhone(value);
  // Si el formulario ya marca el error (className con "error"), no se repite el mensaje.
  const parentShowsError = /\berror\b/.test(className || '');

  return (
    <>
      <input
        {...rest}
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required={required}
        placeholder={placeholder}
        className={`${className || ''}${invalid ? ' error' : ''}`.trim()}
        aria-invalid={invalid || undefined}
        value={value || ''}
        onChange={(e) => onChange(sanitize(e.target.value))}
        onBlur={(e) => {
          setTouched(true);
          if (e.target.value && isValidPhone(e.target.value)) onChange(formatPhone(e.target.value));
        }}
      />
      {invalid && !parentShowsError && <span className="error-msg phone-error">Revisa el número (ej: +56 9 1234 5678)</span>}
    </>
  );
};

export default PhoneInput;
