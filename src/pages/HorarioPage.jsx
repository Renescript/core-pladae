import { useEffect } from 'react';
import '../components/Landing/landing.css';
import HorariosGrid from '../components/Landing/HorariosGrid';

const HorarioPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <main>
      <HorariosGrid />
    </main>
  );
};

export default HorarioPage;
