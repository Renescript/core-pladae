import './landing.css';

const Membership = () => {
  return (
    <section className="membership-section">
      <div className="membership-card">
        <div className="membership-grid">
          <div className="membership-content">
            <span className="handwritten-text">Únete a la familia</span>
            <h2 className="membership-title">Hazte Miembro</h2>
            <p className="membership-description">
              Obtén acceso 24/7 al estudio, descuentos en talleres y un casillero para tus materiales. Pero sobre todo, consigue una comunidad que apoya tu camino creativo.
            </p>

            <ul className="membership-features">
              <li>
                <svg className="feature-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span>Acceso ilimitado al taller abierto</span>
              </li>
              <li>
                <svg className="feature-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span>15% de descuento en todas las clases</span>
              </li>
              <li>
                <svg className="feature-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span>Exposición mensual de miembros</span>
              </li>
            </ul>

            <button className="btn-brush btn-membership">
              Solicitar Membresía
            </button>
          </div>

          <div className="membership-image-container">
            <img
              src="/gus1.jpeg"
              alt="Espacio del estudio"
              className="membership-image"
            />
            <div className="membership-image-overlay"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Membership;
