import { useNavigate } from 'react-router-dom';
import Hero from '../components/Landing/Hero';
import CoursesShowcase from '../components/Landing/CoursesShowcase';
import About from '../components/Landing/About';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleEnrollClick = () => {
    navigate('/enrollment');
  };

  const handleCopyEnrollClick = () => {
    navigate('/copy-enrollment');
  };

  return (
    <>
      <main>
        <Hero onEnrollClick={handleEnrollClick} onCopyEnrollClick={handleCopyEnrollClick} />
        <div id="courses">
          <CoursesShowcase />
        </div>
        <div id="about">
          <About />
        </div>
      </main>
    </>
  );
};

export default LandingPage;
