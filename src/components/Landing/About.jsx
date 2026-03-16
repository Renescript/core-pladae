const About = () => {
  return (
    <section className="about-section">
      <div className="about-card">
        <div className="about-grid">
          <div className="about-image-container">
            <img src="/DSC_1201.JPG" alt="Taller Gustarte" className="about-image" loading="lazy" />
            <div className="about-image-overlay"></div>
          </div>

          <div className="about-content">
            <p className="about-label">QUIÉNES SOMOS</p>
            <h2 className="about-title">Un espacio donde el arte se vive</h2>
            <p className="about-description">
              Gustarte es una academia de artes visuales ubicada en Concepción.
              Nuestro taller es un lugar de encuentro para quienes buscan aprender,
              experimentar y crecer a través del arte.
            </p>
            <p className="about-description">
              Ofrecemos talleres presenciales de pintura, dibujo, acuarela, óleo,
              acrílico y más. Trabajamos con grupos reducidos para entregar una
              enseñanza personalizada, adaptada al ritmo y nivel de cada alumno.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
