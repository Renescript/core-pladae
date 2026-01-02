import { useState, useEffect } from 'react';
import { getCoursesSchedulesGrid } from '../../services/api';
import './SimplifiedTechniqueSelector.css';

// Componente para el calendario de horarios
const CalendarGrid = ({ techniques, showCalendar, setShowCalendar }) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Extraer todos los horarios únicos
  const allTimeSlots = new Set();
  techniques.forEach(technique => {
    technique.schedules?.forEach(schedule => {
      allTimeSlots.add(schedule.timeSlot);
    });
  });
  const timeSlots = Array.from(allTimeSlots).sort();

  // Organizar cursos por día y horario
  const getCoursesForSlot = (day, timeSlot) => {
    const courses = [];
    techniques.forEach(technique => {
      technique.schedules?.forEach(schedule => {
        if (schedule.day === day && schedule.timeSlot === timeSlot) {
          courses.push({
            name: technique.name,
            color: technique.color,
            teacher: schedule.teacher,
            available: schedule.available,
            places: schedule.places
          });
        }
      });
    });
    return courses;
  };

  return (
    <div className="calendar-section">
      <button
        className="calendar-toggle"
        onClick={() => setShowCalendar(!showCalendar)}
        type="button"
      >
        <span>📅 Ver horarios disponibles por técnica</span>
        <span className={`toggle-icon ${showCalendar ? 'open' : ''}`}>▼</span>
      </button>

      {showCalendar && (
        <div className="calendar-content">
          <p className="calendar-note">
            Visualiza todos los cursos disponibles organizados por día y horario
          </p>

          <div className="calendar-grid">
            {/* Header con días de la semana */}
            <div className="calendar-header">
              <div className="time-column"></div>
              {dayLabels.map((label, index) => (
                <div key={index} className="day-header">{label}</div>
              ))}
            </div>

            {/* Filas de horarios */}
            {timeSlots.map((timeSlot, rowIndex) => (
              <div key={rowIndex} className="calendar-row">
                <div className="time-cell">{timeSlot}</div>
                {days.map((day, dayIndex) => {
                  const courses = getCoursesForSlot(day, timeSlot);

                  if (courses.length === 0) {
                    return (
                      <div key={dayIndex} className="slot-cell empty">
                        -
                      </div>
                    );
                  }

                  const courseCountClass =
                    courses.length === 1 ? 'one-course' :
                    courses.length === 2 ? 'two-courses' : '';

                  return (
                    <div
                      key={dayIndex}
                      className={`slot-cell multi-course ${courseCountClass}`}
                    >
                      {courses.map((course, idx) => {
                        const availability = course.available / course.places;
                        const statusClass =
                          availability === 0 ? 'unavailable' :
                          availability < 0.3 ? 'limited' :
                          'available';

                        const displayName = course.name.includes('-')
                          ? course.name.split('-')[0].trim()
                          : course.name;

                        // Convertir el color hex a rgba con opacidad
                        const hexToRgba = (hex, alpha) => {
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                        };

                        const courseColor = course.color || '#6b7280';
                        const bgColor = hexToRgba(courseColor, 0.15);
                        const borderColor = hexToRgba(courseColor, 0.3);

                        return (
                          <div
                            key={idx}
                            className={`course-item ${statusClass}`}
                            style={{
                              backgroundColor: bgColor,
                              borderColor: borderColor
                            }}
                          >
                            <div className="slot-course-name" style={{ color: courseColor }}>
                              {displayName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SimplifiedTechniqueSelector = ({ selectedTechnique, onSelectTechnique, onContinue }) => {
  const [techniques, setTechniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const loadTechniques = async () => {
      try {
        setLoading(true);
        const coursesData = await getCoursesSchedulesGrid();
        console.log('🎨 Técnicas cargadas:', coursesData);
        setTechniques(coursesData);
      } catch (error) {
        console.error('Error al cargar técnicas:', error);
        alert('Hubo un error al cargar las técnicas disponibles.');
      } finally {
        setLoading(false);
      }
    };

    loadTechniques();
  }, []);

  const handleTechniqueClick = (technique) => {
    onSelectTechnique(technique);
  };

  const handleContinue = () => {
    if (!selectedTechnique) {
      alert('⚠️ Por favor selecciona una técnica para continuar.');
      return;
    }
    onContinue && onContinue();
  };

  if (loading) {
    return (
      <div className="simplified-step">
        <div className="step-progress">Paso 1 de 5</div>
        <h2 className="step-title">¿Qué técnica te gustaría aprender?</h2>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Cargando técnicas disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`simplified-step ${showCalendar ? 'calendar-expanded' : ''}`}>
      <div className="step-progress">Paso 1 de 5</div>

      <h2 className="step-title">¿Qué técnica te gustaría aprender?</h2>

      <div className="techniques-grid-simple">
        {techniques.map(technique => (
          <div
            key={technique.id}
            className={`technique-card-simple ${selectedTechnique?.id === technique.id ? 'selected' : ''}`}
            onClick={() => handleTechniqueClick(technique)}
          >
            <div className="technique-icon-large" style={{ color: technique.color }}>
              {/* Mapeo de técnicas a emojis */}
              {technique.name.toLowerCase().includes('óleo') && '🎨'}
              {technique.name.toLowerCase().includes('acuarela') && '💧'}
              {technique.name.toLowerCase().includes('dibujo') && '✏️'}
              {technique.name.toLowerCase().includes('escultura') && '🗿'}
              {!technique.name.toLowerCase().match(/óleo|acuarela|dibujo|escultura/) && '🎨'}
            </div>
            <h3 className="technique-name-large">{technique.name}</h3>
            {selectedTechnique?.id === technique.id && (
              <div className="selected-checkmark">✓</div>
            )}
          </div>
        ))}
      </div>

      <p className="hint-text">💡 Puedes combinar técnicas más adelante</p>

      {/* Calendario informativo colapsible */}
      <CalendarGrid techniques={techniques} showCalendar={showCalendar} setShowCalendar={setShowCalendar} />

      <div className="step-actions-center">
        <button
          className="btn-primary-large"
          onClick={handleContinue}
          disabled={!selectedTechnique}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default SimplifiedTechniqueSelector;
