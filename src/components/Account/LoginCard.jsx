import { useState } from 'react';
import { requestLoginLink } from '../../services/api';
import GoogleButton from './GoogleButton';

const LOGIN_ERRORS = {
  no_student: 'No encontramos una inscripción con esa cuenta de Google. Entra con el correo con que te inscribiste o pide un link por correo.',
  google: 'No pudimos entrar con Google. Intenta de nuevo o pide un link por correo.',
  link: 'Ese link venció o ya se usó. Pide uno nuevo abajo.'
};

const LoginCard = ({ loginError }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await requestLoginLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="acc-card acc-login">
        <h1 className="acc-title">Revisa tu correo</h1>
        <p className="acc-lead">
          Si <strong>{email}</strong> tiene una inscripción en Gustarte, te llegará un link para entrar.
          Sirve una vez y vence en 30 minutos.
        </p>
        <button type="button" className="acc-btn acc-btn--ghost" onClick={() => setSent(false)}>Usar otro correo</button>
      </div>
    );
  }

  return (
    <div className="acc-card acc-login">
      <h1 className="acc-title">Mi cuenta</h1>
      <p className="acc-lead">Revisa tus clases, agenda tus recuperaciones y mira tu historial.</p>

      {loginError && <p className="acc-error" role="alert">{LOGIN_ERRORS[loginError] || LOGIN_ERRORS.google}</p>}

      <GoogleButton />

      <div className="acc-divider">o recibe un link en tu correo</div>

      <form onSubmit={handleSubmit}>
        <label className="acc-field">
          Correo con que te inscribiste
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {error && <p className="acc-error" role="alert">{error}</p>}
        <button type="submit" className="acc-btn acc-btn--block" disabled={busy}>
          {busy ? 'Enviando…' : 'Enviarme el link'}
        </button>
      </form>
      <p className="acc-note">
        ¿Todavía no eres alumno? <a href="/inscripcion">Inscríbete aquí</a>: tu cuenta se crea sola al pagar.
      </p>
    </div>
  );
};

export default LoginCard;
