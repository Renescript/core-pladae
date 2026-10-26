import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSpecialSession, checkoutSpecialSession } from '../services/api';
import { formatLongDay, formatPrice, placesLabel } from '../components/SpecialSessions/format';
import '../components/Landing/landing.css';
import '../components/SpecialSessions/special-sessions.css';

// Página de una sesión especial: detalle + inscripción directa a Webpay.
const SpecialSessionPage = () => {
  const { slug } = useParams();
  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', acceptsPrivacy: false, imageConsent: false });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);

  useEffect(() => {
    getSpecialSession(slug).then(setSession).catch(e => setLoadError(e.message));
  }, [slug]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const handleCheck = (field) => (e) => setForm({ ...form, [field]: e.target.checked });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPayError(null);
    setPaying(true);
    try {
      const payment = await checkoutSpecialSession(slug, form);
      window.location.href = payment.full_url;
    } catch (error) {
      setPayError(error.message);
      setPaying(false);
    }
  };

  if (loadError) {
    return (
      <main className="ss-page">
        <div className="ss-page-container">
          <p>{loadError}</p>
          <Link to="/" className="ss-back">Volver al inicio</Link>
        </div>
      </main>
    );
  }

  if (!session) {
    return <main className="ss-page"><div className="ss-page-container"><p>Cargando…</p></div></main>;
  }

  const label = placesLabel(session);

  return (
    <main className="ss-page">
      <div className="ss-page-container">
        <Link to="/#sesiones" className="ss-back">← Sesiones especiales</Link>

        <div className="ss-detail">
          <div className="ss-detail-main">
            {session.image_url && <img src={session.image_url} alt="" className="ss-detail-image" />}
            <p className="ss-label ss-label--dark">SESIÓN ESPECIAL</p>
            <h1 className="ss-detail-title">{session.title}</h1>
            {session.description && <p className="ss-detail-text">{session.description}</p>}

            <h2 className="ss-subtitle">{session.days.length === 1 ? 'Fecha' : 'Fechas'}</h2>
            <ul className="ss-days">
              {session.days.map(day => (
                <li key={`${day.date}-${day.start_time}`}>
                  <span className="ss-day-date">{formatLongDay(day.date)}</span>
                  <span className="ss-day-time">{day.start_time} a {day.end_time} hrs.</span>
                </li>
              ))}
            </ul>
            {session.location && (
              <>
                <h2 className="ss-subtitle">Lugar</h2>
                <p className="ss-detail-text">{session.location}</p>
              </>
            )}
          </div>

          <aside className="ss-detail-aside">
            <p className="ss-aside-price">{formatPrice(session.price)}</p>
            <p className="ss-aside-note">Valor único{session.days.length > 1 ? ` por los ${session.days.length} días` : ''}.</p>
            {label && <p className={`ss-places ${session.open ? '' : 'ss-places--closed'}`}>{label}</p>}

            {session.open ? (
              <form className="ss-form" onSubmit={handleSubmit}>
                <label>Nombre y apellido<input required value={form.name} onChange={handleChange('name')} autoComplete="name" /></label>
                <label>Correo<input required type="email" value={form.email} onChange={handleChange('email')} autoComplete="email" /></label>
                <label>Teléfono<input required type="tel" value={form.phone} onChange={handleChange('phone')} autoComplete="tel" /></label>
                <label className="ss-check">
                  <input required type="checkbox" checked={form.acceptsPrivacy} onChange={handleCheck('acceptsPrivacy')} />
                  <span>Acepto la <a href="/privacidad" target="_blank" rel="noopener noreferrer">política de privacidad</a> de Gustarte.</span>
                </label>
                <label className="ss-check">
                  <input type="checkbox" checked={form.imageConsent} onChange={handleCheck('imageConsent')} />
                  <span>Autorizo a Gustarte a publicar fotos o videos de la sesión en que aparezca, en sus redes y sitio web. <em>(Opcional.)</em></span>
                </label>
                {payError && <p className="ss-error" role="alert">{payError}</p>}
                <button type="submit" className="ss-cta" disabled={paying}>
                  {paying ? 'Abriendo Webpay…' : `Pagar ${formatPrice(session.price)}`}
                </button>
                <p className="ss-aside-note">Pagas con Webpay y te llega la confirmación por correo.</p>
              </form>
            ) : (
              <p className="ss-aside-note">
                Si quieres quedar en lista de espera, escríbenos por WhatsApp al{' '}
                <a href="https://wa.me/56923718373">+56 9 2371 8373</a>.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
};

export default SpecialSessionPage;
