import './Location.css';

const MAPS_QUERY = 'Av+Chacabuco+960+Concepcion+Chile';
const EMBED_SRC = `https://maps.google.com/maps?q=${MAPS_QUERY}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
const OPEN_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;

const IconPin = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const Location = () => {
  return (
    <section className="location-section" id="ubicacion">
      <div className="location-container">
        <div className="location-info">
          <p className="location-kicker">Cómo llegar</p>
          <h2 className="location-title">Encuéntranos en Concepción</h2>

          <div className="location-item">
            <IconPin />
            <div>
              <p className="location-item-title">Av. Chacabuco 960</p>
              <p className="location-item-sub">Depto 301 — 3er piso · Tocar citófono</p>
            </div>
          </div>

          <div className="location-item">
            <IconPhone />
            <div>
              <p className="location-item-title">+56 9 2371 8373</p>
              <p className="location-item-sub">WhatsApp y llamadas</p>
            </div>
          </div>

          <div className="location-item">
            <IconClock />
            <div>
              <p className="location-item-title">Horario de atención</p>
              <p className="location-item-sub">Lun a Vie 9:00–21:00 · Sáb 9:00–14:00</p>
            </div>
          </div>

          <a
            className="location-cta"
            href={OPEN_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir en Google Maps
          </a>
        </div>

        <div className="location-map">
          <iframe
            title="Mapa Gustarte — Av. Chacabuco 960, Concepción"
            src={EMBED_SRC}
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
};

export default Location;
