import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Landing/Hero';
import CoursesShowcase from '../components/Landing/CoursesShowcase';
import About from '../components/Landing/About';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    '/gus1.jpeg',
    '/gus2.jpeg',
    '/gus3.jpeg',
    '/gus4.jpeg'
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImage(index);
  };

  const handleInscripcionClick = () => {
    navigate('/inscripcion');
  };

  return (
    <>
      <main>
        <Hero onInscripcionClick={handleInscripcionClick} />
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
