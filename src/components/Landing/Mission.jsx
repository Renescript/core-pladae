import './landing.css';

const Mission = () => {
  return (
    <section className="mission-section">
      <div className="mission-container">
        <div className="mission-header">
          <span className="handwritten-text handwritten-blue">Lo que nos mueve</span>
          <h2 className="mission-title">Nuestra Misión</h2>
        </div>

        <div className="mission-content">
          <div className="mission-text">
            <p>
              En el Centro Artístico Gustarte, nuestra misión es democratizar el acceso al arte y cultivar un espacio donde la creatividad florezca sin barreras. Estamos comprometidos con impulsar el arte en nuestra comunidad, ofreciendo un entorno acogedor y profesional que invite a personas de todas las edades y habilidades a explorar y desarrollar sus capacidades artísticas.
            </p>
            <p>
              Creemos firmemente que el arte es una herramienta poderosa para la conexión y el entendimiento mutuo. Por ello, nuestro taller proporciona no solo instrucción de alta calidad por parte de artistas profesionales, sino también un espacio de compañía y apoyo donde cada miembro puede sentirse valorado e inspirado.
            </p>
            <p>
              Nos esforzamos por hacer del arte algo accesible para todos, eliminando las barreras económicas y culturales que a menudo limitan la participación. A través de una variedad de programas, desde clases introductorias hasta talleres avanzados, buscamos fomentar un entorno inclusivo que refleje y enriquezca la diversidad de nuestra comunidad.
            </p>
            <p>
              En Centro Artístico Gustarte, no solo enseñamos técnicas artísticas; creamos un tejido comunitario más fuerte, enriquecido por la expresión y la creatividad de sus miembros. Unimos a las personas a través del arte, porque creemos que un mundo más creativo es un mundo mejor.
            </p>
          </div>

          <div className="mission-visual">
            <div className="mission-image-wrapper">
              <img src="/gus4.jpeg" alt="Nuestro espacio" className="mission-image" />
              <div className="tape-strip tape-mission"></div>
            </div>
            <div className="mission-decorative">
              <svg className="mission-paint-splash" viewBox="0 0 200 200" fill="currentColor">
                <path d="M41.3,144.8c-12.6-18.4-13.6-45.9-0.6-64.8c12.1-17.6,36.8-21.6,56.8-16.6c22.4,5.6,42.6,21.8,52.8,42.6 c9.6,19.6,8.6,44.8-5.6,60.6c-13.6,15.1-36.6,19.6-56.6,16.6C66.3,180.1,49.3,156.4,41.3,144.8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
