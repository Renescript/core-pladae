import { useState, useEffect } from 'react';
import { getCourses } from '../../services/api';
import './landing.css';

const CoursesShowcase = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCourseImage = (courseTitle) => {
    const titleLower = courseTitle.toLowerCase();
    if (titleLower.includes('óleo') || titleLower.includes('oleo')) {
      return '/oleo.png';
    }
    if (titleLower.includes('acuarela')) {
      return '/acuarela.png';
    }
    if (titleLower.includes('ilustración')) {
      return '/ilustracion.png';
    }
    if (titleLower.includes('acrílico')) {
      return '/acrilico.png';
    }
    if (titleLower.includes('escultura')) {
      return '/escultura.png';
    }
    if (titleLower.includes('infantil')) {
      return '/taller-infantil.png';
    }
    return '/placeholder-course.jpg';
  };

  const getLevelBadge = (index) => {
    const levels = [
      { text: 'Principiante', color: 'badge-ochre' },
      { text: 'Todos los niveles', color: 'badge-primary' },
      { text: 'Intermedio', color: 'badge-accent' },
      { text: 'Avanzado', color: 'badge-primary' }
    ];
    return levels[index % levels.length];
  };

  const getRotation = (index) => {
    const rotations = ['rotate-neg-1', 'rotate-1', 'rotate-neg-2', 'rotate-1'];
    return rotations[index % rotations.length];
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        setCourses(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar cursos:', err);
        setError('No se pudieron cargar los cursos');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <section className="workshops-section">
        <div className="workshops-header">
          <div>
            <span className="handwritten-text handwritten-blue">Ensucia tus manos</span>
            <h2 className="workshops-title">Próximos Talleres</h2>
          </div>
        </div>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Cargando cursos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="workshops-section">
        <div className="workshops-header">
          <div>
            <span className="handwritten-text handwritten-blue">Ensucia tus manos</span>
            <h2 className="workshops-title">Próximos Talleres</h2>
          </div>
        </div>
        <div className="error-message">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="workshops-section">
      {/* Paint Splash Background */}
      <div className="workshops-bg">
        <svg className="paint-splash" viewBox="0 0 200 200" fill="currentColor">
          <path d="M41.3,144.8c-12.6-18.4-13.6-45.9-0.6-64.8c12.1-17.6,36.8-21.6,56.8-16.6c22.4,5.6,42.6,21.8,52.8,42.6 c9.6,19.6,8.6,44.8-5.6,60.6c-13.6,15.1-36.6,19.6-56.6,16.6C66.3,180.1,49.3,156.4,41.3,144.8z" />
        </svg>
      </div>

      <div className="workshops-container">
        <div className="workshops-header">
          <div>
            <span className="handwritten-text handwritten-blue">Ensucia tus manos</span>
            <h2 className="workshops-title">Próximos Talleres</h2>
          </div>
          <a href="#" className="view-all-link">
            Ver Calendario Completo
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="workshops-scroll">
          {courses.map((course, index) => {
            const instructor = course.sections?.[0]?.teacher_name || 'Por asignar';
            const level = getLevelBadge(index);
            const rotation = getRotation(index);

            return (
              <article key={course.id} className={`workshop-card ${rotation}`}>
                <div className="workshop-image-container">
                  <img
                    src={getCourseImage(course.title)}
                    alt={course.title}
                    className="workshop-image"
                  />
                  <span className={`workshop-badge ${level.color}`}>{level.text}</span>
                </div>
                <div className="workshop-content">
                  <div className="workshop-header">
                    <h3 className="workshop-title">{course.title}</h3>
                    <span className="workshop-price">$45.000</span>
                  </div>
                  <p className="workshop-description">
                    {course.description || 'Aprende técnicas artísticas con instructores profesionales.'}
                  </p>
                  <div className="workshop-meta">
                    <span className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Próximamente
                    </span>
                    <span className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      2 hrs
                    </span>
                  </div>
                </div>
                <div className="tape-strip tape-card"></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoursesShowcase;
