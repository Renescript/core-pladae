import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createMakeup, getMakeupOptions } from '../services/api';
import { dayMonth, longDate, shortDate } from '../components/Account/dates';
import '../components/Account/account.css';

const RecuperarClasePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [choice, setChoice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    getMakeupOptions(id)
      .then(setData)
      .catch((err) => (err.status === 401 ? navigate('/mi-cuenta') : setError(err.message)));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!choice) return;
    setBusy(true);
    setError(null);
    try {
      const result = await createMakeup(id, choice.sectionId, choice.date);
      setDone(result.makeup);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (done) {
    return (
      <main className="acc-page">
        <div className="acc-card acc-done">
          <h1 className="acc-title">¡Listo!</h1>
          <p className="acc-lead">Tu recuperación quedó agendada para el <strong>{longDate(done.date).toLowerCase()}</strong>, {done.weekday} {done.schedule}. Te enviamos la confirmación por correo.</p>
          <Link to="/mi-cuenta" className="acc-btn acc-btn--block">Volver a mis clases</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="acc-page">
      <Link to="/mi-cuenta" className="acc-back">← Volver a mis clases</Link>
      <h1 className="acc-title">Recuperar clase</h1>
      {!data && !error && <p className="acc-loading">Cargando…</p>}
      {error && !data && <div className="acc-card"><p className="acc-error" role="alert">{error}</p></div>}

      {data && (
        <>
          <p className="acc-lead">
            Faltaste el <strong>{longDate(data.absence.date).toLowerCase()}</strong> a {data.absence.course}. Elige cuándo quieres recuperarla.
          </p>
          {data.makeups_allowed != null && (
            <div className="acc-usage">
              Recuperaciones usadas en este plan: <strong>{data.makeups_used} de {data.makeups_allowed}</strong>
              {data.window_end && <> · plazo hasta el {dayMonth(data.window_end)}</>}
            </div>
          )}

          {data.blocked_reason ? (
            <div className="acc-card"><p>{data.blocked_reason}</p></div>
          ) : data.options.length === 0 ? (
            <div className="acc-card">
              <p>No quedan horarios con cupo dentro del plazo. Escríbenos por WhatsApp al <a href="https://wa.me/56923718373">+56 9 2371 8373</a> y lo vemos contigo.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {data.options.map((option) => (
                <fieldset key={option.section_id} className="acc-card acc-option">
                  <legend className="acc-plan-title">{option.weekday} {option.schedule}</legend>
                  <p className="acc-plan-meta">Profe {option.teacher}{option.own ? ' · tu horario' : ''}</p>
                  <div className="acc-dates">
                    {option.dates.map((date) => {
                      const selected = choice?.sectionId === option.section_id && choice?.date === date;
                      return (
                        <label key={date} className={`acc-date ${selected ? 'is-selected' : ''}`}>
                          <input type="radio" name="choice" checked={selected}
                                 onChange={() => setChoice({ sectionId: option.section_id, date })} />
                          <span>{shortDate(date)}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              {error && <p className="acc-error" role="alert">{error}</p>}
              <button type="submit" className="acc-btn acc-btn--block" disabled={!choice || busy}>
                {busy ? 'Agendando…' : 'Agendar recuperación'}
              </button>
              <p className="acc-note">Queda agendada al tiro y te llega la confirmación por correo.</p>
            </form>
          )}
        </>
      )}
    </main>
  );
};

export default RecuperarClasePage;
