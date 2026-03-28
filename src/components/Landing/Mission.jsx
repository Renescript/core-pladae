const Mission = () => {
  return (
    <section className="mission-section">
      <div className="mission-card">
        <div className="mission-grid">
          <div className="mission-content">
            <p className="mission-label">NUESTRA MISIÓN</p>
            <h2 className="mission-title">Lo que nos mueve</h2>
            <p className="mission-description">
              Nuestra misión es hacer el arte accesible para todos. En Gustarte ofrecemos un espacio acogedor donde personas de todas las edades y niveles pueden explorar su creatividad con la guía de artistas profesionales.
            </p>
            <p className="mission-description">
              Creemos que el arte conecta personas y fortalece comunidades. Por eso creamos un entorno inclusivo que va más allá de enseñar técnicas: construimos un lugar de encuentro, compañía e inspiración.
            </p>
          </div>

          <div className="mission-image-container">
            <img src="/gus4.jpeg" alt="Nuestro espacio" className="mission-image" loading="lazy" />
            <div className="mission-image-overlay"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
