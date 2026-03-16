const Mission = () => {
  return (
    <section className="mission-section">
      <div className="mission-card">
        <div className="mission-grid">
          <div className="mission-content">
            <p className="mission-label">NUESTRA MISIÓN</p>
            <h2 className="mission-title">Lo que nos mueve</h2>
            <p className="mission-description">
              En el Centro Artístico Gustarte, nuestra misión es democratizar el acceso al arte y cultivar un espacio donde la creatividad florezca sin barreras. Estamos comprometidos con impulsar el arte en nuestra comunidad, ofreciendo un entorno acogedor y profesional que invite a personas de todas las edades y habilidades a explorar y desarrollar sus capacidades artísticas.
            </p>
            <p className="mission-description">
              Creemos firmemente que el arte es una herramienta poderosa para la conexión y el entendimiento mutuo. Por ello, nuestro taller proporciona no solo instrucción de alta calidad por parte de artistas profesionales, sino también un espacio de compañía y apoyo donde cada miembro puede sentirse valorado e inspirado.
            </p>
            <p className="mission-description">
              Nos esforzamos por hacer del arte algo accesible para todos, eliminando las barreras económicas y culturales que a menudo limitan la participación. A través de una variedad de programas, desde clases introductorias hasta talleres avanzados, buscamos fomentar un entorno inclusivo que refleje y enriquezca la diversidad de nuestra comunidad.
            </p>
            <p className="mission-description">
              En Centro Artístico Gustarte, no solo enseñamos técnicas artísticas; creamos un tejido comunitario más fuerte, enriquecido por la expresión y la creatividad de sus miembros. Unimos a las personas a través del arte, porque creemos que un mundo más creativo es un mundo mejor.
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
