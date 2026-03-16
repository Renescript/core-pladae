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

const Hero = ({ onInscripcionClick }) => {
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

      {/* Card with text content */}
      <div className="hero-card">
        <p className="hero-subtitle">SOMOS <span className="hero-highlight">GUSTARTE</span></p>
        <h1 className="hero-title">ACADEMIA DE ARTE EN CONCEPCIÓN</h1>
        <p className="hero-tagline-text">Talleres presenciales para adultos y jóvenes. Todos los niveles, horarios flexibles.</p>

        <button className="hero-cta" onClick={onInscripcionClick}>
          <svg className="hero-cta-brush" viewBox="0 0 320 70" preserveAspectRatio="none" aria-hidden="true">
            <path d="M8,35 C12,18 35,8 70,12 C105,6 140,10 175,8 C210,6 250,12 280,10 C295,9 310,14 315,25 C318,32 316,42 312,48 C306,56 285,60 255,58 C220,62 180,60 145,62 C110,64 70,60 40,58 C22,56 10,52 6,45 C3,40 4,38 8,35Z" fill="var(--color-primary)" />
          </svg>
          <span className="hero-cta-text">QUIERO INSCRIBIRME</span>
        </button>
      </div>
    </header>
  );
};

export default Hero;
