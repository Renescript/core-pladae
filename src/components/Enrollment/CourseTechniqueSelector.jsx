import { useState, useEffect } from 'react';
import { getCoursesSchedulesGrid } from '../../services/api';
import './CourseTechniqueSelector.css';

const CourseTechniqueSelector = ({ selectedCourses = [], onSelectCourses, onContinue, maxCourses = 5 }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await getCoursesSchedulesGrid();
        console.log('📚 Cursos/Técnicas cargados:', coursesData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
        alert('Hubo un error al cargar las técnicas disponibles.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleCourseToggle = (course) => {
    const isSelected = selectedCourses.some(c => c.id === course.id);

    if (isSelected) {
      // Deseleccionar
      const newCourses = selectedCourses.filter(c => c.id !== course.id);
      onSelectCourses(newCourses);
    } else {
      // Validar límite
      if (selectedCourses.length >= maxCourses) {
        alert(`⚠️ Puedes seleccionar máximo ${maxCourses} técnicas.`);
        return;
      }
      // Agregar
      const newCourses = [...selectedCourses, course];
      onSelectCourses(newCourses);
    }
  };

  if (loading) {
    return (
      <div className="enrollment-step">
        <h2>Paso 2: Selecciona tu Técnica</h2>
        <div className="loading">Cargando técnicas disponibles...</div>
      </div>
    );
  }

  return (
    <div className="enrollment-step">
      <h2>Paso 1: Selecciona tus Técnicas</h2>
      <p className="step-description">
        Elige las técnicas que deseas aprender. Puedes seleccionar hasta {maxCourses} técnicas. En el siguiente paso podrás seleccionar los horarios que mejor se ajusten a tu disponibilidad.
        {selectedCourses.length > 0 && (
          <span className="selection-counter">
            {' '}({selectedCourses.length}/{maxCourses} seleccionadas)
          </span>
        )}
      </p>

      <div className="techniques-grid">
        {courses.map(course => {
          const isSelected = selectedCourses.some(c => c.id === course.id);
          return (
            <div
              key={course.id}
              className={`technique-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleCourseToggle(course)}
            >
              <div className="technique-color-bar" style={{ backgroundColor: course.color }}></div>

              <div className="technique-content">
                <h3 className="technique-name">{course.name}</h3>

                <div className="technique-info">
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <span className="info-text">
                      {course.schedules.length} horario{course.schedules.length > 1 ? 's' : ''} disponible{course.schedules.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="selected-badge">
                  <span className="check-icon">✓</span>
                  Seleccionado
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="step-actions">
        <button
          className="btn-primary"
          onClick={onContinue}
          disabled={selectedCourses.length === 0}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
};

export default CourseTechniqueSelector;
