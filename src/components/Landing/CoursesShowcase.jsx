import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses } from '../../services/api';
const CoursesShowcase = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCourseImage = (courseTitle) => {
    const titleLower = courseTitle.toLowerCase();
    if (titleLower.includes('óleo') || titleLower.includes('oleo')) return '/oleo.jpg';
    if (titleLower.includes('acuarela')) return '/acuarela.jpg';
    if (titleLower.includes('ilustración')) return '/ilustracion.jpg';
    if (titleLower.includes('acrílico')) return '/acrilico.jpg';
    if (titleLower.includes('escultura')) return '/escultura.jpg';
    if (titleLower.includes('infantil')) return '/taller-infantil.jpg';
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

  const renderHeader = () => (
    <div className="courses-header">
      <p className="courses-label">TALLERES DISPONIBLES</p>
      <h2 className="courses-title">Nuestros Cursos</h2>
    </div>
  );

  if (loading) {
    return (
      <section className="courses-section">
        {renderHeader()}
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Cargando cursos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="courses-section">
        {renderHeader()}
        <div className="error-message">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="courses-section">
      <div className="courses-container">
        {renderHeader()}

        <div className="courses-grid">
          {courses.map((course, index) => {
            const instructor = course.sections?.[0]?.teacher_name || 'Por asignar';
            const level = getLevelBadge(index);

            return (
              <article key={course.id} className="showcase-card">
                <div className="course-image-container">
                  <img
                    src={getCourseImage(course.title)}
                    alt={course.title}
                    className="course-image"
                    loading="lazy"
                  />
                </div>
                <div className="course-content">
                  <h3 className="course-name">{course.title}</h3>
                  <p className="course-description">
                    {course.description || 'Aprende técnicas artísticas con instructores profesionales.'}
                  </p>
                  <div className="course-meta">
                    <span className="course-meta-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      {instructor}
                    </span>
                    <span className="course-meta-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      2 hrs por sesión
                    </span>
                  </div>
                  <button className="showcase-cta" onClick={() => navigate('/inscripcion')}>
                    Inscríbete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoursesShowcase;
