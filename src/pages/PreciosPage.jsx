import { useEffect } from 'react';
import '../components/Landing/landing.css';
import WorkshopPricing from '../components/Landing/WorkshopPricing';
import './SimplePage.css';

const PreciosPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <main className="simple-page">
      <header className="simple-page-header">
        <p className="simple-page-kicker">Talleres</p>
        <h1 className="simple-page-title">Precios de talleres</h1>
        <p className="simple-page-intro">
          Planes mensuales con descuento por permanencia. Puedes empezar con una clase de prueba
          y luego decidir el ritmo que más te acomode.
        </p>
      </header>
      <WorkshopPricing showHeader={false} />
    </main>
  );
};

export default PreciosPage;
