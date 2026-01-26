import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import EnrollmentPage from './pages/EnrollmentPage';
import CopyEnrollmentPage from './pages/CopyEnrollmentPage';
import TestEnrollmentPage from './pages/TestEnrollmentPage';
import CalendarTestPage from './pages/CalendarTestPage';
import PaymentSuccess from './components/Enrollment/PaymentSuccess';
import PaymentFailure from './components/Enrollment/PaymentFailure';
import './App.css';

function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEnrollClick = () => {
    navigate('/inscripcion');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  // No mostrar header en las páginas de enrollment y pago
  const hideHeaderPaths = ['/enrollment', '/copy-enrollment', '/inscripcion', '/calendar-test', '/payment/success', '/payment/failure'];
  if (hideHeaderPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="nav-main">
      <div className="nav-container">
        <div className="nav-logo" onClick={handleLogoClick}>
          <img src="/logo-gustarte-bla.png" alt="Gustarte" className="nav-logo-img" />
        </div>

        <div className="nav-links">
          <a href="#courses" className="nav-link">
            Cursos
            <span className="nav-link-underline"></span>
          </a>
          <a href="#about" className="nav-link">
            Nosotros
            <span className="nav-link-underline"></span>
          </a>
          <a href="#gallery" className="nav-link">
            Galería
            <span className="nav-link-underline"></span>
          </a>
        </div>

        <button className="nav-cta btn-brush" onClick={handleEnrollClick}>
          Inscríbete
        </button>

        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}

function AppFooter() {
  const location = useLocation();

  // No mostrar footer en las páginas de enrollment y pago
  const hideFooterPaths = ['/enrollment', '/copy-enrollment', '/inscripcion', '/calendar-test', '/payment/success', '/payment/failure'];
  if (hideFooterPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <img src="/logo-gustarte-bla.png" alt="Gustarte" className="footer-logo-img" />
            <p className="footer-description">
              Arte para todos.
            </p>
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
          <div className="footer-section">
            <h4>Síguenos</h4>
            <div className="social-links">
              <a href="#" className="social-link">Instagram</a>
              <a href="#" className="social-link">Facebook</a>
            </div>
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
          <Route path="/inscripcion" element={<TestEnrollmentPage />} />
          <Route path="/calendar-test" element={<CalendarTestPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
        </Routes>
        <AppFooter />
      </div>
    </BrowserRouter>
  );
}

export default App;
