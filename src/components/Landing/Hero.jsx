import { useState, useEffect } from 'react';
import './landing.css';

const Hero = ({ onInscripcionClick }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    '/gus1.jpeg',
    '/gus3.jpeg',
    '/gus4.jpeg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="hero-section">
      {/* Background Elements */}
      <div className="hero-bg-elements">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>

        {/* Paint Stroke SVG */}
        <svg className="paint-stroke" viewBox="0 0 200 200" fill="currentColor">
          <path d="M45.7,148.6c-6.7-2.2-12.8-5.8-17.6-10.8c-15.8-16.4-12.9-42.8,5.9-56.4c16.3-11.8,38.6-13.4,57.8-8.5 c22.4,5.7,42.6,18.8,58.8,35.6c13.6,14.1,24.1,31.5,26.8,50.9c1.4,10.2-1.4,20.7-8.5,28.3c-7.6,8.1-19.1,11.7-29.9,11.8 c-21.8,0.2-43.3-6.8-61.9-17.8C66.8,175.5,55.5,163.8,45.7,148.6z" />
        </svg>
      </div>

      <div className="hero-content-grid">
        <div className="hero-text-content">
          <div className="hero-tagline">
            <span className="handwritten-text">Centro Artístico</span>
            <svg className="underline-svg" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <h1 className="hero-title">
            GUSTARTE<span className=''>.</span>
            {/*<br/> <span className="highlight-text">
              Expresa.
              <svg className="highlight-bg" viewBox="0 0 200 100" fill="currentColor">
                <path d="M10,50 Q50,5 90,50 T190,50" stroke="none" fill="currentColor" />
              </svg>
            </span> */}
          </h1>

          <p className="hero-description">
            Clases presenciales con instructores experimentados en pintura, dibujo y escultura. Arte al alcance de todos.
          </p>

          <div className="hero-buttons">
            <button className="btn-brush btn-primary-brush" onClick={onInscripcionClick}>
              Inscríbete Ahora
            </button>
            <button className="btn-outline-brush">
              Ver Galería
            </button>
          </div>
        </div>

        <div className="hero-collage">
          {/* Main Image */}
          <div className="collage-main">
            <img
              src={images[currentImage]}
              alt="Clase de arte"
              className="collage-image"
            />
            <div className="tape-strip tape-main"></div>
          </div>

          {/* Secondary Image */}
          <div className="collage-secondary">
            <img
              src={images[(currentImage + 1) % images.length]}
              alt="Manos creando"
              className="collage-image"
            />
            <div className="tape-strip tape-secondary"></div>
          </div>

          {/* Decorative Elements */}
          <div className="collage-blob"></div>
          <div className="collage-star">✦</div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
