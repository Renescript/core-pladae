import { useState, useEffect } from 'react';

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
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const goToImage = (index) => {
    setCurrentImage(index);
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <p className="hero-subtitle">
            CENTRO ARTÍSTICO
          </p>
          <h1>GUSTARTE</h1>

          <p className="hero-description">
            Clases presenciales con instructores experimentados en pintura,
            dibujo y escultura. Arte al alcance de todos.
          </p>
          <button className="cta-button" onClick={onInscripcionClick}>
            Inscríbete Ahora
          </button>
        </div>

        <div className="hero-carousel">
          {images.map((image, index) => (
            <div
              key={index}
              className={`carousel-image ${index === currentImage ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}

          <button className="carousel-nav prev" onClick={prevImage}>
            ‹
          </button>
          <button className="carousel-nav next" onClick={nextImage}>
            ›
          </button>

          <div className="carousel-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentImage ? 'active' : ''}`}
                onClick={() => goToImage(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
