import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getWorkshopBySlug } from '../data/workshops';
import Reveal from '../components/Reveal';
import '../components/Landing/landing.css';
import './WorkshopPage.css';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

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
      {/* HERO */}
      <header className="workshop-hero">
        <div className="workshop-hero-media">
          {workshop.video ? (
            <video
              className="workshop-hero-video"
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              poster={workshop.fallbackImage}
            >
              <source src={workshop.video.webm} type="video/webm" />
              <source src={workshop.video.mp4} type="video/mp4" />
            </video>
          ) : (
            <img className="workshop-hero-video" src={workshop.fallbackImage} alt={workshop.name} />
          )}
          <div className="workshop-hero-overlay" />
        </div>

        <div className="workshop-hero-content">
          <span className="workshop-eyebrow">Taller · {workshop.category}</span>
          <h1 className="workshop-title">{workshop.name}</h1>
          <p className="workshop-tagline">{workshop.tagline}</p>
        </div>
      </header>

      {/* DESCRIPCIÓN + QUÉ APRENDERÁS */}
      <Reveal as="section" className="workshop-section workshop-section--alt">
        <div className="workshop-container workshop-two-col">
          <div className="workshop-col">
            <h2 className="workshop-section-title">Sobre el taller</h2>
            <p className="workshop-description">{workshop.description}</p>
          </div>
          <div className="workshop-col">
            <h3 className="workshop-section-subtitle">Qué aprenderás</h3>
            <ul className="workshop-learnings">
              {workshop.learnings.map((item) => (
                <li key={item} className="workshop-learning">
                  <span className="workshop-learning-bullet" aria-hidden="true">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      {/* PROFESOR/A */}
      <Reveal as="section" className="workshop-section">
        <div className="workshop-container">
          <div className="workshop-professor">
            <div className="workshop-professor-photo" aria-hidden="true">
              {workshop.professor.photo ? (
                <img src={workshop.professor.photo} alt={workshop.professor.name} />
              ) : (
                <span className="workshop-professor-initial">
                  {workshop.professor.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </span>
              )}
            </div>
            <div className="workshop-professor-text">
              <span className="workshop-eyebrow workshop-eyebrow--light">Profesor/a</span>
              <h2 className="workshop-professor-name">{workshop.professor.name}</h2>
              <p className="workshop-professor-bio">{workshop.professor.bio}</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* HORARIOS + PRECIO + CTA */}
      <Reveal as="section" className="workshop-section workshop-section--alt">
        <div className="workshop-container">
          <h2 className="workshop-section-title workshop-section-title--center">Horarios y matrícula</h2>

          <div className="workshop-schedule">
            {workshop.schedule.map((s, i) => (
              <div key={i} className="workshop-schedule-row">
                <span className="workshop-schedule-day">{s.day}</span>
                <span className="workshop-schedule-time">{s.time}</span>
              </div>
            ))}
          </div>

          <div className="workshop-price-row">
            <div className="workshop-price">
              <span className="workshop-price-label">Mensualidad</span>
              <span className="workshop-price-amount">{formatCLP(workshop.priceMonthly)}</span>
            </div>
            <button className="workshop-cta" onClick={() => navigate('/inscripcion')}>
              Quiero inscribirme
            </button>
          </div>
        </div>
      </Reveal>
    </main>
  );
};

export default WorkshopPage;
