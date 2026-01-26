import { useNavigate } from 'react-router-dom';
import Hero from '../components/Landing/Hero';
import About from '../components/Landing/About';
import Mission from '../components/Landing/Mission';
import CoursesShowcase from '../components/Landing/CoursesShowcase';
import Membership from '../components/Landing/Membership';

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
        <div id="mission">
          <Mission />
        </div>
        <div id="courses">
          <CoursesShowcase />
        </div>
        <Membership />
      </main>
    </>
  );
};

export default LandingPage;
