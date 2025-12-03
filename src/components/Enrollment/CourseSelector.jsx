import { useState, useEffect } from 'react';
import { getCourses } from '../../services/api';
import { courses as mockCourses } from '../../data/mockData';

const CourseSelector = ({ selectedCourse, onSelectCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses();

        console.log('📚 Datos crudos de la API /courses:', data);

        // Adaptar los datos de la API al formato esperado por el componente
        const adaptedCourses = data.map(course => ({
          id: course.id,
          name: course.title,
          description: course.description,
          sections: course.sections,
          // Calcular cupos totales y disponibles de todas las secciones
          maxStudents: course.sections.reduce((sum, section) => sum + section.places, 0),
          currentStudents: course.sections.reduce((sum, section) => sum + (section.places - section.available_places), 0),
          // Datos opcionales
          category: course.category || 'General',
          duration: course.duration || 'Consultar',
          instructor: course.sections[0]?.teacher_name || 'Por confirmar',
          image: course.image || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400'
        }));

        console.log('✅ Cursos adaptados para el componente:', adaptedCourses);

        setCourses(adaptedCourses);
      } catch (err) {
        console.error('Error cargando cursos, usando datos mock:', err);
        setCourses(mockCourses);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="enrollment-step">
        <h2>Paso 1: Selecciona tu Curso</h2>
        <div className="loading">Cargando cursos...</div>
      </div>
    );
  }

  return (
    <div className="enrollment-step">
      <h2>Paso 1: Selecciona tu Curso</h2>
      <p className="step-description">Elige el curso que deseas tomar</p>

      <div className="courses-selection">
        {courses.map(course => {
          const availableSlots = course.maxStudents - course.currentStudents;
          const isAvailable = availableSlots > 0;
          const isSelected = selectedCourse?.id === course.id;

          return (
            <div
              key={course.id}
              className={`course-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
              onClick={() => isAvailable && onSelectCourse(course)}
            >
              <div className="course-card-badge">{course.category}</div>

              <div className="course-card-content">
                <h3 className="course-card-title">{course.name}</h3>
                <p className="course-card-description">{course.description}</p>

                <div className="course-card-info">
                  <div className="course-info-item">
                    <svg className="course-info-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                    </svg>
                    <span>{course.duration}</span>
                  </div>
                  <div className="course-info-item">
                    <svg className="course-info-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    <span>{course.instructor}</span>
                  </div>
                </div>
              </div>

              <div className="course-card-footer">
                {isAvailable ? (
                  <div className={`course-availability ${availableSlots <= 5 ? 'limited' : 'good'}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                      <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                    </svg>
                    <span>{availableSlots} cupos disponibles</span>
                  </div>
                ) : (
                  <div className="course-availability full">
                    <span>Sin cupos disponibles</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseSelector;
