import './landing.css';

const About = () => {
  return (
    <section className="about-section">
      <div className="about-gradient-top"></div>

      <div className="about-content-wrapper">
        <div className="quote-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
          </svg>
        </div>

        <h2 className="about-quote">
          Creemos que el arte no se trata de <span className="italic accent-text">perfección</span>. <br/>
          Se trata de <span className="connection-text">
            conexión
            <svg className="connection-underline" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </span>.
        </h2>

        <p className="about-text">
          Gustarte es un espacio donde el aroma del café fresco se mezcla con el de la trementina y la arcilla húmeda. Somos un refugio para los soñadores, los que exploran y los profundamente dedicados. Sin juicios, solo expresión.
        </p>

        <div className="about-stats">
          <div className="stat-item">
            <span className="stat-number stat-primary">500+</span>
            <span className="stat-label">Artistas Locales</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number stat-accent">Diario</span>
            <span className="stat-label">Taller Abierto</span>
          </div>
          <div className="stat-divider stat-divider-reverse"></div>
          <div className="stat-item">
            <span className="stat-number stat-ochre">∞</span>
            <span className="stat-label">Inspiración</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
