import { useState, useEffect } from 'react';
import { getCourses } from '../../services/api';

const CoursesShowcase = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mapeo de imágenes por nombre de curso
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        console.log('Cursos recibidos:', data);
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
      <section className="courses-showcase">
        <h2>Nuestros Cursos</h2>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Cargando cursos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="courses-showcase">
        <h2>Nuestros Cursos</h2>
        <div className="error-message">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="courses-showcase">
      <h2>Nuestros Cursos</h2>
      <div className="courses-grid">
        {courses.map(course => {
          // Calcular cupos disponibles desde las secciones
          const totalAvailableSlots = course.sections?.reduce((total, section) => {
            return total + (section.available_places || 0);
          }, 0) || 0;

          const totalPlaces = course.sections?.reduce((total, section) => {
            return total + (section.places || 0);
          }, 0) || 0;

          const isLimited = totalAvailableSlots <= 5 && totalAvailableSlots > 0;

          // Obtener el primer profesor de las secciones
          const instructor = course.sections?.[0]?.teacher_name || 'Por asignar';

          return (
            <div key={course.id} className="course-card">
              <div className="course-image-container">
                <img
                  src={getCourseImage(course.title)}
                  alt={course.title}
                  className="course-image"
                />
                <span className="course-category">{course.category || 'General'}</span>
              </div>
              <div className="course-info">
                <h3>{course.title}</h3>
                <p className="course-description">{course.description || 'Sin descripción disponible'}</p>
                <div className="course-meta">
                  {/* <span className="course-duration">{course.duration || '8 sesiones'}</span> */}
                  <span className="course-instructor">Prof. {instructor}</span>
                </div>
                <div className="course-availability">
                  <span className={`slots ${isLimited ? 'limited' : ''}`}>
                    {/* {totalAvailableSlots > 0
                      ? `${totalAvailableSlots} cupos disponibles`
                      : 'Sin cupos disponibles'} */}
                      8 cupos disponibles
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CoursesShowcase;
