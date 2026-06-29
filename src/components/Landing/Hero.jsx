const COLLAGE_ITEMS = [
  { type: 'image', src: '/gus1.jpeg', alt: 'Taller de arte' },
  { type: 'image', src: '/DSC_1077.JPG', alt: 'Clase en taller' },
  { type: 'image', src: '/20250108_113538 (1).jpg', alt: 'Trabajo en taller' },
  { type: 'video', src: '/hero-video.mp4', webm: '/hero-video.webm', alt: 'Video del taller' },
  { type: 'image', src: '/DSC_1082_mirror.JPG', alt: 'Trabajo artístico' },
  { type: 'image', src: '/gus4.jpeg', alt: 'Técnicas artísticas' },
  { type: 'video', src: '/IMG_0159.mp4', webm: '/IMG_0159.webm', alt: 'Clase en vivo' },
  { type: 'image', src: '/DSC_1201.JPG', alt: 'Sesión de arte' },
];

const DISCIPLINES = ['Óleo', 'Acuarela', 'Dibujo', 'Acrílico', 'Escultura', 'Taller Infantil'];

const Hero = ({ onInscripcionClick }) => {
  const handleExplorar = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="hero-section">
      {/* Collage background */}
      <div className="hero-collage">
        {COLLAGE_ITEMS.map((item, i) => (
          <div key={i} className={`collage-item collage-item--${i}`}>
            {item.type === 'video' ? (
              <video
                className="collage-img"
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
              >
                <source src={item.webm} type="video/webm" />
                <source src={item.src} type="video/mp4" />
              </video>
            ) : (
              <img src={item.src} alt={item.alt} className="collage-img" loading={i < 4 ? 'eager' : 'lazy'} />
            )}
          </div>
        ))}
      </div>

      {/* Dark glass card */}
      <div className="hero-card">
        <span className="hero-eyebrow">Talleres presenciales · Concepción</span>

        <h1 className="hero-title">
          Un espacio donde el <span className="hero-title-accent">arte</span> se vive
        </h1>

        <p className="hero-tagline-text">
          Para adultos y jóvenes. Todos los niveles, horarios flexibles y grupos reducidos para que encuentres tu propia voz.
        </p>

        <p className="hero-disciplines">
          {DISCIPLINES.map((d, i) => (
            <span key={d}>
              <span className="hero-discipline">{d}</span>
              {i < DISCIPLINES.length - 1 && <span className="hero-discipline-sep" aria-hidden="true">·</span>}
            </span>
          ))}
        </p>

        <div className="hero-cta-row">
          <button className="hero-cta hero-cta--primary" onClick={onInscripcionClick}>
            Quiero inscribirme
          </button>
        </div>

        <button className="hero-explore" onClick={handleExplorar} aria-label="Explorar">
          <span>EXPLORAR</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Hero;
