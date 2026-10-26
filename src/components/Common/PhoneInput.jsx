import { formatPhone } from '../../utils/phone';

/**
 * Campo de teléfono: el alumno escribe como quiera y al salir del campo se muestra
 * ordenado (+56 9 1234 5678). Quien lo usa normaliza con normalizePhone() al enviar.
 */
const PhoneInput = ({ value, onChange, className, required, id, placeholder = '+56 9 1234 5678', ...rest }) => (
  <input
    {...rest}
    id={id}
    type="tel"
    inputMode="tel"
    autoComplete="tel"
    required={required}
    placeholder={placeholder}
    className={className}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    onBlur={(e) => { if (e.target.value) onChange(formatPhone(e.target.value)); }}
  />
);

export default PhoneInput;
