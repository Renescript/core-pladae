import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSpecialSessions } from '../../services/api';
import { formatChip, formatPrice, placesLabel } from './format';
import './special-sessions.css';

// Sección de la landing con las próximas sesiones especiales. Si no hay ninguna
// publicada, no se muestra nada.
const SpecialSessionsSection = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    getSpecialSessions().then(setSessions).catch(() => setSessions([]));
  }, []);

  if (sessions.length === 0) return null;

  return (
    <section className="ss-section" id="sesiones">
      <div className="ss-container">
        <p className="ss-label">SESIONES ESPECIALES</p>
        <h2 className="ss-title">Talleres con fecha</h2>
        <p className="ss-intro">Sesiones de uno o varios días, con fechas fijas y un solo valor. No necesitas estar inscrito en un curso.</p>

        <div className="ss-grid">
          {sessions.map(session => {
            const label = placesLabel(session);
            return (
              <article key={session.slug} className="ss-card">
                {session.image_url && <img src={session.image_url} alt="" className="ss-card-image" loading="lazy" />}
                <div className="ss-card-body">
                  <div className="ss-chips">
                    {session.days.map(day => {
                      const chip = formatChip(day.date);
                      return (
                        <span key={`${day.date}-${day.start_time}`} className="ss-chip">
                          <strong>{chip.day}</strong>{chip.month}
                        </span>
                      );
                    })}
                  </div>
                  <h3 className="ss-card-title">{session.title}</h3>
                  {session.description && <p className="ss-card-text">{session.description}</p>}
                  <div className="ss-card-footer">
                    <span className="ss-price">{formatPrice(session.price)}</span>
                    {label && <span className={`ss-places ${session.open ? '' : 'ss-places--closed'}`}>{label}</span>}
                  </div>
                  <button className="ss-cta" onClick={() => navigate(`/sesiones/${session.slug}`)}>
                    {session.open ? 'Ver e inscribirme' : 'Ver detalle'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SpecialSessionsSection;
