import { useNavigate } from 'react-router-dom';
import '../components/Landing/landing.css';
import Hero from '../components/Landing/Hero';
import About from '../components/Landing/About';
import Mission from '../components/Landing/Mission';
import CoursesShowcase from '../components/Landing/CoursesShowcase';
import HorariosGrid from '../components/Landing/HorariosGrid';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleInscripcionClick = () => {
    navigate('/inscripcion');
  };

  return (
    <>
      <main>
        <Hero onInscripcionClick={handleInscripcionClick} />
        <div id="about">
          <About />
        </div>
        <div id="courses">
          <CoursesShowcase />
        </div>
        <div id="mission">
          <Mission />
        </div>
        <div id="schedule">
          <HorariosGrid />
        </div>
      </main>
    </>
  );
};

export default LandingPage;
