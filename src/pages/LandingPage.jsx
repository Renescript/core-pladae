import { useNavigate } from 'react-router-dom';
import '../components/Landing/landing.css';
import Hero from '../components/Landing/Hero';
import About from '../components/Landing/About';
import Mission from '../components/Landing/Mission';
import CoursesShowcase from '../components/Landing/CoursesShowcase';
import Schedule from '../components/Landing/Schedule';
import Reveal from '../components/Reveal';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleInscripcionClick = () => {
    navigate('/inscripcion');
  };

  return (
    <>
      <main>
        <Hero onInscripcionClick={handleInscripcionClick} />
        <Reveal as="div" id="about">
          <About />
        </Reveal>
        <Reveal as="div" id="courses">
          <CoursesShowcase />
        </Reveal>
        <Reveal as="div" id="mission">
          <Mission />
        </Reveal>
        <Reveal as="div" id="schedule">
          <Schedule />
        </Reveal>
      </main>
    </>
  );
};

export default LandingPage;
