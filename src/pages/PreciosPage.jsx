import { useEffect } from 'react';
import '../components/Landing/landing.css';
import Membership from '../components/Landing/Membership';
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
          Planes mensuales con descuento por permanencia. Consulta también nuestra membresía anual
          con acceso a taller abierto y beneficios exclusivos.
        </p>
      </header>
      <Membership />
    </main>
  );
};

export default PreciosPage;
