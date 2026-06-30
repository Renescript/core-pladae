import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getWorkshopBySlug } from '../data/workshops';
import './WorkshopPage.css';

const IconPencil = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14.5 4.5l5 5L8 21H3v-5L14.5 4.5z" />
    <path d="M13 6l5 5" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconPalette = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 2a10 10 0 0 0 0 20c1.2 0 2.2-1 2.2-2.2 0-.6-.2-1.1-.6-1.5-.4-.4-.6-.9-.6-1.5 0-1.2 1-2.2 2.2-2.2H17a5 5 0 0 0 5-5C22 6.5 17.5 2 12 2z" />
    <circle cx="6.5" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const HIGHLIGHT_ICONS = [IconPencil, IconEye, IconPalette];

const WorkshopPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const workshop = getWorkshopBySlug(slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  if (!workshop) return <Navigate to="/" replace />;

  return (
    <main className="workshop-page">
      <section className="workshop-hero">
        <div className="workshop-hero-text">
          <span className="workshop-kicker">Talleres</span>

          <h1 className="workshop-title">{workshop.name}</h1>

          <p className="workshop-tagline">{workshop.description}</p>

          <p className="workshop-professor-hero">
            <span className="workshop-professor-prefix">con</span> <strong>{workshop.professor.name}</strong>
          </p>

          <ul className="workshop-highlights">
            {workshop.highlights.map((h, i) => {
              const Icon = HIGHLIGHT_ICONS[i] || IconPalette;
              return (
                <li key={i} className="workshop-highlight">
                  <div className="workshop-highlight-icon">
                    <Icon />
                  </div>
                  <div className="workshop-highlight-content">
                    <h3 className="workshop-highlight-title">{h.title}</h3>
                    <p className="workshop-highlight-text">{h.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="workshop-cta-row">
            <button className="workshop-cta" onClick={() => navigate('/inscripcion')}>
              Inscribirme
            </button>
          </div>

          <div className="workshop-info-bar">
            <div className="workshop-info-item">
              <IconCalendar />
              <div className="workshop-info-text">
                <span className="workshop-info-label">Inicio</span>
                <span className="workshop-info-value">{workshop.startLabel}</span>
              </div>
            </div>
            <div className="workshop-info-item">
              <IconClock />
              <div className="workshop-info-text">
                <span className="workshop-info-label">Duración</span>
                <span className="workshop-info-value">{workshop.duration}</span>
              </div>
            </div>
            <div className="workshop-info-item">
              <IconUsers />
              <div className="workshop-info-text">
                <span className="workshop-info-label">Modalidad</span>
                <span className="workshop-info-value">{workshop.modality}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="workshop-reel-column">
          <div className="workshop-reel-wrapper">
            {workshop.video ? (
              <video
                className="workshop-reel"
                autoPlay
                loop
                playsInline
                controls
                preload="metadata"
                poster={workshop.fallbackImage}
              >
                <source src={workshop.video.webm} type="video/webm" />
                <source src={workshop.video.mp4} type="video/mp4" />
              </video>
            ) : (
              <img
                className="workshop-reel"
                src={workshop.fallbackImage}
                alt={workshop.name}
              />
            )}

            <div className="workshop-reel-sticker">
              <IconUsers />
              <span>
                Clases<br />presenciales
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="workshop-meta">
        <div className="workshop-meta-card">
          <h3 className="workshop-meta-title">Profesor/a</h3>
          <p className="workshop-meta-name">{workshop.professor.name}</p>
          <p className="workshop-meta-text">{workshop.professor.bio}</p>
        </div>

        <div className="workshop-meta-card">
          <h3 className="workshop-meta-title">Horarios</h3>
          <ul className="workshop-schedule">
            {workshop.schedule.map((s, i) => (
              <li key={i}>
                <strong>{s.day}</strong> · {s.time}
              </li>
            ))}
          </ul>
        </div>

        <div className="workshop-meta-card workshop-meta-card--price">
          <button
            className="workshop-cta workshop-cta--secondary"
            onClick={() => navigate('/inscripcion')}
          >
            Inscribirme
          </button>
        </div>
      </section>
    </main>
  );
};

export default WorkshopPage;
