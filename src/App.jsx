import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EnrollmentPage from './pages/EnrollmentPage';
import CopyEnrollmentPage from './pages/CopyEnrollmentPage';
import TestEnrollmentPage from './pages/TestEnrollmentPage';
import './App.css';

function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleEnrollClick = () => {
    navigate('/enrollment');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  // No mostrar header en las páginas de enrollment
  if (location.pathname === '/enrollment' || location.pathname === '/copy-enrollment' || location.pathname === '/test-enrollment') {
    return null;
  }

  return (
    <header className="app-header">
      <div className="container">
        <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src='/public/file.enc' alt="GUSTARTE" />
        </div>
        <nav>
          <a href="#courses">Cursos</a>
          <a href="#about">Nosotros</a>
          <button className="enroll-button" onClick={handleEnrollClick}>
            Inscríbete
          </button>
        </nav>
      </div>
    </header>
  );
}

function AppFooter() {
  const location = useLocation();

  // No mostrar footer en las páginas de enrollment
  if (location.pathname === '/enrollment' || location.pathname === '/copy-enrollment' || location.pathname === '/test-enrollment') {
    return null;
  }

  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>GUSTARTE</h3>
            <p>Centro Artístico</p>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>contacto@gustarte.cl</p>
            <p>+56 9 1234 5678</p>
          </div>
          <div className="footer-section">
            <h4>Horarios</h4>
            <p>Lun - Vie: 9:00 - 21:00</p>
            <p>Sáb: 9:00 - 14:00</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 GUSTARTE. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <AppHeader />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/enrollment" element={<EnrollmentPage />} />
          <Route path="/copy-enrollment" element={<CopyEnrollmentPage />} />
          <Route path="/test-enrollment" element={<TestEnrollmentPage />} />
        </Routes>
        <AppFooter />
      </div>
    </BrowserRouter>
  );
}

export default App;
